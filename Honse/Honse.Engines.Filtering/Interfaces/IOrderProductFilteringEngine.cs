using Honse.Global.Specification;

namespace Honse.Engines.Filtering.Interfaces
{
    public interface IOrderProductFilteringEngine
    {
        Specification<Resources.Interfaces.Entities.Order> GetSpecification(OrderProductFilterRequest filter);
    }

    public class OrderProductFilterRequest
    {
        public Guid OrderId { get; set; }
        public string? SearchKey { get; set; }
        public decimal? MinPrice { get; set; }
        public decimal? MaxPrice { get; set; }
    }
}
