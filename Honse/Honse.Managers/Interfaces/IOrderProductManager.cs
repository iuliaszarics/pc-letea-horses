using Honse.Resources.Interfaces.Entities;

namespace Honse.Managers.Interfaces
{
    public interface IOrderProductManager
    {
        Task<OrderProductLight?> GetOrderProductById(Guid id);

        Task<List<OrderProductLight>> GetAllOrderProducts(Guid orderId);

        Task<OrderProductLight> AddOrderProduct(CreateOrderProductRequest request);

        Task<OrderProductLight> UpdateOrderProduct(UpdateOrderProductRequest request);

        Task DeleteOrderProduct(Guid id, Guid userId);

        Task<Global.PaginatedResult<OrderProductLight>> FilterOrderProducts(OrderProductFilterRequest request);
    }

    public class CreateOrderProductRequest
    {
        public Guid OrderId { get; set; }

        public string Name { get; set; } = string.Empty;

        public decimal Quantity { get; set; }

        public decimal Price { get; set; }

        public decimal VAT { get; set; }

        public Guid UserId { get; set; }
    }

    public class UpdateOrderProductRequest
    {
        public Guid Id { get; set; }

        public Guid OrderId { get; set; }

        public string Name { get; set; } = string.Empty;

        public decimal Quantity { get; set; }

        public decimal Price { get; set; }

        public decimal VAT { get; set; }

        public Guid UserId { get; set; }
    }

    public class OrderProductFilterRequest
    {
        public Guid OrderId { get; set; }

        public int PageSize { get; set; } = 10;
        public int PageNumber { get; set; } = 1;

        public Guid UserId { get; set; }
    }
}