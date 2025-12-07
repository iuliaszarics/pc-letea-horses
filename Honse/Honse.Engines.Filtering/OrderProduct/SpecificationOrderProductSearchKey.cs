using Honse.Global.Specification;
using System.Linq.Expressions;

namespace Honse.Engines.Filtering.OrderProduct
{
    internal class SpecificationOrderProductSearchKey : Specification<Resources.Interfaces.Entities.OrderProductLight>
    {
        private readonly string searchKey;

        public SpecificationOrderProductSearchKey(string searchKey)
        {
            this.searchKey = searchKey;
        }

        public override Expression<Func<Resources.Interfaces.Entities.OrderProductLight, bool>> Expression =>
            (Resources.Interfaces.Entities.OrderProductLight orderProduct) => orderProduct.Name.Contains(searchKey);
    }
}
