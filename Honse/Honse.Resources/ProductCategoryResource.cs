using Honse.Resources.Interfaces;
using Honse.Resources.Interfaces.Entities;
using Microsoft.EntityFrameworkCore;

namespace Honse.Resources
{
    public class ProductCategoryResource : Resource<Interfaces.Entities.ProductCategory>, IProductCategoryResource
    {
        public ProductCategoryResource(AppDbContext dbContext) : base(dbContext)
        {
            dbSet = dbContext.ProductCategory;

            includeProperties = [(ProductCategory category) => category.Restaurant];
        }

        public async Task<IEnumerable<ProductCategory>> GetRestaurantCategories(Guid userId, Guid restaurantId)
        {
            var query = dbSet.AsQueryable();
            query = ApplyIncludes(query);

            return await query.Where(t => t.UserId == userId && t.RestaurantId == restaurantId).ToListAsync();
        }

        public async Task<IEnumerable<ProductCategory>> GetPublicRestaurantCategories(Guid restaurantId)
        {
            var query = dbSet.AsQueryable();
            query = ApplyIncludes(query);

            return await query.Where(t => t.RestaurantId == restaurantId).ToListAsync();
        }
    }
}
