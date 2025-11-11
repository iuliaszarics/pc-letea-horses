using Honse.Global.Specification;

namespace Honse.Engines.Filtering.Interfaces
{
    public interface IProductFilteringEngine
    {
        Specification<Resources.Interfaces.Entities.Product> GetSpecification(ProductFilterRequest filter);
    }

    public class ProductFilterRequest
    {
        public Guid UserId { get; set; }
        public string? SearchKey { get; set; }

        public string? CategoryName { get; set; }

        public Guid? CategoryId { get; set; }

        public Guid? RestaurantId { get; set; }

        public bool? IsEnabled { get; set; }

        public decimal? MinPrice { get; set; }

        public decimal? MaxPrice { get; set; }
    }
}
