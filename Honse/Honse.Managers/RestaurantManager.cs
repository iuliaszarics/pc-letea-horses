using Honse.Global;
using Honse.Global.Extensions;
using Honse.Managers.Interfaces;
using Honse.Resources.Interfaces;

namespace Honse.Managers
{
    public class RestaurantManager : Interfaces.IRestaurantManager
    {
        private readonly Resources.Interfaces.IRestaurantResource restaurantResource;
        private readonly IProductCategoryResource productCategoryResource;
        private readonly Engines.Filtering.Interfaces.IRestaurantFilteringEngine restaurantFilteringEngine;
        private readonly Engines.Validation.Interfaces.IRestaurantValidationEngine restaurantValidationEngine;

        public RestaurantManager(
            Resources.Interfaces.IRestaurantResource restaurantResource,
            Resources.Interfaces.IProductCategoryResource productCategoryResource,
            Engines.Filtering.Interfaces.IRestaurantFilteringEngine restaurantFilteringEngine,
            Engines.Validation.Interfaces.IRestaurantValidationEngine restaurantValidationEngine)
        {
            this.restaurantResource = restaurantResource;
            this.productCategoryResource = productCategoryResource;
            this.restaurantFilteringEngine = restaurantFilteringEngine;
            this.restaurantValidationEngine = restaurantValidationEngine;
        }

        public async Task<Interfaces.Restaurant> AddRestaurant(CreateRestaurantRequest request)
        {
            restaurantValidationEngine.ValidateCreateRestaurant(request.DeepCopyTo<Engines.Common.CreateRestaurant>());

            var restaurant = request.DeepCopyTo<Resources.Interfaces.Entities.Restaurant>();

            restaurant.Id = Guid.NewGuid();

            restaurant = await restaurantResource.Add(restaurant);

            // Change the restaurant Ids for the categories in the request
            foreach (Guid categoryId in request.CategoryIds)
            {
                var category = await productCategoryResource.GetByIdNoTracking(categoryId, request.UserId);

                if (category != null)
                {
                    category.RestaurantId = restaurant.Id;
                    category.Restaurant = null;
                    
                    await productCategoryResource.Update(categoryId, request.UserId, category);
                }
            }

            return restaurant.DeepCopyTo<Interfaces.Restaurant>();
        }

        public async Task DeleteRestaurant(Guid id, Guid userId)
        {
            bool result = await restaurantResource.Delete(id, userId);

            if (!result)
                throw new Exception("Couldn't delete restaurant!");
        }

        public async Task<List<Interfaces.Restaurant>> GetAllRestaurants(Guid userId)
        {
            var restaurants = await restaurantResource.GetAll(userId);

            return restaurants.DeepCopyTo<List<Interfaces.Restaurant>>();
        }

        public async Task<Interfaces.Restaurant> GetRestaurantById(Guid id, Guid userId)
        {
            var restaurant = await restaurantResource.GetById(id, userId);

            if (restaurant == null)
                throw new Exception("Restaurant not found!");

            return restaurant.DeepCopyTo<Interfaces.Restaurant>();
        }

        public async Task<PaginatedResult<Interfaces.Restaurant>> FilterRestaurants(RestaurantFilterRequest request)
        {
            var specification = restaurantFilteringEngine.GetSpecification(request.DeepCopyTo<Engines.Filtering.Interfaces.RestaurantFilterRequest>());

            var restaurants = await restaurantResource.Filter(specification, request.PageSize, request.PageNumber);

            return restaurants.DeepCopyTo<PaginatedResult<Interfaces.Restaurant>>();
        }

        public async Task<PaginatedResult<Interfaces.Restaurant>> FilterPublicRestaurants(PublicRestaurantFilterRequest request)
        {
            var specification = restaurantFilteringEngine.GetSpecification(request.DeepCopyTo<Engines.Filtering.Interfaces.PublicRestaurantFilterRequest>());

            var restaurants = await restaurantResource.Filter(specification, request.PageSize, request.PageNumber);

            var result = restaurants.DeepCopyTo<PaginatedResult<Interfaces.Restaurant>>();

            // Calculate IsOpen for each restaurant
            var now = TimeOnly.FromDateTime(DateTime.Now);
            foreach (var restaurant in result.Result)
            {
                // Simple calculation: openingTime < closingTime (no overnight hours)
                restaurant.IsOpen = restaurant.OpeningTime <= now && 
                                   now < restaurant.ClosingTime;
            }

            return result;
        }

        public async Task<Interfaces.Restaurant> UpdateRestaurant(UpdateRestaurantRequest request)
        {
            // Get existing restaurant without tracking to preserve rating fields
            var existingRestaurant = await restaurantResource.GetByIdNoTracking(request.Id, request.UserId);

            if (existingRestaurant == null)
                throw new Exception("Restaurant not found!");

            var restaurant = request.DeepCopyTo<Resources.Interfaces.Entities.Restaurant>();

            // Preserve the existing rating and review count
            restaurant.AverageRating = existingRestaurant.AverageRating;
            restaurant.TotalReviews = existingRestaurant.TotalReviews;

            var updatedRestaurant = await restaurantResource.Update(request.Id, request.UserId, restaurant);

            if (updatedRestaurant == null)
                throw new Exception("Couldn't update restaurant!");

            // Get all restaurant categories, and 'unselect' the categories that aren't in the request

            var categories = await productCategoryResource.GetRestaurantCategories(request.UserId, request.Id);

            foreach (var category in categories.Where(category => !request.CategoryIds.Contains(category.Id)))
            {
                category.RestaurantId = null;

                await productCategoryResource.Update(category.Id, request.UserId, category);
            }

            // Change the restaurant Ids for the categories in the request
            foreach (Guid categoryId in request.CategoryIds.Where(id => !categories.Any(category => category.Id == id)))
            {
                var category = await productCategoryResource.GetByIdNoTracking(categoryId, request.UserId);

                if (category != null)
                {
                    category.RestaurantId = restaurant.Id;
                    category.Restaurant = null;

                    await productCategoryResource.Update(category.Id, request.UserId, category);
                }
            }

            return updatedRestaurant.DeepCopyTo<Interfaces.Restaurant>();
        }
    }
}
