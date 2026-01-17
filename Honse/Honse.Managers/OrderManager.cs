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
            var trackedEntity = await orderResource.GetById(request.Id, request.UserId)
                ?? throw new InvalidOperationException("Order not found");

            if (trackedEntity.RestaurantId != request.RestaurantId)
                throw new UnauthorizedAccessException("Order does not belong to this restaurant");

            var domainOrder = trackedEntity.DeepCopyTo<Global.Order.Order>();

            // 3. Process
            domainOrder = orderProcessorEngine.ProcessOrder(
                domainOrder, 
                request.NextStatus, 
                request.PreparationTimeMinutes, 
                request.StatusNotes
            );

            // We have to map the properties manually back to the entity from the db
            // due to how Entity framework handles JSON Lists

            trackedEntity.OrderStatus = domainOrder.OrderStatus;

            if (request.PreparationTimeMinutes > 0)
            {
                trackedEntity.PreparationTime = DateTime.UtcNow.AddMinutes(request.PreparationTimeMinutes);
            }

            var newHistoryItem = domainOrder.StatusHistory.Last();

            trackedEntity.StatusHistory.Add(new Global.Order.OrderStatusHistory 
            {
                Status = newHistoryItem.Status,
                Timestamp = newHistoryItem.Timestamp, 
                Notes = newHistoryItem.Notes
            });

            trackedEntity.DeliveryTime = domainOrder.DeliveryTime;

            // Save changes
            await orderResource.SaveChanges();

            await hubContext.Clients.All.SendAsync("PingOrderUpdated", trackedEntity.Id);

            return domainOrder;
        }

        public async Task CancelOrder(Guid id, Guid? userId)
        {
            Console.WriteLine($"[DEBUG] CancelOrder started for OrderId: {id}");

            // 1. Fetch Tracked Entity
            var trackedEntity = (userId != null 
                ? await orderResource.GetById(id, userId.Value) 
                : await orderResource.GetByIdPublic(id))
                ?? throw new InvalidOperationException("Order not found");

            Console.WriteLine($"[DEBUG] ✅ Order found. Current Status: {trackedEntity.OrderStatus}");

            // 2. Manual Mapping (Safe Copy)
            // We strictly map only the properties that exist in both classes to avoid errors.
            var domainOrder = new Global.Order.Order 
            {
                Id = trackedEntity.Id,
                RestaurantId = trackedEntity.RestaurantId,
                OrderNo = trackedEntity.OrderNo,
                Timestamp = trackedEntity.Timestamp,
                Total = trackedEntity.Total,
                OrderStatus = trackedEntity.OrderStatus,
                ClientName = trackedEntity.ClientName,
                ClientEmail = trackedEntity.ClientEmail,
                
                // Map DateTime directly (Fixes CS0117 for PreparationTimeMinutes)
                PreparationTime = trackedEntity.PreparationTime,
                DeliveryTime = trackedEntity.DeliveryTime,
                
                // Pass the reference for Address (safe, as Address usually doesn't loop back to Order)
                DeliveryAddress = trackedEntity.DeliveryAddress, 

                // We skip 'Products' here to be 100% safe from StackOverflows during cancellation, 
                // as the Engine usually only needs Status + History to cancel.
                
                // Map History
                StatusHistory = trackedEntity.StatusHistory.Select(h => new Global.Order.OrderStatusHistory 
                {
                    Status = h.Status,
                    Timestamp = h.Timestamp,
                    Notes = h.Notes
                }).ToList()
            };

            // 3. Process
            Console.WriteLine("[DEBUG] Running CancelOrder engine logic...");
            orderProcessorEngine.CancelOrder(domainOrder);

            Console.WriteLine($"[DEBUG] Engine finished. New Status: {domainOrder.OrderStatus}");

            // 4. SYNC BACK: Update the Entity
            Console.WriteLine("[DEBUG] Syncing changes back to tracked entity...");
            
            trackedEntity.OrderStatus = domainOrder.OrderStatus;

            var newHistoryItem = domainOrder.StatusHistory.LastOrDefault();
            if (newHistoryItem != null)
            {
                // Add directly using the global class since we know it matches
                trackedEntity.StatusHistory.Add(new Global.Order.OrderStatusHistory 
                {
                    Status = newHistoryItem.Status,
                    Timestamp = newHistoryItem.Timestamp,
                    Notes = newHistoryItem.Notes
                });
            }

            // 5. Save
            Console.WriteLine("[DEBUG] Saving changes...");
            await orderResource.SaveChanges(); 

            Console.WriteLine("[DEBUG] ✅ Success!");
            await hubContext.Clients.All.SendAsync("PingOrderUpdated", trackedEntity.Id);
        }

        public async Task<List<Global.Order.Order>> GetAllOrdersByRestaurant(Guid restaurantId, Guid userId)
        {
            var orders = await orderResource.GetByRestaurantId(restaurantId);

            return orders.Select(o => o.DeepCopyTo<Global.Order.Order>()).ToList();
        }

        public async Task<List<Global.Order.Order>> GetActiveOrdersByRestaurant(Guid restaurantId, Guid userId)
        {
            var orders = await orderResource.GetActiveByRestaurantId(restaurantId);

            return orders.Select(o => o.DeepCopyTo<Global.Order.Order>()).ToList();
        }

        public async Task<List<Global.Order.Order>> GetSalesByRestaurant(Guid restaurantId, Guid userId)
        {
            var orders = await orderResource.GetFinishedByRestaurantId(restaurantId);

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

            // Use HTTP for local dev; HTTPS here causes ERR_SSL_PROTOCOL_ERROR unless a cert is configured
            var frontendLink = $"http://localhost:3000/public/confirm-order/{token.Id}";
            
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
            
            if (token == null || token.ExpiresAt < DateTime.UtcNow)
            {
                throw new InvalidOperationException("Confirmation token not found or it has expired");
            }

            if (token.Used)
            {
                var order = await orderResource.GetByIdPublic(tokenId) ?? throw new InvalidOperationException("Order not found");

                return order.DeepCopyTo<Global.Order.Order>();
            }

            var newOrder = new Order
            {
                Id = tokenId,
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

            await orderResource.Add(newOrder);

            token.Used = true;
            await orderConfirmationTokenResource.Update(token.Id, token.UserId, token);

            await hubContext.Clients.All.SendAsync("PingOrderAdded", newOrder.Id);

            return newOrder.DeepCopyTo<Global.Order.Order>();
        }
    }
}
