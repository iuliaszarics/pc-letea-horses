
namespace Honse.Resources.Interfaces
{
    public interface IProductResource : IFilterResource<Entities.Product>
    {
        Task<IEnumerable<Entities.Product>> GetPublicRestaurantProducts(Guid restaurantId);

        Task<IEnumerable<Entities.Product>> GetByRestaurantId(Guid restaurantId);
    }
}
