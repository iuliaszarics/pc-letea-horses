using Honse.Resources.Interfaces;
using Honse.Resources.Interfaces.Entities;

namespace Honse.Resources
{
    public class RestaurantResource : FilterResource<Restaurant>,IRestaurantResource
    {
        public RestaurantResource(AppDbContext dbContext)  : base(dbContext) {
            dbSet = dbContext.Restaurant;

            includeProperties = [(Restaurant restaurant) => restaurant.]
        }
    }
}
