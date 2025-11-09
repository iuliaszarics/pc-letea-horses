using Honse.Global.Specification;
using System.Linq.Expressions;

namespace Honse.Engines.Filtering.Restaurant
{
    internal class SpecificationRestaurantMinRating : Specification<Resources.Interfaces.Entities.Restaurant>
    {
        private readonly float minRating;

        public SpecificationRestaurantMinRating(float minRating)
        {
            this.minRating = minRating;
        }

        public override Expression<Func<Resources.Interfaces.Entities.Restaurant, bool>> Expression =>
            (Resources.Interfaces.Entities.Restaurant restaurant) => restaurant.AverageRating >= minRating;
    }
}
