using Honse.Global.Specification;
using System.Linq.Expressions;

namespace Honse.Engines.Filtering.Order
{
    internal class SpecificationOrderByDateRange : Specification<Resources.Interfaces.Entities.Order>
    {
        private readonly DateTime? fromDate;
        private readonly DateTime? toDate;

        public SpecificationOrderByDateRange(DateTime? fromDate, DateTime? toDate)
        {
            this.fromDate = fromDate;
            this.toDate = toDate;
        }

        public override Expression<Func<Resources.Interfaces.Entities.Order, bool>> Expression =>
            (Resources.Interfaces.Entities.Order order) =>
                (!fromDate.HasValue || order.Timestamp >= fromDate.Value) &&
                (!toDate.HasValue || order.Timestamp <= toDate.Value);
    }
}
