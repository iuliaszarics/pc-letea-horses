using Honse.Resources.Interfaces;
using Honse.Resources.Interfaces.Entities;

namespace Honse.Resources
{
    public class ProductResource : FilterResource<Product>, IProductResource
    {
        public ProductResource(AppDbContext dbContext) : base(dbContext)
        {
            dbSet = dbContext.Product;

            includeProperties = [(Product product) => product.Category];

        }
    }
}
