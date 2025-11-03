using Honse.Global.Specification;
using System.Linq.Expressions;

namespace Honse.Engines.Filtering.Restaurant
{
    internal class SpecificationRestaurantCuisineType : Specification<Resources.Interfaces.Entities.Restaurant>
    {
        private readonly string cuisineType;

        public SpecificationRestaurantCuisineType(string cuisineType)
        {
            this.cuisineType = cuisineType;
        }

        public override Expression<Func<Resources.Interfaces.Entities.Restaurant, bool>> Expression =>
            (Resources.Interfaces.Entities.Restaurant restaurant) => restaurant.CuisineType == cuisineType;
    }
}
