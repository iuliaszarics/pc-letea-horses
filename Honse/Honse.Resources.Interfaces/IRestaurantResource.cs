namespace Honse.Resources.Interfaces
{
    public interface IRestaurantResource : IFilterResource<Entities.Restaurant>
    {
        // Returns enabled restaurants across all users (publicly visible)
        Task<Global.PaginatedResult<Entities.Restaurant>> GetAllEnabled(int pageSize, int pageNumber);
    }
}
