using Honse.Global.Specification;
using System.Linq.Expressions;

namespace Honse.Engines.Filtering.Restaurant
{
    internal class SpecificationRestaurantIsOpen : Specification<Resources.Interfaces.Entities.Restaurant>
    {
        private readonly bool isOpen;
        private readonly TimeOnly currentTime;

        public SpecificationRestaurantIsOpen(bool isOpen)
        {
            this.isOpen = isOpen;
            this.currentTime = TimeOnly.FromDateTime(DateTime.Now);
        }

        public override Expression<Func<Resources.Interfaces.Entities.Restaurant, bool>> Expression =>
            (Resources.Interfaces.Entities.Restaurant restaurant) => 
                isOpen 
                    ? restaurant.IsEnabled && restaurant.OpeningTime <= currentTime && currentTime < restaurant.ClosingTime
                    : !(restaurant.IsEnabled && restaurant.OpeningTime <= currentTime && currentTime < restaurant.ClosingTime);
    }
}
