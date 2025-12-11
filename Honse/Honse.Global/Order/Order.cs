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
        public string DeliveryAddress { get; set; } = string.Empty;
        public OrderStatus OrderStatus { get; set; }
        public string StatusHistory { get; set; } = string.Empty; // JSON array of status changes
        public string Products { get; set; } = string.Empty; // JSON array of products
        public decimal Total { get; set; }
        public DateTime? PreparationTime { get; set; }
        public DateTime? DeliveryTime { get; set; }
    }

    public class OrderProduct
    {
        public string Name { get; set; } = string.Empty;
        public decimal Quantity { get; set; }
        public decimal Price { get; set; }
        public decimal VAT { get; set; }
        public decimal Total { get; set; }
        public string Image { get; set; } = string.Empty;
    }

    public class OrderStatusHistoryEntry
    {
        public OrderStatus Status { get; set; }
        public DateTime Timestamp { get; set; }
        public string? Notes { get; set; }
    }

    public static class OrderExtensions
    {
        public static List<OrderProduct> GetProducts(this Order order)
        {
            try
            {
                return JsonSerializer.Deserialize<List<OrderProduct>>(order.Products) 
                    ?? new List<OrderProduct>();
            }
            catch
            {
                return new List<OrderProduct>();
            }
        }

        public static void SetProducts(this Order order, List<OrderProduct> products)
        {
            order.Products = JsonSerializer.Serialize(products);
        }

        public static List<OrderStatusHistoryEntry> GetStatusHistory(this Order order)
        {
            try
            {
                return JsonSerializer.Deserialize<List<OrderStatusHistoryEntry>>(order.StatusHistory) 
                    ?? new List<OrderStatusHistoryEntry>();
            }
            catch
            {
                return new List<OrderStatusHistoryEntry>();
            }
        }

        public static void SetStatusHistory(this Order order, List<OrderStatusHistoryEntry> history)
        {
            order.StatusHistory = JsonSerializer.Serialize(history);
        }

        public static void AddStatusEntry(this Order order, OrderStatus newStatus, string? notes = null)
        {
            var history = order.GetStatusHistory();
            history.Add(new OrderStatusHistoryEntry
            {
                Status = newStatus,
                Timestamp = DateTime.UtcNow,
                Notes = notes
            });
            order.OrderStatus = newStatus;
            order.SetStatusHistory(history);
        }

        public static void InitializeOrder(this Order order)
        {
            order.OrderStatus = OrderStatus.New;
            var initialHistory = new List<OrderStatusHistoryEntry>
            {
                new OrderStatusHistoryEntry
                {
                    Status = OrderStatus.New,
                    Timestamp = DateTime.UtcNow,
                    Notes = "Order created"
                }
            };
            order.SetStatusHistory(initialHistory);
        }
    }
}
