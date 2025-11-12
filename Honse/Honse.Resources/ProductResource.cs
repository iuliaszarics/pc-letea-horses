using Honse.Resources.Interfaces;
using Honse.Resources.Interfaces.Entities;
using Microsoft.EntityFrameworkCore;

namespace Honse.Resources
{
    public class ProductResource : FilterResource<Product>, IProductResource
    {
        public ProductResource(AppDbContext dbContext) : base(dbContext)
        {
            dbSet = dbContext.Product;

            includeProperties = [(Product product) => product.Category];

        }

        public async Task<IEnumerable<Product>> GetPublicRestaurantProducts(Guid restaurantId)
        {
            var query = dbSet.AsQueryable();
            query = ApplyIncludes(query);

            return await query
                .Where(p => p.Category.RestaurantId == restaurantId && p.IsEnabled)
                .ToListAsync();
        }
    }
}
