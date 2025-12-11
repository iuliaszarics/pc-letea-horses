namespace Honse.Global.Order
{
    public class OrderStatusEntry
    {
        public string Status { get; set; } = string.Empty;
        public DateTime Timestamp { get; set; }
        public string? Notes { get; set; }
    }
}
