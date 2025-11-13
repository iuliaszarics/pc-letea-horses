using Honse.Global.Specification;
using System.Linq.Expressions;

namespace Honse.Engines.Filtering.Restaurant
{
    internal class SpecificationRestaurantSearchKey : Specification<Resources.Interfaces.Entities.Restaurant>
    {
        private readonly string searchKey;

        public SpecificationRestaurantSearchKey(string searchKey)
        {
            this.searchKey = searchKey;
        }

        public override Expression<Func<Resources.Interfaces.Entities.Restaurant, bool>> Expression =>
            (Resources.Interfaces.Entities.Restaurant restaurant) =>
                restaurant.Name.Contains(searchKey) ||
                restaurant.CuisineType.Contains(searchKey) ||
                restaurant.Description.Contains(searchKey) ||
                restaurant.Address.Contains(searchKey) ||
                restaurant.City.Contains(searchKey);
    }
}
