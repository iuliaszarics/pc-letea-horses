
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;

namespace Honse.Services.Order
{
    public class OrderConfirmationCleanupService : BackgroundService
    {
        private readonly IServiceProvider serviceProvider;

        private readonly TimeSpan runInterval = TimeSpan.FromMinutes(10);

        public OrderConfirmationCleanupService(IServiceProvider serviceProvider)
        {
            this.serviceProvider = serviceProvider;
        }
        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            while (!stoppingToken.IsCancellationRequested)
            {
                using (var scope = serviceProvider.CreateScope())
                {
                    var orderConfirmationTokenResource = scope.ServiceProvider.GetRequiredService<Resources.Interfaces.IOrderConfirmationTokenResource>();

                    var expiredTokens = await orderConfirmationTokenResource.GetExpiredTokens();

                    if (expiredTokens.Count() > 0)
                    {
                        await orderConfirmationTokenResource.DeleteRange(expiredTokens);

                        Console.WriteLine($"OrderConfirmationCleanupService: Deleted {expiredTokens.Count()} expired tokens");
                    }
                }

                await Task.Delay(runInterval, stoppingToken);
            }
        }
    }
}
