using Honse.Global.Specification;

namespace Honse.Engines.Filtering.Interfaces
{
    public interface IRestaurantFilteringEngine
    {
        Specification<Resources.Interfaces.Entities.Restaurant> GetSpecification(RestaurantFilterRequest filter);
    }

    public class RestaurantFilterRequest
    {
        public Guid UserId { get; set; }

        public string? SearchKey { get; set; }

        public string? CuisineType { get; set; }

        public string? City { get; set; }

        public bool? IsOpen { get; set; }

        public bool? IsEnabled { get; set; }

        public float? MinRating { get; set; }
    }
}
