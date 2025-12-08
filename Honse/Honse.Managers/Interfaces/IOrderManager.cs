using Honse.Resources.Interfaces.Entities;

namespace Honse.Managers.Interfaces
{
    public interface IOrderManager
    {
        Task<Order> AddOrder(CreateOrderRequest request);
        Task<Order?> GetOrderById(Guid id, Guid userId);
        Task<Order?> GetOrderByIdPublic(Guid id);
        Task<Order> UpdateOrder(UpdateOrderRequest request);
        Task<Order> ProcessOrder(OrderProcessRequest request);
        Task DeleteOrder(Guid id, Guid userId);
        Task CancelOrderPublic(Guid id);
        Task<List<Order>> GetAllOrdersByRestaurant(Guid restaurantId, Guid userId);
        Task<Global.PaginatedResult<Order>> FilterOrders(OrderFilterRequest request);
    }

    public class CreateOrderRequest
    {
        public Guid RestaurantId { get; set; }
        public string ClientName { get; set; } = string.Empty;
        public string ClientEmail { get; set; } = string.Empty;
        public string DeliveryAddress { get; set; } = string.Empty;
        public List<CreateOrderProductRequest> Products { get; set; } = new();

        public Guid UserId { get; set; }
    }

    public class UpdateOrderRequest
    {
        public Guid Id { get; set; }
        public string OrderStatus { get; set; } = string.Empty;
        public string? StatusNotes { get; set; }
        public DateTime? PreparationTime { get; set; }
        public DateTime? DeliveryTime { get; set; }
        
        public Guid UserId { get; set; }
    }

    public class OrderFilterRequest
    {
        public Guid? RestaurantId { get; set; }
        public string? OrderStatus { get; set; }
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
        public string NewStatus { get; set; } = string.Empty;
        public string? StatusNotes { get; set; }
        public Guid UserId { get; set; }
    }
}