using Honse.Resources.Interfaces;
using Honse.Resources.Interfaces.Entities;
using Microsoft.EntityFrameworkCore;

namespace Honse.Resources
{
    public class RestaurantResource : FilterResource<Restaurant>, IRestaurantResource
    {
        public RestaurantResource(AppDbContext dbContext) : base(dbContext)
        {
            dbSet = dbContext.Restaurant;
        }

        public async Task<Restaurant?> GetByIdPublic(Guid id)
        {
            return await dbSet.FirstOrDefaultAsync(r => r.Id == id);
        }
    }
}
