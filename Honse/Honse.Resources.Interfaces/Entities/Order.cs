using Honse.Global.Order;
using System.ComponentModel.DataAnnotations.Schema;

namespace Honse.Resources.Interfaces.Entities
{
    public class Order : Entity
    {
        public Guid RestaurantId { get; set; }

        public string OrderNo { get; set; } = string.Empty;

        public DateTime Timestamp { get; set; } = DateTime.UtcNow;

        public decimal Total { get; set; }

        // Current status as enum
        public OrderStatus OrderStatus { get; set; } = OrderStatus.New;

        // Stores the JSON history of status changes
        public List<OrderStatusHistory> StatusHistory { get; set; } = [];

        // Flattened Client Info
        public string ClientName { get; set; } = string.Empty;
        
        public string ClientEmail { get; set; } = string.Empty;

        // Stores the JSON Address structure
        public Global.Address DeliveryAddress { get; set; }

        // Stores the JSON array of products
        public List<OrderProduct> Products { get; set; } = [];

        // Nullable timings
        public DateTime? PreparationTime { get; set; }
        
        public DateTime? DeliveryTime { get; set; }

        // UserId is inherited from Entity
    }
}