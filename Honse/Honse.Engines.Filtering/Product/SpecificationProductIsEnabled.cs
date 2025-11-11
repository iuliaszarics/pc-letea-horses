using Honse.Global.Specification;
using System.Linq.Expressions;

namespace Honse.Engines.Filtering.Product
{
    internal class SpecificationProductIsEnabled : Specification<Resources.Interfaces.Entities.Product>
    {
        private readonly bool isEnabled;

        public SpecificationProductIsEnabled(bool isEnabled)
        {
            this.isEnabled = isEnabled;
        }

        public override Expression<Func<Resources.Interfaces.Entities.Product, bool>> Expression =>
            (Resources.Interfaces.Entities.Product product) => product.IsEnabled == isEnabled;
    }
}
