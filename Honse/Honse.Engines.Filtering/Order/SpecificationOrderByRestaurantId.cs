using Honse.Global.Specification;
using System.Linq.Expressions;

namespace Honse.Engines.Filtering.Order
{
    internal class SpecificationOrderByRestaurantId : Specification<Resources.Interfaces.Entities.Order>
    {
        private readonly Guid restaurantId;

        public SpecificationOrderByRestaurantId(Guid restaurantId)
        {
            this.restaurantId = restaurantId;
        }

        public override Expression<Func<Resources.Interfaces.Entities.Order, bool>> Expression =>
            (Resources.Interfaces.Entities.Order order) => order.RestaurantId == restaurantId;
    }
}
