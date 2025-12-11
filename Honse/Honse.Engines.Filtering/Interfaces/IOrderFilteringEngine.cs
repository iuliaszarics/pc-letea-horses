using Honse.Global.Specification;
using Honse.Global.Order;

namespace Honse.Engines.Filtering.Interfaces
{
    public interface IOrderFilteringEngine
    {
        Specification<Resources.Interfaces.Entities.Order> GetSpecification(OrderFilterRequest filter);
    }

    public class OrderFilterRequest
    {
        public Guid UserId { get; set; }
        public Guid? RestaurantId { get; set; }
        public OrderStatus? OrderStatus { get; set; }
        public DateTime? FromDate { get; set; }
        public DateTime? ToDate { get; set; }
        public string? SearchKey { get; set; }
    }
}
