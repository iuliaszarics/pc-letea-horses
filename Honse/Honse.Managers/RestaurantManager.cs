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
        private readonly IProductResource productResource;
        private readonly Engines.Filtering.Interfaces.IRestaurantFilteringEngine restaurantFilteringEngine;
        private readonly Engines.Validation.Interfaces.IRestaurantValidationEngine restaurantValidationEngine;
        private readonly Engines.Filtering.Interfaces.IProductFilteringEngine productFilteringEngine;

        public RestaurantManager(
            Resources.Interfaces.IRestaurantResource restaurantResource,
            Resources.Interfaces.IProductCategoryResource productCategoryResource,
            IProductResource productResource,
            Engines.Filtering.Interfaces.IRestaurantFilteringEngine restaurantFilteringEngine,
            Engines.Validation.Interfaces.IRestaurantValidationEngine restaurantValidationEngine,
            Engines.Filtering.Interfaces.IProductFilteringEngine productFilteringEngine)
        {
            this.restaurantResource = restaurantResource;
            this.productCategoryResource = productCategoryResource;
            this.productResource = productResource;
            this.restaurantFilteringEngine = restaurantFilteringEngine;
            this.restaurantValidationEngine = restaurantValidationEngine;
            this.productFilteringEngine = productFilteringEngine;
        }

        public async Task<Interfaces.Restaurant> AddRestaurant(CreateRestaurantRequest request)
        {
            restaurantValidationEngine.ValidateCreateRestaurant(request.DeepCopyTo<Engines.Common.CreateRestaurant>());

            var restaurant = request.DeepCopyTo<Resources.Interfaces.Entities.Restaurant>();

            restaurant.Id = Guid.NewGuid();

            // set the ConfigurationId from req
            restaurant.ConfigurationId = request.ConfigurationId;

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
            restaurantValidationEngine.ValidateCreateRestaurant(request.DeepCopyTo<Engines.Common.CreateRestaurant>());

            // Get existing restaurant without tracking to preserve rating fields
            var existingRestaurant = await restaurantResource.GetByIdNoTracking(request.Id, request.UserId);

            if (existingRestaurant == null)
                throw new Exception("Restaurant not found!");

            var restaurant = request.DeepCopyTo<Resources.Interfaces.Entities.Restaurant>();

            // assign the new configuration id
            if(request.ConfigurationId.HasValue)
            {
                restaurant.ConfigurationId = request.ConfigurationId.Value;
            }
            else
            {
                restaurant.ConfigurationId = existingRestaurant.ConfigurationId;
            }

            var updatedRestaurant = await restaurantResource.Update(request.Id, request.UserId, restaurant);

            if (updatedRestaurant == null)
                throw new Exception("Couldn't update restaurant!");

            return updatedRestaurant.DeepCopyTo<Interfaces.Restaurant>();
        }

        public async Task<Interfaces.RestaurantMenu> GetPublicRestaurantMenu(Guid restaurantId)
        {
            // Get restaurant without userId check (public access)
            var restaurant = await restaurantResource.GetByIdPublic(restaurantId);

            if (restaurant == null)
                throw new Exception("Restaurant not found!");

            if (!restaurant.IsEnabled)
                throw new Exception("Restaurant is not available!");

            if (restaurant.Configuration == null)
                throw new Exception("Restaurant must have a configuration selected!");

            // Get all categories for this restaurant
            var categories = await productCategoryResource.GetConfigurationCategories(restaurant.Configuration);

            var specification = productFilteringEngine.GetSpecification(new Engines.Filtering.Interfaces.ProductFilterRequest
            {
                UserId = restaurant.UserId,
                CategoriesIds = categories.Select(category => category.Id).ToList(),
                IsEnabled =  true,
            });

            // Get all enabled products for this restaurant
            var products = await productResource.GetPublicRestaurantProducts(specification);

            // Build the menu structure
            var menu = new Interfaces.RestaurantMenu
            {
                Id = restaurant.Id,
                Name = restaurant.Name,
                Description = restaurant.Description,
                Image = restaurant.Image,
                CuisineType = restaurant.CuisineType,

                // new mapping
                Configuration = restaurant.Configuration
            };

            // Group products by category
            foreach (var category in categories)
            {
                var categoryProducts = products
                    .Where(p => p.CategoryId == category.Id && p.IsEnabled)
                    .Select(p => new Interfaces.MenuItem
                    {
                        Id = p.Id,
                        Name = p.Name,
                        Description = p.Description,
                        Price = p.Price,
                        VAT = p.VAT,
                        Image = p.Image,
                        IsEnabled = p.IsEnabled
                    })
                    .ToList();

                // Only include categories that have products
                if (categoryProducts.Any())
                {
                    menu.Categories.Add(new Interfaces.MenuCategory
                    {
                        Id = category.Id,
                        Name = category.Name,
                        Products = categoryProducts
                    });
                }
            }

            return menu;
        }
    }
}
