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

        public async Task<PaginatedResult<Interfaces.RestaurantCard>> GetPublicRestaurants(int pageSize, int pageNumber)
        {
            var restaurants = await restaurantResource.GetAllEnabled(pageSize, pageNumber);

            // compute IsOpen and MinutesUntilClose
            var now = TimeOnly.FromDateTime(DateTime.Now);

            var cards = restaurants.Result.Select(r =>
            {
                bool isOpen;
                int? minutesUntilClose = null;

                // Handle normal and overnight hours
                if (r.OpeningTime < r.ClosingTime)
                {
                    isOpen = r.IsEnabled && r.OpeningTime <= now && now < r.ClosingTime;
                }
                else if (r.OpeningTime > r.ClosingTime)
                {
                    // Overnight (e.g., 18:00 -> 02:00): open if now >= opening OR now < closing
                    isOpen = r.IsEnabled && (now >= r.OpeningTime || now < r.ClosingTime);
                }
                else
                {
                    // opening == closing: interpret as closed all day
                    isOpen = false;
                }

                if (isOpen)
                {
                    // Compute minutes until close, accounting for overnight wrap
                    var nowSpan = now.ToTimeSpan();
                    var openingSpan = r.OpeningTime.ToTimeSpan();
                    var closingSpan = r.ClosingTime.ToTimeSpan();

                    TimeSpan untilClose;
                    if (r.OpeningTime < r.ClosingTime)
                    {
                        untilClose = closingSpan - nowSpan;
                    }
                    else
                    {
                        // Overnight: closing is next day
                        untilClose = (TimeSpan.FromHours(24) - nowSpan) + closingSpan;
                    }

                    minutesUntilClose = (int)Math.Max(0, untilClose.TotalMinutes);
                }

                return new Interfaces.RestaurantCard
                {
                    Id = r.Id,
                    Name = r.Name,
                    Image = r.Image,
                    IsOpen = isOpen,
                    AverageRating = r.AverageRating,
                    MinutesUntilClose = minutesUntilClose
                };
            }).ToList();

            return new PaginatedResult<Interfaces.RestaurantCard>
            {
                Result = cards,
                PageNumber = restaurants.PageNumber,
                TotalCount = restaurants.TotalCount
            };
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
