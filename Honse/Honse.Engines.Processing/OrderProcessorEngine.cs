using Honse.Engines.Processing.Interfaces;
using Honse.Global.Order;

namespace Honse.Engines.Processing
{
    public class OrderProcessorEngine : IOrderProcessorEngine
    {
        public Order CancelOrder(Order order)
        {
            if (order.OrderStatus == Global.Order.OrderStatus.Cancelled)
            {
                throw new InvalidOperationException($"Order is already cancelled.");
            }

            order.OrderStatus = Global.Order.OrderStatus.Cancelled;
            
            order.StatusHistory.Add(new Global.Order.OrderStatusHistory
            {
                Status = Global.Order.OrderStatus.Cancelled,
                Timestamp = DateTime.UtcNow,
                Notes = "Order cancelled by customer"
            });

            return order;
        }

        public Order ProcessOrder(Order order, OrderStatus nextStatus, int preparationTimeMinutes, string? statusNotes)
        {
            if (nextStatus == OrderStatus.Cancelled)
            {
                throw new InvalidOperationException($"Call CancelOrder instead!");
            }

            // Ensure we don't skip statuses (e.g. New -> Delivery)
            if (nextStatus - order.OrderStatus != 1)
            {
                throw new InvalidOperationException($"Cannot process the order to this status (check if a status was skipped)");
            }

            switch (nextStatus)
            {
                case OrderStatus.Accepted:
                    if (preparationTimeMinutes <= 0)
                    {
                        throw new InvalidOperationException($"For the accepted status you must add the preparation time (in minutes)");
                    }
                    order.PreparationTime = DateTime.UtcNow.AddMinutes(preparationTimeMinutes);
                    break;

                case OrderStatus.Delivery:
                    order.DeliveryTime = DateTime.UtcNow.AddMinutes(15);
                    break;
            }

            order.OrderStatus = nextStatus;
            order.StatusHistory.Add(new Global.Order.OrderStatusHistory
            {
                Status = nextStatus,
                Timestamp = DateTime.UtcNow,
                Notes = statusNotes
            });

            return order;
        }
    }
}