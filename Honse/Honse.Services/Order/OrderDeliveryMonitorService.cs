using Honse.Global.Order;
using Honse.Resources.Interfaces;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;

namespace Honse.Services.Order
{
    public class OrderDeliveryMonitorService : BackgroundService
    {
        private readonly IServiceProvider serviceProvider;
        private readonly TimeSpan interval = TimeSpan.FromMinutes(1);

        public OrderDeliveryMonitorService(IServiceProvider provider)
        {
            serviceProvider = provider;
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            while (!stoppingToken.IsCancellationRequested)
            {
                using var scope = serviceProvider.CreateScope();
                var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();

                var now = DateTime.UtcNow;

                var finishedOrders = db.Order
                    .Where(o => o.OrderStatus == OrderStatus.Delivery && o.DeliveryTime != null &&
                                o.DeliveryTime < now);

                if (finishedOrders.Any())
                {
                    int count = finishedOrders.Count();
                    foreach (var order in finishedOrders)
                    {
                        order.OrderStatus = OrderStatus.Finished;
                        // Add to status history
                    }

                    await db.SaveChangesAsync(stoppingToken);

                    Console.WriteLine($"OrderDeliveryMonitorService: finished delivery for {count} orders");
                }

                await Task.Delay(interval, stoppingToken);
            }
        }
    }

}
