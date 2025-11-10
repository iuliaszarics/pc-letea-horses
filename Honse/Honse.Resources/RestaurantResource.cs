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

        public async Task<Honse.Global.PaginatedResult<Restaurant>> GetAllEnabled(int pageSize, int pageNumber)
        {
            var query = dbSet.AsNoTracking().AsQueryable();
            query = ApplyIncludes(query);

            var filtered = query.Where(r => r.IsEnabled);

            var result = await filtered
                .OrderBy(r => r.Name)
                .Skip((pageNumber - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            int count = await filtered.CountAsync();

            return new Honse.Global.PaginatedResult<Restaurant>
            {
                Result = result,
                PageNumber = pageNumber,
                TotalCount = count
            };
        }
    }
}
