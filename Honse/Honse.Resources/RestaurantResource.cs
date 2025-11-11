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

        public async Task<IEnumerable<Restaurant>> GetAll(Guid userId)
        {
            var query = dbSet.AsNoTracking().AsQueryable();
            query = ApplyIncludes(query);

            // If userId is empty (public access), return all enabled restaurants
            if (userId == Guid.Empty)
            {
                return await query.Where(r => r.IsEnabled).ToListAsync();
            }

            // Otherwise, filter by userId
            return await query.Where(t => t.UserId == userId).ToListAsync();
        }
    }
}
