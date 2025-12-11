using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json;

namespace Honse.Global.Order
{
    public class Order
    {
        public Guid Id { get; set; }
        public Guid RestaurantId { get; set; }
        public Guid UserId { get; set; }
        public string OrderNo { get; set; } = string.Empty;
        public DateTime Timestamp { get; set; }
        public string ClientName { get; set; } = string.Empty;
        public string ClientEmail { get; set; } = string.Empty;
        public Global.Address DeliveryAddress { get; set; }
        public OrderStatus OrderStatus { get; set; }
        public List<OrderStatusHistory> StatusHistory { get; set; }
        public List<OrderProduct> Products { get; set; }
        public decimal Total { get; set; }
        public DateTime? PreparationTime { get; set; }
        public DateTime? DeliveryTime { get; set; }
    }

    public class OrderProduct
    {
        public Guid Id { get; set; }
        public Guid UserId { get; set; }
        public string Name { get; set; } = string.Empty;
        public decimal Quantity { get; set; }
        public decimal Price { get; set; }
        public decimal VAT { get; set; }
        public decimal Total { get; set; }
        public string Image { get; set; } = string.Empty;
    }

    public class OrderStatusHistory
    {
        public OrderStatus Status { get; set; }
        public DateTime Timestamp { get; set; }
        public string? Notes { get; set; }
    }
}
