using Honse.Global.Specification;
using System.Linq.Expressions;

namespace Honse.Engines.Filtering.Product
{
    internal class SpecificationProductByCategory : Specification<Resources.Interfaces.Entities.Product>
    {
        private readonly string categoryName;

        public SpecificationProductByCategory(string categoryName)
        {
            this.categoryName = categoryName;
        }

        public override Expression<Func<Resources.Interfaces.Entities.Product, bool>> Expression =>
            (Resources.Interfaces.Entities.Product product) => product.Category.Name.Contains(categoryName);
    }
}
