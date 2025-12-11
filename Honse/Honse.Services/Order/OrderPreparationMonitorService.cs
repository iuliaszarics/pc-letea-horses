using Honse.Global.Order;
using Honse.Resources.Interfaces;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;

namespace Honse.Services.Order
{
    public class OrderPreparationMonitorService : BackgroundService
    {
        private readonly IServiceProvider serviceProvider;
        private readonly TimeSpan interval = TimeSpan.FromMinutes(1);

        public OrderPreparationMonitorService(IServiceProvider provider)
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

                var overdueOrders = db.Order
                    .Where(o => o.OrderStatus == OrderStatus.Accepted && o.PreparationTime != null &&
                                o.PreparationTime < now);

                if (overdueOrders.Any())
                {
                    int count = overdueOrders.Count();

                    foreach (var order in overdueOrders)
                    {
                        //order.PreparationTimeMinutes += 15; ?
                        order.PreparationTime =
                            order.PreparationTime.Value.AddMinutes(15);
                    }

                    await db.SaveChangesAsync(stoppingToken);

                    Console.WriteLine($"OrderPreparationMonitorService: updated preparation time for {count} orders");
                }

                await Task.Delay(interval, stoppingToken);
            }
        }
    }

}
