using Honse.Managers.Interfaces;
using Honse.Resources.Interfaces;
using Honse.Resources.Interfaces.Entities;
using Honse.Global.Extensions;
using Honse.Engines.Processing.Interfaces;
using Honse.Global;
using Microsoft.AspNetCore.Identity.UI.Services;
using Microsoft.AspNetCore.SignalR;
using Azure.Core;
using Order = Honse.Resources.Interfaces.Entities.Order;

namespace Honse.Managers
{
    public class OrderManager : IOrderManager
    {
        private readonly Resources.Interfaces.IOrderResource orderResource;
        private readonly Engines.Filtering.Interfaces.IOrderFilteringEngine orderFilteringEngine;
        private readonly IOrderProcessorEngine orderProcessorEngine;
        private readonly Resources.Interfaces.IRestaurantResource restaurantResource;
        private readonly Resources.Interfaces.IProductResource productResource;
        private readonly Resources.Interfaces.IOrderConfirmationTokenResource orderConfirmationTokenResource;
        private readonly IEmailSender emailSender;
        private readonly IHubContext<Services.Hub.OrderingHub> hubContext;

        public OrderManager(
            Resources.Interfaces.IOrderResource orderResource,
            Engines.Filtering.Interfaces.IOrderFilteringEngine orderFilteringEngine,
            Engines.Processing.Interfaces.IOrderProcessorEngine orderProcessorEngine,
            Resources.Interfaces.IRestaurantResource restaurantResource,
            Resources.Interfaces.IProductResource productResource,
            Resources.Interfaces.IOrderConfirmationTokenResource orderConfirmationTokenResource,
            IEmailSender emailSender,
            IHubContext<Services.Hub.OrderingHub> hubContext)
        {
            this.orderResource = orderResource;
            this.orderFilteringEngine = orderFilteringEngine;
            this.orderProcessorEngine = orderProcessorEngine;
            this.restaurantResource = restaurantResource;
            this.productResource = productResource;
            this.orderConfirmationTokenResource = orderConfirmationTokenResource;
            this.emailSender = emailSender;
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

        public async Task<ValidationResult> ValidateOrder(PlaceOrderRequest request)
        {
            var result = new ValidationResult { IsValid = true };

            var restaurant = await restaurantResource.GetByIdPublic(request.RestaurantId);
            if (restaurant == null)
            {
                result.IsValid = false;
                result.Errors.Add("Restaurant not found");
                return result;
            }

            if (!restaurant.IsEnabled)
            {
                result.IsValid = false;
                result.Errors.Add("Restaurant is currently unavailable");
                return result;
            }

            var currentTime = TimeOnly.FromDateTime(DateTime.Now);
            if (currentTime < restaurant.OpeningTime || currentTime > restaurant.ClosingTime)
            {
                result.IsValid = false;
                result.Errors.Add($"Restaurant is closed. Open hours: {restaurant.OpeningTime:HH:mm} - {restaurant.ClosingTime:HH:mm}");
                return result;
            }

            if (request.Products == null || !request.Products.Any())
            {
                result.IsValid = false;
                result.Errors.Add("Order must contain at least one product");
                return result;
            }

            foreach (var orderProduct in request.Products)
            {
                var product = await productResource.GetById(orderProduct.ProductId, restaurant.UserId);
                if (product == null)
                {
                    result.IsValid = false;
                    result.Errors.Add($"Product with ID {orderProduct.ProductId} not found");
                    continue;
                }

                if (!product.IsEnabled)
                {
                    result.IsValid = false;
                    result.Errors.Add($"Product '{product.Name}' is currently unavailable");
                    continue;
                }

                if (product.UserId != restaurant.UserId)
                {
                    result.IsValid = false;
                    result.Errors.Add($"Product '{product.Name}' does not belong to this restaurant");
                }
            }

            return result;
        }

        public async Task<Guid> PlaceOrder(PlaceOrderRequest request)
        {
            var validation = await ValidateOrder(request);
            if (!validation.IsValid)
            {
                throw new InvalidOperationException($"Order validation failed: {string.Join(", ", validation.Errors)}");
            }

            var restaurant = await restaurantResource.GetByIdPublic(request.RestaurantId);
            if (restaurant == null)
                throw new InvalidOperationException("Restaurant not found");

            var token = new Resources.Interfaces.Entities.OrderConfirmationToken
            {
                Id = Guid.NewGuid(),
                UserId = restaurant.UserId,
                RestaurantId = request.RestaurantId,
                ClientName = request.CustomerName,
                ClientEmail = request.CustomerEmail,
                DeliveryAddress = request.DeliveryAddress,
                Products = request.Products.Select(p => new Global.Order.OrderProduct
                {
                    Name = p.Name,
                    Quantity = p.Quantity,
                    Price = p.Price,
                    VAT = p.VAT,
                    Total = p.Total,
                    Image = p.Image
                }).ToList(),
                ExpiresAt = DateTime.UtcNow.AddHours(24),
                Used = false
            };

            await orderConfirmationTokenResource.Add(token);

            var frontendLink = $"https://localhost:2000/{token.Id}";
            var backendLink = $"https://localhost:2000/api/public/orders/confirm/{token.Id}";
            
            var emailBody = $@"
                <h2>Order Confirmation</h2>
                <p>Dear {request.CustomerName},</p>
                <p>Thank you for your order! Please click the link below to confirm your order:</p>
                <p><a href=""{frontendLink}"">Confirm Order</a></p>
                <p>This link will expire in 24 hours.</p>
                <p>Best regards,<br/>Honse Team</p>
            ";

            await emailSender.SendEmailAsync(request.CustomerEmail, "Confirm Your Order", emailBody);

            return token.Id;
        }

        public async Task<Global.Order.Order> ConfirmOrder(Guid tokenId)
        {
            var token = await orderConfirmationTokenResource.GetByIdPublic(tokenId);
            if (token == null)
            {
                throw new InvalidOperationException("Confirmation token not found");
            }

            if (token.Used)
            {
                throw new InvalidOperationException("This confirmation link has already been used");
            }

            if (token.ExpiresAt < DateTime.UtcNow)
            {
                throw new InvalidOperationException("This confirmation link has expired");
            }

            var order = new Order
            {
                Id = Guid.NewGuid(),
                UserId = token.UserId,
                RestaurantId = token.RestaurantId,
                ClientName = token.ClientName,
                ClientEmail = token.ClientEmail,
                DeliveryAddress = token.DeliveryAddress, // Direct assignment, Address object
                Products = token.Products, // Direct assignment, List<OrderProduct>
                OrderStatus = Global.Order.OrderStatus.New,
                StatusHistory = new List<Global.Order.OrderStatusHistory> // Correct type
                {
                    new Global.Order.OrderStatusHistory
                    {
                        Status = Global.Order.OrderStatus.New,
                        Timestamp = DateTime.UtcNow,
                        Notes = "Order confirmed by customer"
                    }
                },
                Timestamp = DateTime.UtcNow,
                Total = token.Products.Sum(p => p.Total),
                OrderNo = $"ORD-{DateTime.UtcNow:yyyyMMddHHmmss}"
            };

            await orderResource.Add(order);

            token.Used = true;
            await orderConfirmationTokenResource.Update(token.Id, token.UserId, token);

            await hubContext.Clients.All.SendAsync("PingOrderUpdated", order.Id);

            return order.DeepCopyTo<Global.Order.Order>();
        }
    }
}
