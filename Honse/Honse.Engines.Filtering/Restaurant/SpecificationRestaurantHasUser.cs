using Honse.Global.Specification;
using System.Linq.Expressions;

namespace Honse.Engines.Filtering.Restaurant
{
    internal class SpecificationRestaurantHasUser : Specification<Resources.Interfaces.Entities.Restaurant>
    {
        private readonly Guid userId;

        public SpecificationRestaurantHasUser(Guid userId)
        {
            this.userId = userId;
        }

        public override Expression<Func<Resources.Interfaces.Entities.Restaurant, bool>> Expression =>
            (Resources.Interfaces.Entities.Restaurant restaurant) => restaurant.UserId == userId;
    }
}
