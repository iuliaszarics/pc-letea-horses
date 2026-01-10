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
            includeProperties = [(Restaurant restaurant) => restaurant.Configuration];
        }

        public async Task<Restaurant?> GetByIdPublic(Guid id)
        {
            var query = dbSet.AsQueryable();
            query = ApplyIncludes(query);

            return await query
                .Include(r => r.Configuration) // added .include
                .FirstOrDefaultAsync(r => r.Id == id);
        }
    }
}
