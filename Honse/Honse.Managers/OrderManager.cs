using Honse.Managers.Interfaces;
using Honse.Resources.Interfaces;
using Honse.Resources.Interfaces.Entities;
using Honse.Global.Extensions;
using System.Text.Json;

namespace Honse.Managers
{
    public class OrderManager : IOrderManager
    {
        private readonly IOrderResource _orderResource;
        private readonly IOrderProductResource _orderProductResource;
        private readonly Engines.Filtering.Interfaces.IOrderFilteringEngine _orderFilteringEngine;

        public OrderManager(
            IOrderResource orderResource,
            IOrderProductResource orderProductResource,
            Engines.Filtering.Interfaces.IOrderFilteringEngine orderFilteringEngine)
        {
            _orderResource = orderResource;
            _orderProductResource = orderProductResource;
            _orderFilteringEngine = orderFilteringEngine;
        }

        public async Task<Order> AddOrder(CreateOrderRequest request)
        {
            var order = new Order
            {
                Id = Guid.NewGuid(),
                RestaurantId = request.RestaurantId,
                OrderNo = GenerateOrderNumber(),
                Timestamp = DateTime.UtcNow,
                ClientName = request.ClientName,
                ClientEmail = request.ClientEmail,
                DeliveryAddress = request.DeliveryAddress,
                OrderStatus = JsonSerializer.Serialize(new[] 
                { 
                    new { Status = "Pending", Timestamp = DateTime.UtcNow } 
                }),
                Total = 0
            };

            var createdOrder = await _orderResource.Add(order);

            // Add products
            decimal total = 0;
            foreach (var productRequest in request.Products)
            {
                var product = new OrderProductLight
                {
                    Id = Guid.NewGuid(),
                    OrderId = createdOrder.Id,
                    Name = productRequest.Name,
                    Quantity = productRequest.Quantity,
                    Price = productRequest.Price,
                    VAT = productRequest.VAT,
                    Total = productRequest.Quantity * productRequest.Price * (1 + productRequest.VAT)
                };
                
                await _orderProductResource.Add(product);
                total += product.Total;
            }

            // Update order total
            createdOrder.Total = total;
            return (await _orderResource.Update(createdOrder.Id, createdOrder.UserId, createdOrder))!;
        }

        public async Task<Order?> GetOrderById(Guid id, Guid userId)
        {
            var order = await _orderResource.GetByIdWithProducts(id);
            if (order == null || order.UserId != userId)
                return null;

            return order;
        }

        public async Task<Order> UpdateOrder(UpdateOrderRequest request)
        {
            var order = await _orderResource.GetByIdPublic(request.Id) 
                ?? throw new InvalidOperationException("Order not found");

            // Update status history
            var statusHistory = JsonSerializer.Deserialize<List<object>>(order.OrderStatus) ?? new();
            statusHistory.Add(new { Status = request.OrderStatus, Timestamp = DateTime.UtcNow });
            order.OrderStatus = JsonSerializer.Serialize(statusHistory);

            order.PreparationTime = request.PreparationTime;
            order.DeliveryTime = request.DeliveryTime;

            // Assuming UpdateOrderRequest contains UserId property
            return (await _orderResource.Update(order.Id, request.UserId, order))!;
        }

        public async Task DeleteOrder(Guid id, Guid userId)
        {
            var order = await _orderResource.GetByIdPublic(id);
            if (order == null || order.UserId != userId)
                throw new InvalidOperationException("Order not found or access denied");

            await _orderResource.Delete(id, userId);
        }

        public async Task<List<Order>> GetAllOrders(Guid userId)
        {
            IEnumerable<Resources.Interfaces.Entities.Order> orders = await _orderResource.GetAll(userId);

            return orders.ToList();
        }

        public async Task<Global.PaginatedResult<Order>> FilterOrders(OrderFilterRequest request)
        {
            var specification = _orderFilteringEngine.GetSpecification(request.DeepCopyTo<Engines.Filtering.Interfaces.OrderFilterRequest>());

            return await _orderResource.Filter(specification, request.PageSize, request.PageNumber);
        }

        private string GenerateOrderNumber()
        {
            return $"ORD-{DateTime.UtcNow:yyyyMMdd}-{Guid.NewGuid().ToString()[..8].ToUpper()}";
        }
    }
}