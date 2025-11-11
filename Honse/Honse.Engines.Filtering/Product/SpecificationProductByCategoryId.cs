using Honse.Global.Specification;
using System.Linq.Expressions;

namespace Honse.Engines.Filtering.Product
{
    internal class SpecificationProductByCategoryId : Specification<Resources.Interfaces.Entities.Product>
    {
        private readonly Guid categoryId;

        public SpecificationProductByCategoryId(Guid categoryId)
        {
            this.categoryId = categoryId;
        }

        public override Expression<Func<Resources.Interfaces.Entities.Product, bool>> Expression =>
            (Resources.Interfaces.Entities.Product product) => product.CategoryId == categoryId;
    }
}
