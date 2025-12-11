using Honse.Managers.Interfaces;
using Honse.Resources.Interfaces;
using Honse.Resources.Interfaces.Entities;
using Honse.Global.Extensions;
using Honse.Global;

namespace Honse.Managers
{
    public class OrderManager : IOrderManager
    {
        private readonly IOrderResource orderResource;
        private readonly Engines.Filtering.Interfaces.IOrderFilteringEngine orderFilteringEngine;
        private readonly Resources.Interfaces.IRestaurantResource restaurantResource;
        private readonly Resources.Interfaces.IProductResource productResource;

        public OrderManager(
            IOrderResource orderResource,
            Engines.Filtering.Interfaces.IOrderFilteringEngine orderFilteringEngine,
            Resources.Interfaces.IRestaurantResource restaurantResource,
            Resources.Interfaces.IProductResource productResource)
        {
            this.orderResource = orderResource;
            this.orderFilteringEngine = orderFilteringEngine;
            this.restaurantResource = restaurantResource;
            this.productResource = productResource;
        }

        public async Task<Order?> GetOrderById(Guid id, Guid? userId)
        {
            var order = userId != null ? await orderResource.GetById(id, userId.Value) : await orderResource.GetByIdPublic(id);
            return order;
        }

        //TODO: Move to OrderProcessorEngine
        public async Task<Order> ProcessOrder(OrderProcessRequest request)
        {
            var order = await orderResource.GetById(request.Id, request.UserId)
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

            return (await orderResource.Update(order.Id, order.UserId, order))!;
        }

        /// <summary>
        /// This function is used for both the client and the company endpoints
        /// </summary>
        /// <param name="id"></param>
        /// <returns></returns>
        /// <exception cref="InvalidOperationException"></exception>
        /// 
        public async Task CancelOrder(Guid id, Guid? userId)
        {
            Order order = (userId != null ? await orderResource.GetById(id, userId.Value) : await orderResource.GetByIdPublic(id))
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

            await orderResource.Update(order.Id, order.UserId, order);
        }

        public async Task<List<Order>> GetAllOrdersByRestaurant(Guid restaurantId, Guid userId)
        {
            var orders = await orderResource.GetByRestaurantId(restaurantId);
            return orders.ToList();
        }

        public async Task<Global.PaginatedResult<Order>> FilterOrders(OrderFilterRequest request)
        {
            var specification = orderFilteringEngine.GetSpecification(request.DeepCopyTo<Engines.Filtering.Interfaces.OrderFilterRequest>());

            return await orderResource.Filter(specification, request.PageSize, request.PageNumber);
        }
    }
}
