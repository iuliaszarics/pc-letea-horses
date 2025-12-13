using Honse.Engines.Processing.Interfaces;
using Honse.Global.Order;

namespace Honse.Engines.Processing
{
    public class OrderProcessorEngine : IOrderProcessorEngine
    {
        public Order CancelOrder(Order order)
        {
            // 1. REMOVE the old restriction.
            // Only block if it is ALREADY cancelled.
            if (order.OrderStatus == Global.Order.OrderStatus.Cancelled)
            {
                throw new InvalidOperationException($"Order is already cancelled.");
            }

            // 2. Mark as cancelled
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
            // This logic remains the same (forcing use of CancelOrder method for cancellations)
            if (nextStatus == OrderStatus.Cancelled)
            {
                throw new InvalidOperationException($"Call CancelOrder instead!");
            }

            // Simple validation: ensure we don't skip statuses (e.g. New -> Delivery)
            // You might want to remove this too if you want total freedom, 
            // but usually linear progression is desired for normal flow.
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