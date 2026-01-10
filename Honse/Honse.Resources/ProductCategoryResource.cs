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
        }

        public async Task<IEnumerable<ProductCategory>> GetConfigurationCategories(Configuration configuration)
        {
            var query = dbSet.AsQueryable();
            query = ApplyIncludes(query);

            return await query.Where(t => configuration.CategoryIds.Contains(t.Id)).ToListAsync();
        }
    }
}
