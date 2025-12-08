using System.Text.Json;

namespace Honse.Global
{
    public class OrderStatusEntry
    {
        public string Status { get; set; } = string.Empty;
        public DateTime Timestamp { get; set; }
        public string? Notes { get; set; }
    }

    public static class OrderStatusHelper
    {
        public static List<OrderStatusEntry> DeserializeStatus(string orderStatusJson)
        {
            try
            {
                return JsonSerializer.Deserialize<List<OrderStatusEntry>>(orderStatusJson) 
                    ?? new List<OrderStatusEntry>();
            }
            catch
            {
                return new List<OrderStatusEntry>();
            }
        }

        public static string SerializeStatus(List<OrderStatusEntry> statusEntries)
        {
            return JsonSerializer.Serialize(statusEntries);
        }

        public static string CreateInitialStatus(string? notes = null)
        {
            var initialStatus = new List<OrderStatusEntry>
            {
                new OrderStatusEntry
                {
                    Status = "Pending",
                    Timestamp = DateTime.UtcNow,
                    Notes = notes ?? "Order created"
                }
            };

            return SerializeStatus(initialStatus);
        }

        public static string AddStatusEntry(string currentStatusJson, string newStatus, string? notes = null)
        {
            var statusHistory = DeserializeStatus(currentStatusJson);
            
            statusHistory.Add(new OrderStatusEntry
            {
                Status = newStatus,
                Timestamp = DateTime.UtcNow,
                Notes = notes
            });

            return SerializeStatus(statusHistory);
        }

        public static string GetCurrentStatus(string orderStatusJson)
        {
            var statusHistory = DeserializeStatus(orderStatusJson);
            return statusHistory.LastOrDefault()?.Status ?? "Unknown";
        }

        public static bool IsValidStatus(string status)
        {
            var validStatuses = new[] 
            { 
                "Pending", 
                "Confirmed", 
                "Preparing", 
                "Ready", 
                "InDelivery", 
                "Delivered", 
                "Cancelled" 
            };

            return validStatuses.Contains(status, StringComparer.OrdinalIgnoreCase);
        }

        public static List<OrderStatusEntry> GetStatusHistory(string orderStatusJson)
        {
            return DeserializeStatus(orderStatusJson);
        }
    }
}
