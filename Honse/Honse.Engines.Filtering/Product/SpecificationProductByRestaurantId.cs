using Honse.Global.Specification;
using System.Linq.Expressions;

namespace Honse.Engines.Filtering.Product
{
    internal class SpecificationProductByRestaurantId : Specification<Resources.Interfaces.Entities.Product>
    {
        private readonly Guid restaurantId;

        public SpecificationProductByRestaurantId(Guid restaurantId)
        {
            this.restaurantId = restaurantId;
        }

        public override Expression<Func<Resources.Interfaces.Entities.Product, bool>> Expression =>
            (Resources.Interfaces.Entities.Product product) => product.Category.RestaurantId == restaurantId;
    }
}
