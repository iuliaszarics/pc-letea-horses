namespace Honse.Resources.Interfaces
{
    public interface IOrderResource : IFilterResource<Entities.Order>
    {
        Task<Entities.Order?> GetByIdPublic(Guid id);
        Task<Entities.Order?> GetByIdWithProducts(Guid id);
        Task<IEnumerable<Entities.Order>> GetByRestaurantId(Guid restaurantId);
    }
}
