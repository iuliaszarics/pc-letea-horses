using Honse.Global.Specification;
using System.Linq.Expressions;

namespace Honse.Engines.Filtering.Restaurant
{
    internal class SpecificationRestaurantIsEnabled : Specification<Resources.Interfaces.Entities.Restaurant>
    {
        private readonly bool isEnabled;

        public SpecificationRestaurantIsEnabled(bool isEnabled)
        {
            this.isEnabled = isEnabled;
        }

        public override Expression<Func<Resources.Interfaces.Entities.Restaurant, bool>> Expression =>
            (Resources.Interfaces.Entities.Restaurant restaurant) => restaurant.IsEnabled == isEnabled;
    }
}
