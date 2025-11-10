using Honse.Resources.Interfaces;
using Honse.Resources.Interfaces.Entities;

namespace Honse.Resources
{
    public class ProductCategoryResource : Resource<Interfaces.Entities.ProductCategory>, IProductCategoryResource
    {
        public ProductCategoryResource(AppDbContext dbContext) : base(dbContext)
        {
            dbSet = dbContext.ProductCategory;

            includeProperties = [(ProductCategory category) => category.Restaurant];
        }
    }
}
