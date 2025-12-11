
namespace Honse.Engines.Processing.Interfaces
{
    public interface IOrderProcessorEngine
    {
        Global.Order.Order ProcessOrder(Global.Order.Order order, Global.Order.OrderStatus nextStatus, int preparationTimeMinutes, string? statusNotes);

        Global.Order.Order CancelOrder(Global.Order.Order order);
    }
}
