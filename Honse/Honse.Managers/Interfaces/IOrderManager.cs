using Honse.Resources.Interfaces.Entities;
using Honse.Global.Order;
using Order = Honse.Resources.Interfaces.Entities.Order;

namespace Honse.Managers.Interfaces
{
    public interface IOrderManager
    {
<<<<<<< Updated upstream
        Task<EntityOrder> AddOrder(CreateOrderRequest request);
        Task<EntityOrder?> GetOrderById(Guid id, Guid userId);
        Task<EntityOrder?> GetOrderByIdPublic(Guid id);
        Task<EntityOrder> UpdateOrder(UpdateOrderRequest request);
        Task<EntityOrder> ProcessOrder(OrderProcessRequest request);
=======
        Task<PlaceOrderResponse> PlaceOrder(PlaceOrderRequest request, Guid? userId);
        Task<Order?> GetOrderById(Guid id, Guid userId);
        Task<Order?> GetOrderByIdPublic(Guid id);
        Task<Order> UpdateOrder(UpdateOrderRequest request);
        Task<Order> ProcessOrder(OrderProcessRequest request);
>>>>>>> Stashed changes
        Task DeleteOrder(Guid id, Guid userId);
        Task CancelOrderPublic(Guid id);
        Task<List<Order>> GetAllOrdersByRestaurant(Guid restaurantId, Guid userId);
        Task<Global.PaginatedResult<Order>> FilterOrders(OrderFilterRequest request);
    }

    public class UpdateOrderRequest
    {
        public Guid Id { get; set; }
        public OrderStatus? NewStatus { get; set; }
        public string? StatusNotes { get; set; }
        public DateTime? PreparationTime { get; set; }
        public DateTime? DeliveryTime { get; set; }
        
        public Guid UserId { get; set; }
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
        public OrderStatus NewStatus { get; set; }
        public string? StatusNotes { get; set; }
        public Guid UserId { get; set; }
    }
<<<<<<< Updated upstream
=======

    public class PlaceOrderRequest
    {
        public Guid RestaurantId { get; set; }

        public string CustomerEmail { get; set; } = string.Empty;

        public string CustomerName { get; set; } = string.Empty;

        public string CustomerPhone { get; set; } = string.Empty;

        public Address DeliveryAddress { get; set; } = new Address();

        public List<OrderProductRequest> Products { get; set; } = new List<OrderProductRequest>();
    }

    public class OrderProductRequest
    {
        public Guid ProductId { get; set; }

        public int Quantity { get; set; }
    }

    public class PlaceOrderResponse
    {
        public Guid OrderId { get; set; }

        public Guid ConfirmationToken { get; set; }

        public string Message { get; set; } = string.Empty;

        public decimal TotalAmount { get; set; }
    }
>>>>>>> Stashed changes
}
