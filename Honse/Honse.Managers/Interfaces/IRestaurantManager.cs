
namespace Honse.Managers.Interfaces
{
    public interface IRestaurantManager
    {
        Task<Restaurant> AddRestaurant(CreateRestaurantRequest request);

        Task<Restaurant> GetRestaurantById(Guid id, Guid userId);

        Task<Restaurant> UpdateRestaurant(UpdateRestaurantRequest request);

        Task DeleteRestaurant(Guid id, Guid userId);

        Task<List<Restaurant>> GetAllRestaurants(Guid userId);

        Task<Global.PaginatedResult<Restaurant>> FilterRestaurants(RestaurantFilterRequest request);
    }

    public class Restaurant
    {
        public Guid Id { get; set; }

        public Guid UserId { get; set; }

        public string Name { get; set; } = string.Empty;

        public string Description { get; set; } = string.Empty;

        public string Address { get; set; } = string.Empty;

        public string City { get; set; } = string.Empty;

        public string PostalCode { get; set; } = string.Empty;

        public string Phone { get; set; } = string.Empty;

        public string Email { get; set; } = string.Empty;

        public string Image { get; set; } = string.Empty;

        public string CuisineType { get; set; } = string.Empty;

        public float AverageRating { get; set; }

        public int TotalReviews { get; set; }

        public bool IsEnabled { get; set; }

        public TimeOnly OpeningTime { get; set; }

        public TimeOnly ClosingTime { get; set; }
    }

    public class CreateRestaurantRequest
    {
        public Guid UserId { get; set; }

        public string Name { get; set; } = string.Empty;

        public string Description { get; set; } = string.Empty;

        public string Address { get; set; } = string.Empty;

        public string City { get; set; } = string.Empty;

        public string PostalCode { get; set; } = string.Empty;

        public string Phone { get; set; } = string.Empty;

        public string Email { get; set; } = string.Empty;

        public string Image { get; set; } = string.Empty;

        public string CuisineType { get; set; } = string.Empty;

        public TimeOnly OpeningTime { get; set; }

        public TimeOnly ClosingTime { get; set; }
    }

    public class UpdateRestaurantRequest
    {
        public Guid Id { get; set; }

        public Guid UserId { get; set; }

        public string Name { get; set; } = string.Empty;

        public string Description { get; set; } = string.Empty;

        public string Address { get; set; } = string.Empty;

        public string City { get; set; } = string.Empty;

        public string PostalCode { get; set; } = string.Empty;

        public string Phone { get; set; } = string.Empty;

        public string Email { get; set; } = string.Empty;

        public string Image { get; set; } = string.Empty;

        public string CuisineType { get; set; } = string.Empty;

        public bool IsEnabled { get; set; }

        public TimeOnly OpeningTime { get; set; }

        public TimeOnly ClosingTime { get; set; }
    }

    public class RestaurantFilterRequest
    {
        public Guid UserId { get; set; }

        public string? SearchKey { get; set; }

        public string? CuisineType { get; set; }

        public string? City { get; set; }

        public bool? IsEnabled { get; set; }

        public float? MinRating { get; set; }

        public int PageSize { get; set; }

        public int PageNumber { get; set; }
    }
}
