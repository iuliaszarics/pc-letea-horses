using Honse.Global.Specification;
using System.Linq.Expressions;

namespace Honse.Engines.Filtering.Order
{
    internal class SpecificationOrderHasUser : Specification<Resources.Interfaces.Entities.Order>
    {
        private readonly Guid userId;

        public SpecificationOrderHasUser(Guid userId)
        {
            this.userId = userId;
        }

        public override Expression<Func<Resources.Interfaces.Entities.Order, bool>> Expression =>
            (Resources.Interfaces.Entities.Order order) => order.UserId == userId;
    }
}
