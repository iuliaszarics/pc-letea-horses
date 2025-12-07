using Honse.Global.Specification;
using System.Linq.Expressions;

namespace Honse.Engines.Filtering.OrderProduct
{
    internal class SpecificationOrderProductByOrderId : Specification<Resources.Interfaces.Entities.OrderProductLight>
    {
        private readonly Guid orderId;

        public SpecificationOrderProductByOrderId(Guid orderId)
        {
            this.orderId = orderId;
        }

        public override Expression<Func<Resources.Interfaces.Entities.OrderProductLight, bool>> Expression =>
            (Resources.Interfaces.Entities.OrderProductLight orderProduct) => orderProduct.OrderId == orderId;
    }
}
