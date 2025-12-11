
using Honse.Resources.Interfaces;
using Honse.Resources.Interfaces.Entities;
using Microsoft.EntityFrameworkCore;

namespace Honse.Resources
{
    public class OrderConfirmationTokenResource : Resource<Interfaces.Entities.OrderConfirmationToken>, Interfaces.IOrderConfirmationTokenResource
    {
        public OrderConfirmationTokenResource(AppDbContext dbContext) : base(dbContext)
        {
            dbSet = dbContext.OrderConfirmationToken;
        }

        public async Task<bool> DeleteRange(IEnumerable<OrderConfirmationToken> tokens)
        {
            dbSet.RemoveRange(tokens.ToArray());

            await dbContext.SaveChangesAsync();

            return true;
        }

        public async Task<IEnumerable<OrderConfirmationToken>> GetExpiredTokens()
        {
            return await dbSet.Where(token => token.ExpiresAt < DateTime.UtcNow && !token.Used).ToListAsync();
        }
    }
}
