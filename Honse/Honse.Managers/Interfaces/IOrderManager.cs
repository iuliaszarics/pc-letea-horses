using Honse.Resources.Interfaces.Entities;
using Honse.Global.Order;
using EntityOrder = Honse.Resources.Interfaces.Entities.Order;

namespace Honse.Managers.Interfaces
{
    public interface IOrderManager
    {
        Task<EntityOrder> AddOrder(CreateOrderRequest request);
        Task<EntityOrder?> GetOrderById(Guid id, Guid userId);
        Task<EntityOrder?> GetOrderByIdPublic(Guid id);
        Task<EntityOrder> UpdateOrder(UpdateOrderRequest request);
        Task<EntityOrder> ProcessOrder(OrderProcessRequest request);
        Task DeleteOrder(Guid id, Guid userId);
        Task CancelOrderPublic(Guid id);
        Task<List<EntityOrder>> GetAllOrdersByRestaurant(Guid restaurantId, Guid userId);
        Task<Global.PaginatedResult<EntityOrder>> FilterOrders(OrderFilterRequest request);
    }

    public class CreateOrderRequest
    {
        public Guid RestaurantId { get; set; }
        public string ClientName { get; set; } = string.Empty;
        public string ClientEmail { get; set; } = string.Empty;
        public string DeliveryAddress { get; set; } = string.Empty;
        public List<OrderProductRequest> Products { get; set; } = new();

        public Guid UserId { get; set; }
    }

    public class OrderProductRequest
    {
        public string Name { get; set; } = string.Empty;
        public decimal Quantity { get; set; }
        public decimal Price { get; set; }
        public decimal VAT { get; set; }
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
}
