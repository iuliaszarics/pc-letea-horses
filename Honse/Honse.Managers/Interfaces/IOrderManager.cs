using Honse.Global;
using Honse.Global.Order;

namespace Honse.Managers.Interfaces
{
    public interface IOrderManager
    {
        Task<ValidationResult> ValidateOrder(PlaceOrderRequest request);
        Task<Guid> PlaceOrder(PlaceOrderRequest request);
        Task<Order> ConfirmOrder(Guid tokenId);
        Task<Order?> GetOrderById(Guid id, Guid? userId = null);
        Task<Order> ProcessOrder(OrderProcessRequest request);
        Task CancelOrder(Guid id, Guid? userId = null);
        Task<List<Order>> GetAllOrdersByRestaurant(Guid restaurantId, Guid userId);
        Task<Global.PaginatedResult<Order>> FilterOrders(OrderFilterRequest request);
    }

    public class OrderFilterRequest
    {
        public Guid? RestaurantId { get; set; }

        public OrderStatus? OrderStatus { get; set; }
        
        public DateTime? FromDate { get; set; }
        
        public DateTime? ToDate { get; set; }
        
        public int PageSize { get; set; } = 10;
        
        public int PageNumber { get; set; } = 1;
        
        public Guid UserId { get; set; }
    }

    public class OrderProcessRequest
    {
        public Guid Id { get; set; }
       
        public Guid RestaurantId { get; set; }
        
        public OrderStatus NextStatus { get; set; }
        
        public string? StatusNotes { get; set; }

        public int PreparationTimeMinutes { get; set; }
        
        public Guid UserId { get; set; }
    }

    public class PlaceOrderRequest
    {
        public Guid RestaurantId { get; set; }

        public string CustomerEmail { get; set; } = string.Empty;

        public string CustomerName { get; set; } = string.Empty;

        public string CustomerPhone { get; set; } = string.Empty;

        public Address DeliveryAddress { get; set; } = new Address();

        public List<PlaceOrderProductRequest> Products { get; set; } = new List<PlaceOrderProductRequest>();
    }

    public class PlaceOrderProductRequest
    {
        public Guid ProductId { get; set; }
        public string Name { get; set; } = string.Empty;
        public decimal Quantity { get; set; }
        public decimal Price { get; set; }
        public decimal VAT { get; set; }
        public decimal Total { get; set; }
        public string Image { get; set; } = string.Empty;
    }

    public class ValidationResult
    {
        public bool IsValid { get; set; }
        public List<string> Errors { get; set; } = new List<string>();
    }
}
