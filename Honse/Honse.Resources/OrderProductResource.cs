using Honse.Resources.Interfaces;
using Honse.Resources.Interfaces.Entities;
using Microsoft.EntityFrameworkCore;

namespace Honse.Resources
{
    public class OrderProductResource : FilterResource<OrderProductLight>, IOrderProductResource
    {
        public OrderProductResource(AppDbContext dbContext) : base(dbContext)
        {
            dbSet = dbContext.OrderProductLight;
            includeProperties = new List<System.Linq.Expressions.Expression<Func<OrderProductLight, object>>>
            {
                op => op.Order
            };
        }

        public Task<OrderProductLight?> GetByIdPublic(Guid id)
        {
            var query = dbSet.AsQueryable();
            query = ApplyIncludes(query);
            return query.FirstOrDefaultAsync(o => o.Id == id);
        }

        public async Task<IEnumerable<OrderProductLight>> GetByOrderId(Guid orderId)
        {
            return await dbSet
                .Where(op => op.OrderId == orderId)
                .ToListAsync();
        }

    }
}
