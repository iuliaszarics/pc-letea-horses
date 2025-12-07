using Honse.Engines.Filtering.Interfaces;
using Honse.Global.Specification;

namespace Honse.Engines.Filtering.OrderProduct
{
    public class OrderProductFilteringEngine : IOrderProductFilteringEngine
    {
        public Specification<Resources.Interfaces.Entities.OrderProductLight> GetSpecification(OrderProductFilterRequest filter)
        {
            Specification<Resources.Interfaces.Entities.OrderProductLight> specification = new SpecificationOrderProductByOrderId(filter.OrderId);

            if (!string.IsNullOrEmpty(filter.SearchKey))
                specification = specification.And(new SpecificationOrderProductSearchKey(filter.SearchKey));

            if (filter.MinPrice.HasValue || filter.MaxPrice.HasValue)
                specification = specification.And(new SpecificationOrderProductPriceRange(filter.MinPrice, filter.MaxPrice));

            return specification;
        }
    }
}
