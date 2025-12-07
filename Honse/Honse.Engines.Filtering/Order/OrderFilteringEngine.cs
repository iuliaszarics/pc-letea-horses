using Honse.Engines.Filtering.Interfaces;
using Honse.Global.Specification;

namespace Honse.Engines.Filtering.Order
{
    public class OrderFilteringEngine : IOrderFilteringEngine
    {
        public Specification<Resources.Interfaces.Entities.Order> GetSpecification(OrderFilterRequest filter)
        {
            Specification<Resources.Interfaces.Entities.Order> specification = new SpecificationOrderHasUser(filter.UserId);

            if (filter.RestaurantId.HasValue)
                specification = specification.And(new SpecificationOrderByRestaurantId(filter.RestaurantId.Value));

            if (!string.IsNullOrEmpty(filter.OrderStatus))
                specification = specification.And(new SpecificationOrderByStatus(filter.OrderStatus));

            if (filter.FromDate.HasValue || filter.ToDate.HasValue)
                specification = specification.And(new SpecificationOrderByDateRange(filter.FromDate, filter.ToDate));

            if (!string.IsNullOrEmpty(filter.SearchKey))
                specification = specification.And(new SpecificationOrderSearchKey(filter.SearchKey));

            return specification;
        }
    }
}
