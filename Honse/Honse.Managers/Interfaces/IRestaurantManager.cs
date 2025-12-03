
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

        Task<Global.PaginatedResult<Restaurant>> FilterPublicRestaurants(PublicRestaurantFilterRequest request);

        Task<RestaurantMenu> GetPublicRestaurantMenu(Guid restaurantId);
    }

    public class Restaurant
    {
        public Guid Id { get; set; }

        public Guid UserId { get; set; }

        public string Name { get; set; } = string.Empty;

        public string Description { get; set; } = string.Empty;

        public required Global.Address Address { get; set; }

        public string Phone { get; set; } = string.Empty;

        public string Email { get; set; } = string.Empty;

        public string Image { get; set; } = string.Empty;

        public string CuisineType { get; set; } = string.Empty;

        public float AverageRating { get; set; }

        public int TotalReviews { get; set; }

        public bool IsEnabled { get; set; }

        public TimeOnly OpeningTime { get; set; }

        public TimeOnly ClosingTime { get; set; }

        public bool IsOpen { get; set; }
    }

    public class CreateRestaurantRequest
    {
        public Guid UserId { get; set; }

        public string Name { get; set; } = string.Empty;

        public string Description { get; set; } = string.Empty;

        public Global.Address Address { get; set; }

        public string Phone { get; set; } = string.Empty;

        public string Email { get; set; } = string.Empty;

        public string Image { get; set; } = string.Empty;

        public string CuisineType { get; set; } = string.Empty;

        public TimeOnly OpeningTime { get; set; }

        public TimeOnly ClosingTime { get; set; }

        public List<Guid> CategoryIds { get; set; } = new List<Guid>();
    }

    public class UpdateRestaurantRequest
    {
        public Guid Id { get; set; }

        public Guid UserId { get; set; }

        public string Name { get; set; } = string.Empty;

        public string Description { get; set; } = string.Empty;

        public Global.Address Address { get; set; }

        public string Phone { get; set; } = string.Empty;

        public string Email { get; set; } = string.Empty;

        public string Image { get; set; } = string.Empty;

        public string CuisineType { get; set; } = string.Empty;

        public bool IsEnabled { get; set; }

        public TimeOnly OpeningTime { get; set; }

        public TimeOnly ClosingTime { get; set; }

        public List<Guid> CategoryIds { get; set; } = new List<Guid>();

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

    public class PublicRestaurantFilterRequest
    {
        public string? SearchKey { get; set; }

        public string? CuisineType { get; set; }

        public string? City { get; set; }

        public bool? IsOpen { get; set; }

        public float? MinRating { get; set; }

        public int PageSize { get; set; }

        public int PageNumber { get; set; }
    }

    public class RestaurantMenu
    {
        public Guid Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string Image { get; set; } = string.Empty;
        public string CuisineType { get; set; } = string.Empty;
        public List<MenuCategory> Categories { get; set; } = new List<MenuCategory>();
    }

    public class MenuCategory
    {
        public Guid Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public List<MenuItem> Products { get; set; } = new List<MenuItem>();
    }

    public class MenuItem
    {
        public Guid Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public decimal Price { get; set; }
        public decimal VAT { get; set; }
        public string Image { get; set; } = string.Empty;
        public bool IsEnabled { get; set; }
    }
}
