using Honse.Managers.Interfaces;
using Honse.Resources.Interfaces;
using Honse.Resources.Interfaces.Entities;
using Honse.Global.Extensions;
using Honse.Global;

namespace Honse.Managers
{
    public class OrderManager : IOrderManager
    {
        private readonly IOrderResource _orderResource;
        private readonly Engines.Filtering.Interfaces.IOrderFilteringEngine _orderFilteringEngine;

        public OrderManager(
            IOrderResource orderResource,
            Engines.Filtering.Interfaces.IOrderFilteringEngine orderFilteringEngine)
        {
            _orderResource = orderResource;
            _orderFilteringEngine = orderFilteringEngine;
        }

        public async Task<Order> AddOrder(CreateOrderRequest request)
        {
            // Calculate products with totals
            var orderProducts = request.Products.Select(p => new Global.Order.OrderProduct
            {
                Name = p.Name,
                Quantity = p.Quantity,
                Price = p.Price,
                VAT = p.VAT,
                Total = p.Quantity * p.Price * (1 + p.VAT)
            }).ToList();

            // Calculate order total
            decimal total = orderProducts.Sum(p => p.Total);

            var order = new Order
            {
                Id = Guid.NewGuid(),
                RestaurantId = request.RestaurantId,
                UserId = request.UserId,
                OrderNo = GenerateOrderNumber(),
                Timestamp = DateTime.UtcNow,
                ClientName = request.ClientName,
                ClientEmail = request.ClientEmail,
                DeliveryAddress = request.DeliveryAddress,
                OrderStatus = Global.Order.OrderStatus.New,
                Products = System.Text.Json.JsonSerializer.Serialize(orderProducts),
                Total = total
            };

            // Initialize status history
            order.StatusHistory = System.Text.Json.JsonSerializer.Serialize(new[]
            {
                new Global.Order.OrderStatusHistoryEntry
                {
                    Status = Global.Order.OrderStatus.New,
                    Timestamp = DateTime.UtcNow,
                    Notes = "Order created"
                }
            });

            return await _orderResource.Add(order);
        }

        public async Task<Order?> GetOrderById(Guid id, Guid userId)
        {
            var order = await _orderResource.GetById(id, userId);
            return order;
        }

        public async Task<Order> UpdateOrder(UpdateOrderRequest request)
        {
            var order = await _orderResource.GetById(request.Id, request.UserId) 
                ?? throw new InvalidOperationException("Order not found");

            if (order.UserId != request.UserId)
                throw new UnauthorizedAccessException("Not authorized to update this order");

            // Update status if provided
            if (request.NewStatus.HasValue)
            {
                var history = System.Text.Json.JsonSerializer.Deserialize<List<Global.Order.OrderStatusHistoryEntry>>(order.StatusHistory) 
                    ?? new List<Global.Order.OrderStatusHistoryEntry>();
                
                history.Add(new Global.Order.OrderStatusHistoryEntry
                {
                    Status = request.NewStatus.Value,
                    Timestamp = DateTime.UtcNow,
                    Notes = request.StatusNotes
                });

                order.OrderStatus = request.NewStatus.Value;
                order.StatusHistory = System.Text.Json.JsonSerializer.Serialize(history);
            }

            order.PreparationTime = request.PreparationTime;
            order.DeliveryTime = request.DeliveryTime;

            return (await _orderResource.Update(order.Id, request.UserId, order))!;
        }

        public async Task DeleteOrder(Guid id, Guid userId)
        {
            var order = await _orderResource.GetById(id, userId);
            if (order == null || order.UserId != userId)
                throw new InvalidOperationException("Order not found or access denied");

            // Mark as cancelled instead of deleting
            var history = System.Text.Json.JsonSerializer.Deserialize<List<Global.Order.OrderStatusHistoryEntry>>(order.StatusHistory) 
                ?? new List<Global.Order.OrderStatusHistoryEntry>();
            
            history.Add(new Global.Order.OrderStatusHistoryEntry
            {
                Status = Global.Order.OrderStatus.Cancelled,
                Timestamp = DateTime.UtcNow,
                Notes = "Order cancelled by user"
            });

            order.OrderStatus = Global.Order.OrderStatus.Cancelled;
            order.StatusHistory = System.Text.Json.JsonSerializer.Serialize(history);

            await _orderResource.Update(order.Id, userId, order);
        }

        public async Task<Order?> GetOrderByIdPublic(Guid id)
        {
            return await _orderResource.GetByIdPublic(id);
        }

        public async Task<Order> ProcessOrder(OrderProcessRequest request)
        {
            var order = await _orderResource.GetById(request.Id, request.UserId)
                ?? throw new InvalidOperationException("Order not found");

            // Verify the order belongs to the restaurant
            if (order.RestaurantId != request.RestaurantId)
                throw new UnauthorizedAccessException("Order does not belong to this restaurant");

            // Update status
            var history = System.Text.Json.JsonSerializer.Deserialize<List<Global.Order.OrderStatusHistoryEntry>>(order.StatusHistory) 
                ?? new List<Global.Order.OrderStatusHistoryEntry>();
            
            history.Add(new Global.Order.OrderStatusHistoryEntry
            {
                Status = request.NewStatus,
                Timestamp = DateTime.UtcNow,
                Notes = request.StatusNotes
            });

            order.OrderStatus = request.NewStatus;
            order.StatusHistory = System.Text.Json.JsonSerializer.Serialize(history);

            // Update preparation time when status becomes Accepted
            if (request.NewStatus == Global.Order.OrderStatus.Accepted && !order.PreparationTime.HasValue)
            {
                order.PreparationTime = DateTime.UtcNow;
            }

            // Update delivery time when status becomes Finished
            if (request.NewStatus == Global.Order.OrderStatus.Finished && !order.DeliveryTime.HasValue)
            {
                order.DeliveryTime = DateTime.UtcNow;
            }

            return (await _orderResource.Update(order.Id, order.UserId, order))!;
        }

        public async Task CancelOrderPublic(Guid id)
        {
            var order = await _orderResource.GetByIdPublic(id)
                ?? throw new InvalidOperationException("Order not found");

            // Check if order can be cancelled (only if not finished or already cancelled)
            if (order.OrderStatus == Global.Order.OrderStatus.Finished ||
                order.OrderStatus == Global.Order.OrderStatus.Cancelled)
            {
                throw new InvalidOperationException($"Cannot cancel order with status: {order.OrderStatus}");
            }

            // Mark as cancelled
            var history = System.Text.Json.JsonSerializer.Deserialize<List<Global.Order.OrderStatusHistoryEntry>>(order.StatusHistory) 
                ?? new List<Global.Order.OrderStatusHistoryEntry>();
            
            history.Add(new Global.Order.OrderStatusHistoryEntry
            {
                Status = Global.Order.OrderStatus.Cancelled,
                Timestamp = DateTime.UtcNow,
                Notes = "Order cancelled by customer"
            });

            order.OrderStatus = Global.Order.OrderStatus.Cancelled;
            order.StatusHistory = System.Text.Json.JsonSerializer.Serialize(history);

            await _orderResource.Update(order.Id, order.UserId, order);
        }

        public async Task<List<Order>> GetAllOrdersByRestaurant(Guid restaurantId, Guid userId)
        {
            var orders = await _orderResource.GetByRestaurantId(restaurantId);
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