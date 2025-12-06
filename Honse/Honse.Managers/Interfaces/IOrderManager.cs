
namespace Honse.Managers.Interfaces
{
    public interface IOrderManager
    {
    }

    public class OrderProcessRequest
    {
        public Guid OrderId { get; set; }

        public Guid RestaurantId { get; set; }

        public Guid UserId { get; set; }

        public Global.Order.OrderStatus OrderStatus { get; set; }

        public string Data { get; set; } = string.Empty; // This is a Serialized object, that will be different, depending on NextStatus
    }
}
