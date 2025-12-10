using Honse.Global.Specification;
using System.Linq.Expressions;

namespace Honse.Engines.Filtering.Order
{
    internal class SpecificationOrderByStatus : Specification<Resources.Interfaces.Entities.Order>
    {
        private readonly Global.Order.OrderStatus orderStatus;

        public SpecificationOrderByStatus(Global.Order.OrderStatus orderStatus)
        {
            this.orderStatus = orderStatus;
        }

        public override Expression<Func<Resources.Interfaces.Entities.Order, bool>> Expression =>
            (Resources.Interfaces.Entities.Order order) => order.Status == orderStatus;
    }
}
