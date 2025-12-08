using Honse.Global.Order;

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
        public string StatusHistory { get; set; } = string.Empty;

        // Flattened Client Info
        public string ClientName { get; set; } = string.Empty;
        
        public string ClientEmail { get; set; } = string.Empty;

        // Stores the JSON Address structure
        public string DeliveryAddress { get; set; } = string.Empty;

        // Stores the JSON array of products
        public string Products { get; set; } = string.Empty;

        // Nullable timings
        public DateTime? PreparationTime { get; set; }
        
        public DateTime? DeliveryTime { get; set; }

        // UserId is inherited from Entity
    }
}