using Honse.Global.Specification;
using System.Linq.Expressions;

namespace Honse.Engines.Filtering.OrderProduct
{
    internal class SpecificationOrderProductPriceRange : Specification<Resources.Interfaces.Entities.OrderProductLight>
    {
        private readonly decimal? minPrice;
        private readonly decimal? maxPrice;

        public SpecificationOrderProductPriceRange(decimal? minPrice, decimal? maxPrice)
        {
            this.minPrice = minPrice;
            this.maxPrice = maxPrice;
        }

        public override Expression<Func<Resources.Interfaces.Entities.OrderProductLight, bool>> Expression =>
            (Resources.Interfaces.Entities.OrderProductLight orderProduct) =>
                (!minPrice.HasValue || orderProduct.Price >= minPrice.Value) &&
                (!maxPrice.HasValue || orderProduct.Price <= maxPrice.Value);
    }
}
