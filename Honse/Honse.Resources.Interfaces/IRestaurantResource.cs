namespace Honse.Resources.Interfaces
{
    public interface IRestaurantResource : IFilterResource<Entities.Restaurant>
    {
        Task<Entities.Restaurant?> GetByIdPublic(Guid id);
    }
}
