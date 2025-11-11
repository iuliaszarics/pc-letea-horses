using Honse.Global;
using Honse.Global.Extensions;
using Honse.Managers.Interfaces;

namespace Honse.Managers
{
    public class RestaurantManager : Interfaces.IRestaurantManager
    {
        private readonly Resources.Interfaces.IRestaurantResource restaurantResource;
        private readonly Engines.Filtering.Interfaces.IRestaurantFilteringEngine restaurantFilteringEngine;
        private readonly Engines.Validation.Interfaces.IRestaurantValidationEngine restaurantValidationEngine;

        public RestaurantManager(
            Resources.Interfaces.IRestaurantResource restaurantResource,
            Engines.Filtering.Interfaces.IRestaurantFilteringEngine restaurantFilteringEngine,
            Engines.Validation.Interfaces.IRestaurantValidationEngine restaurantValidationEngine)
        {
            this.restaurantResource = restaurantResource;
            this.restaurantFilteringEngine = restaurantFilteringEngine;
            this.restaurantValidationEngine = restaurantValidationEngine;
        }

        public async Task<Interfaces.Restaurant> AddRestaurant(CreateRestaurantRequest request)
        {
            restaurantValidationEngine.ValidateCreateRestaurant(request.DeepCopyTo<Engines.Common.CreateRestaurant>());

            var restaurant = request.DeepCopyTo<Resources.Interfaces.Entities.Restaurant>();

            restaurant.Id = Guid.NewGuid();
            restaurant.IsEnabled = true;

            restaurant = await restaurantResource.Add(restaurant);

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

            var result = restaurants.DeepCopyTo<List<Interfaces.Restaurant>>();

            // Calculate IsOpen for each restaurant
            var now = TimeOnly.FromDateTime(DateTime.Now);
            foreach (var restaurant in result)
            {
                restaurant.IsOpen = CalculateIsOpen(restaurant, now);
            }

            return result;
        }

        private bool CalculateIsOpen(Interfaces.Restaurant restaurant, TimeOnly now)
        {
            if (!restaurant.IsEnabled)
                return false;

            // Handle normal and overnight hours
            if (restaurant.OpeningTime < restaurant.ClosingTime)
            {
                // Normal hours (e.g., 09:00 - 22:00)
                return restaurant.OpeningTime <= now && now < restaurant.ClosingTime;
            }
            else if (restaurant.OpeningTime > restaurant.ClosingTime)
            {
                // Overnight (e.g., 18:00 - 02:00): open if now >= opening OR now < closing
                return now >= restaurant.OpeningTime || now < restaurant.ClosingTime;
            }
            else
            {
                // Opening == closing: interpret as closed all day
                return false;
            }
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
                restaurant.IsOpen = restaurant.IsEnabled && 
                                   restaurant.OpeningTime <= now && 
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

            return updatedRestaurant.DeepCopyTo<Interfaces.Restaurant>();
        }
    }
}
