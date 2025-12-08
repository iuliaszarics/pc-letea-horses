using Honse.Global.Specification;
using System.Linq.Expressions;

namespace Honse.Engines.Filtering.Order
{
    internal class SpecificationOrderSearchKey : Specification<Resources.Interfaces.Entities.Order>
    {
        private readonly string searchKey;

        public SpecificationOrderSearchKey(string searchKey)
        {
            this.searchKey = searchKey;
        }

        public override Expression<Func<Resources.Interfaces.Entities.Order, bool>> Expression =>
            (Resources.Interfaces.Entities.Order order) => 
                order.OrderNo.Contains(searchKey) || 
                order.ClientName.Contains(searchKey) || 
                order.ClientEmail.Contains(searchKey);
    }
}
