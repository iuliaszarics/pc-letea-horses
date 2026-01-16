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
        }

        public Task<Order?> GetByIdPublic(Guid id)
        {
            return dbSet.FirstOrDefaultAsync(o => o.Id == id);
        }

        public async Task<IEnumerable<Order>> GetByRestaurantId(Guid restaurantId)
        {
            return await dbSet
                .Where(o => o.RestaurantId == restaurantId)
                .ToListAsync();
        }

        public async Task<IEnumerable<Order>> GetActiveByRestaurantId(Guid restaurantId)
        {
            return await dbSet
                .Where(o => o.RestaurantId == restaurantId &&
                            o.OrderStatus != Global.Order.OrderStatus.Finished &&
                            o.OrderStatus != Global.Order.OrderStatus.Cancelled)
                .ToListAsync();
        }

        public async Task<IEnumerable<Order>> GetFinishedByRestaurantId(Guid restaurantId)
        {
            return await dbSet
                .Where(o => o.RestaurantId == restaurantId &&
                            (o.OrderStatus == Global.Order.OrderStatus.Finished ||
                             o.OrderStatus == Global.Order.OrderStatus.Cancelled))
                .OrderBy(o => o.Timestamp)
                .ToListAsync();
        }
    }
}
