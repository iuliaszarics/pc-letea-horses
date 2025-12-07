using Honse.Resources.Interfaces;
using Honse.Resources.Interfaces.Entities;
using Microsoft.EntityFrameworkCore;

namespace Honse.Resources
{
    public class OrderResource : FilterResource<Order>, IOrderResource
    {
        public OrderResource(AppDbContext dbContext) : base(dbContext)
        {
            dbSet = dbContext.Order;
            includeProperties = new List<System.Linq.Expressions.Expression<Func<Order, object>>> { o => o.Products };
        }

        public Task<Order?> GetByIdPublic(Guid id)
        {
            var query = dbSet.AsQueryable();
            query = ApplyIncludes(query);
            return query.FirstOrDefaultAsync(o => o.Id == id);
        }

        public Task<Order?> GetByIdWithProducts(Guid id)
        {
            return dbSet
                .Include(o => o.Products)
                .FirstOrDefaultAsync(o => o.Id == id);
        }

        public async Task<IEnumerable<Order>> GetByRestaurantId(Guid restaurantId)
        {
            var query = dbSet.AsQueryable();
            query = ApplyIncludes(query);
            return await query
                .Where(o => o.RestaurantId == restaurantId)
                .ToListAsync();
        }

    }
}
