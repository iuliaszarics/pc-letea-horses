
using Honse.Global;

namespace Honse.Resources.Interfaces.Entities
{
    public class OrderConfirmationToken : Entity
    {
        public Guid RestaurantId { get; set; }
        public string ClientName { get; set; } = string.Empty;
        public string ClientEmail { get; set; } = string.Empty;
        public required Address DeliveryAddress { get; set; }
        public required List<Global.Order.OrderProduct> Products { get; set; }
        public DateTime ExpiresAt { get; set; }
        public bool Used { get; set; }
    }
}
