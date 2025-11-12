
namespace Honse.Resources.Interfaces
{
    public interface IProductCategoryResource : IResource<Entities.ProductCategory>
    {
        Task<IEnumerable<Entities.ProductCategory>> GetRestaurantCategories(Guid userId, Guid restaurantId);
        
        Task<IEnumerable<Entities.ProductCategory>> GetPublicRestaurantCategories(Guid restaurantId);
    }
}
