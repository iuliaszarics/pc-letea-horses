using Honse.Managers.Interfaces;
using Honse.Resources.Interfaces.Entities;
using Honse.Global.Extensions;
using Honse.Engines.Processing.Interfaces;
using Honse.Global;
using Microsoft.AspNetCore.SignalR;
using Azure.Core;

namespace Honse.Managers
{
    public class OrderManager : IOrderManager
    {
        private readonly Resources.Interfaces.IOrderResource orderResource;
        private readonly Engines.Filtering.Interfaces.IOrderFilteringEngine orderFilteringEngine;
        private readonly IOrderProcessorEngine orderProcessorEngine;
        private readonly Resources.Interfaces.IRestaurantResource restaurantResource;
        private readonly Resources.Interfaces.IProductResource productResource;
        private readonly IHubContext<Services.Hub.OrderingHub> hubContext;

        public OrderManager(
            Resources.Interfaces.IOrderResource orderResource,
            Engines.Filtering.Interfaces.IOrderFilteringEngine orderFilteringEngine,
            Engines.Processing.Interfaces.IOrderProcessorEngine orderProcessorEngine,
            Resources.Interfaces.IRestaurantResource restaurantResource,
            Resources.Interfaces.IProductResource productResource,
            IHubContext<Services.Hub.OrderingHub> hubContext)
        {
            this.orderResource = orderResource;
            this.orderFilteringEngine = orderFilteringEngine;
            this.orderProcessorEngine = orderProcessorEngine;
            this.restaurantResource = restaurantResource;
            this.productResource = productResource;
            this.hubContext = hubContext;
        }

        public async Task<Global.Order.Order?> GetOrderById(Guid id, Guid? userId)
        {
            Order? order = userId != null ? await orderResource.GetById(id, userId.Value) : await orderResource.GetByIdPublic(id);

            if (order == null)
                return null;

            return order.DeepCopyTo<Global.Order.Order>();
        }

        public async Task<Global.Order.Order> ProcessOrder(OrderProcessRequest request)
        {
            var order = await orderResource.GetById(request.Id, request.UserId)
                ?? throw new InvalidOperationException("Order not found");

            // Verify the order belongs to the restaurant
            if (order.RestaurantId != request.RestaurantId)
                throw new UnauthorizedAccessException("Order does not belong to this restaurant");

            order = orderProcessorEngine.ProcessOrder(order.DeepCopyTo<Global.Order.Order>(), request.NextStatus, request.PreparationTimeMinutes, request.StatusNotes).DeepCopyTo<Order>();

            order = (await orderResource.Update(order.Id, order.UserId, order))!;

            await hubContext.Clients.All.SendAsync("PingOrderUpdated", order.Id);

            return order.DeepCopyTo<Global.Order.Order>();
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

            order = orderProcessorEngine.CancelOrder(order.DeepCopyTo<Global.Order.Order>()).DeepCopyTo<Order>();

            await orderResource.Update(order.Id, order.UserId, order);

            await hubContext.Clients.All.SendAsync("PingOrderUpdated", order.Id);
        }

        public async Task<List<Global.Order.Order>> GetAllOrdersByRestaurant(Guid restaurantId, Guid userId)
        {
            var orders = await orderResource.GetByRestaurantId(restaurantId);

            return orders.Select(o => o.DeepCopyTo<Global.Order.Order>()).ToList();
        }

        public async Task<Global.PaginatedResult<Global.Order.Order>> FilterOrders(OrderFilterRequest request)
        {
            var specification = orderFilteringEngine.GetSpecification(request.DeepCopyTo<Engines.Filtering.Interfaces.OrderFilterRequest>());

            var orders = await orderResource.Filter(specification, request.PageSize, request.PageNumber);

            return orders.DeepCopyTo<PaginatedResult<Global.Order.Order>>();
        }
    }
}
