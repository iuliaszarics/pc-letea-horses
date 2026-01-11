namespace Honse.Resources.Interfaces
{
    public interface IOrderResource : IFilterResource<Entities.Order>
    {
        Task<Entities.Order?> GetByIdPublic(Guid id);
        Task<IEnumerable<Entities.Order>> GetByRestaurantId(Guid restaurantId);
        Task<IEnumerable<Entities.Order>> GetActiveByRestaurantId(Guid restaurantId);
        Task<IEnumerable<Entities.Order>> GetFinishedByRestaurantId(Guid restaurantId);
    }
}
