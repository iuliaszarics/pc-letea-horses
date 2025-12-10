using System.ComponentModel.DataAnnotations;
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
        private readonly Resources.Interfaces.IRestaurantResource _restaurantResource;
        private readonly Resources.Interfaces.IProductResource _productResource;

        public OrderManager(
            IOrderResource orderResource,
            Engines.Filtering.Interfaces.IOrderFilteringEngine orderFilteringEngine,
            Resources.Interfaces.IRestaurantResource restaurantResource,
            Resources.Interfaces.IProductResource productResource)
        {
            _orderResource = orderResource;
            _orderFilteringEngine = orderFilteringEngine;
            _restaurantResource = restaurantResource;
            _productResource = productResource;
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

                order.Status = request.NewStatus.Value;
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

            order.Status = Global.Order.OrderStatus.Cancelled;
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

            order.Status = request.NewStatus;
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
            if (order.Status == Global.Order.OrderStatus.Finished ||
                order.Status == Global.Order.OrderStatus.Cancelled)
            {
                throw new InvalidOperationException($"Cannot cancel order with status: {order.Status}");
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

            order.Status = Global.Order.OrderStatus.Cancelled;
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

        public async Task<PlaceOrderResponse> PlaceOrder(PlaceOrderRequest request, Guid? userId)
        {
            var restaurant = await _restaurantResource.GetByIdPublic(request.RestaurantId);
            if (restaurant == null)
                throw new ValidationException("Restaurant not found!");

            if (!restaurant.IsEnabled)
                throw new ValidationException("Restaurant is currently disabled!");

            var currentTime = TimeOnly.FromDateTime(DateTime.Now);
            bool isOpen = currentTime >= restaurant.OpeningTime && currentTime <= restaurant.ClosingTime;

            if (!isOpen)
                throw new ValidationException($"Restaurant is currently closed. Opens at {restaurant.OpeningTime} and closes at {restaurant.ClosingTime}.");

            decimal totalAmount = 0;
            var orderProducts = new List<Global.Order.OrderProduct>();

            foreach (var item in request.Products)
            {
                var product = await _productResource.GetByIdNoTracking(item.ProductId, userId ?? Guid.Empty);
                if (product == null)
                    throw new ValidationException($"Product with ID {item.ProductId} not found!");

                if (product.Category.RestaurantId != request.RestaurantId)
                    throw new ValidationException($"Product '{product.Name}' does not belong to the selected restaurant!");

                if (!product.IsEnabled)
                    throw new ValidationException($"Product '{product.Name}' is currently unavailable!");

                decimal subtotal = product.Price * item.Quantity;
                totalAmount += subtotal;

                orderProducts.Add(new Global.Order.OrderProduct
                {
                    Name = product.Name,
                    Quantity = item.Quantity,
                    Price = product.Price,
                    VAT = product.VAT,
                    Total = subtotal,
                    Image = product.Image
                });
            }

            var confirmationToken = Guid.NewGuid();
            var order = new Order
            {
                Id = Guid.NewGuid(),
                RestaurantId = request.RestaurantId,
                UserId = userId ?? Guid.Empty,
                OrderNo = confirmationToken.ToString(),
                Timestamp = DateTime.UtcNow,
                ClientName = request.CustomerName,
                ClientEmail = request.CustomerEmail,
                DeliveryAddress = System.Text.Json.JsonSerializer.Serialize(request.DeliveryAddress),
                Status = Global.Order.OrderStatus.New,
                Products = System.Text.Json.JsonSerializer.Serialize(orderProducts),
                Total = totalAmount
            };

            order.StatusHistory = System.Text.Json.JsonSerializer.Serialize(new[]
            {
                new Global.Order.OrderStatusHistoryEntry
                {
                    Status = Global.Order.OrderStatus.New,
                    Timestamp = DateTime.UtcNow,
                    Notes = "Order placed, awaiting confirmation"
                }
            });

            await _orderResource.Add(order);

            return new PlaceOrderResponse
            {
                OrderId = order.Id,
                ConfirmationToken = confirmationToken,
                TotalAmount = totalAmount,
                Message = "Order placed successfully! Please check your email for confirmation."
            };
        }
    }
}
