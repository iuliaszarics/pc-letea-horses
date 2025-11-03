using Honse.Global.Specification;
using System.Linq.Expressions;

namespace Honse.Engines.Filtering.Restaurant
{
    internal class SpecificationRestaurantCity : Specification<Resources.Interfaces.Entities.Restaurant>
    {
        private readonly string city;

        public SpecificationRestaurantCity(string city)
        {
            this.city = city;
        }

        public override Expression<Func<Resources.Interfaces.Entities.Restaurant, bool>> Expression =>
            (Resources.Interfaces.Entities.Restaurant restaurant) => restaurant.City == city;
    }
}
