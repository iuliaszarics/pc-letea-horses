using Honse.Managers.Interfaces;
using Honse.Resources.Interfaces;
using Honse.Resources.Interfaces.Entities;
using Honse.Global.Extensions;

namespace Honse.Managers
{
    public class OrderProductManager : IOrderProductManager
    {
        private readonly IOrderProductResource _orderProductResource;
        private readonly IOrderResource _orderResource;
        private readonly Engines.Filtering.Interfaces.IOrderProductFilteringEngine _orderProductFilteringEngine;

        public OrderProductManager(
            IOrderProductResource orderProductResource,
            IOrderResource orderResource,
            Engines.Filtering.Interfaces.IOrderProductFilteringEngine orderProductFilteringEngine)
        {
            _orderProductResource = orderProductResource;
            _orderResource = orderResource;
            _orderProductFilteringEngine = orderProductFilteringEngine;
        }

        public async Task<OrderProductLight?> GetOrderProductById(Guid id)
        {
            return await _orderProductResource.GetByIdPublic(id);
        }

        public async Task<List<OrderProductLight>> GetAllOrderProducts(Guid orderId)
        {
            var products = await _orderProductResource.GetByOrderId(orderId);
            return products.ToList();
        }

        public async Task<OrderProductLight> AddOrderProduct(CreateOrderProductRequest request)
        {
            var orderProduct = new OrderProductLight
            {
                Id = Guid.NewGuid(),
                OrderId = request.OrderId,
                Name = request.Name,
                Quantity = request.Quantity,
                Price = request.Price,
                VAT = request.VAT,
                Total = request.Quantity * request.Price * (1 + request.VAT)
            };

            var created = await _orderProductResource.Add(orderProduct);

            // Update order total
            await RecalculateOrderTotal(request.OrderId, request.UserId);

            return created;
        }

        public async Task<OrderProductLight> UpdateOrderProduct(UpdateOrderProductRequest request)
        {
            var orderProduct = await _orderProductResource.GetByIdPublic(request.Id)
                ?? throw new InvalidOperationException("Order product not found");

            orderProduct.Name = request.Name;
            orderProduct.Quantity = request.Quantity;
            orderProduct.Price = request.Price;
            orderProduct.VAT = request.VAT;
            orderProduct.Total = request.Quantity * request.Price * (1 + request.VAT);

            // You need to provide the userId; replace 'userId' with the actual user ID as appropriate
            var updated = await _orderProductResource.Update(orderProduct.Id, request.UserId, orderProduct);

            // Update order total
            await RecalculateOrderTotal(request.OrderId, request.UserId);

            return updated!;
        }

        public async Task DeleteOrderProduct(Guid id, Guid userId)
        {
            var orderProduct = await _orderProductResource.GetByIdPublic(id);
            if (orderProduct == null)
                throw new InvalidOperationException("Order product not found");

            var orderId = orderProduct.OrderId;
            await _orderProductResource.Delete(id, userId);

            // Update order total
            await RecalculateOrderTotal(orderId, userId);
        }

        public async Task<Global.PaginatedResult<OrderProductLight>> FilterOrderProducts(OrderProductFilterRequest request)
        {
            var specification = _orderProductFilteringEngine.GetSpecification(request.DeepCopyTo<Engines.Filtering.Interfaces.OrderProductFilterRequest>());

            return await _orderProductResource.Filter(specification, request.PageSize, request.PageNumber);
        }

        private async Task RecalculateOrderTotal(Guid orderId, Guid userId)
        {
            var order = await _orderResource.GetByIdWithProducts(orderId);
            if (order != null)
            {
                order.Total = order.Products.Sum(p => p.Total);
                await _orderResource.Update(order.Id, userId, order);
            }
        }
    }
}