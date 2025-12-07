namespace Honse.Resources.Interfaces.Entities
{
    public class Order : Entity
    {
        public Guid RestaurantId { get; set; }

        public string OrderNo { get; set; } = string.Empty;

        public DateTime Timestamp { get; set; } = DateTime.UtcNow;

        public decimal Total { get; set; }

        // Stores the JSON history of statuses
        public string OrderStatus { get; set; } = string.Empty;

        // Flattened Client Info
        public string ClientName { get; set; } = string.Empty;
        
        public string ClientEmail { get; set; } = string.Empty;

        // Stores the JSON Address structure
        public string DeliveryAddress { get; set; } = string.Empty;

        // Nullable timings
        public DateTime? PreparationTime { get; set; }
        
        public DateTime? DeliveryTime { get; set; }

        // Navigation property for EF Core relationship tracking
        // Note: This won't be eagerly loaded unless explicitly included
        public ICollection<OrderProductLight> Products { get; set; } = new List<OrderProductLight>();

        // UserId is inherited from Entity
    }

   
}