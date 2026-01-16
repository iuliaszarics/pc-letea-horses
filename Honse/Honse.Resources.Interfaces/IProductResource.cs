
using Honse.Global.Specification;
using Honse.Resources.Interfaces.Entities;

namespace Honse.Resources.Interfaces
{
    public interface IProductResource : IFilterResource<Entities.Product>
    {
        Task<IEnumerable<Entities.Product>> GetByRestaurantId(Guid restaurantId);
     
        Task<IEnumerable<Product>> GetPublicRestaurantProducts(Specification<Product> specification);
    }
}
