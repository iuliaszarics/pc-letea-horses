using Honse.Global.Specification;
using System.Linq.Expressions;

namespace Honse.Engines.Filtering.Product
{
    internal class SpecificationProductPriceRange : Specification<Resources.Interfaces.Entities.Product>
    {
        private readonly decimal? minPrice;
        private readonly decimal? maxPrice;

        public SpecificationProductPriceRange(decimal? minPrice, decimal? maxPrice)
        {
            this.minPrice = minPrice;
            this.maxPrice = maxPrice;
        }

        public override Expression<Func<Resources.Interfaces.Entities.Product, bool>> Expression =>
            (Resources.Interfaces.Entities.Product product) =>
                (!minPrice.HasValue || product.Price >= minPrice.Value) &&
                (!maxPrice.HasValue || product.Price <= maxPrice.Value);
    }
}
