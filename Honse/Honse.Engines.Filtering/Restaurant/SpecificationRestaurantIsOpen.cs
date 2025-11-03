using Honse.Global.Specification;
using System.Linq.Expressions;

namespace Honse.Engines.Filtering.Restaurant
{
    internal class SpecificationRestaurantIsOpen : Specification<Resources.Interfaces.Entities.Restaurant>
    {
        private readonly bool isOpen;

        public SpecificationRestaurantIsOpen(bool isOpen)
        {
            this.isOpen = isOpen;
        }

        public override Expression<Func<Resources.Interfaces.Entities.Restaurant, bool>> Expression =>
            (Resources.Interfaces.Entities.Restaurant restaurant) => restaurant.IsOpen == isOpen;
    }
}
