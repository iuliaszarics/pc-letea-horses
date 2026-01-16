using Honse.Engines.Filtering.Interfaces;
using Honse.Global.Dashboard;
using Honse.Global.Order;
using Honse.Managers.Interfaces;
using Honse.Resources.Interfaces;
using Honse.Resources.Interfaces.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Honse.Managers
{
    public class DashboardManager : IDashboardManager
    {
        private readonly IOrderResource _orderResource;
        private readonly IProductResource _productResource;
        private readonly IRestaurantResource restaurantResource;
        private readonly IProductCategoryResource productCategoryResource;
        private readonly IProductFilteringEngine productFilteringEngine;

        public DashboardManager(IOrderResource orderResource, 
            IProductResource productResource, 
            IRestaurantResource restaurantResource, 
            IProductCategoryResource productCategoryResource,
            IProductFilteringEngine productFilteringEngine)
        {
            _orderResource = orderResource;
            _productResource = productResource;
            this.restaurantResource = restaurantResource;
            this.productCategoryResource = productCategoryResource;
            this.productFilteringEngine = productFilteringEngine;
        }

        public async Task<DashboardStatsResponse> GetStats(DashboardStatsRequest request)
        {
            var allOrders = await _orderResource.GetByRestaurantId(request.RestaurantId);

            var filteredOrders = allOrders
                .Where(o => o.Timestamp.Date >= request.StartDate.Date && o.Timestamp.Date <= request.EndDate.Date)
                .ToList();

            var validOrders = filteredOrders
                .Where(o => o.OrderStatus == Global.Order.OrderStatus.Finished)
                .ToList();

            var response = new DashboardStatsResponse
            {

                TotalRevenue = validOrders.Sum(o => o.Total),
                NewOrders = filteredOrders.Count(o => o.OrderStatus == OrderStatus.New),
                CompletedOrders = filteredOrders.Count(o => o.OrderStatus == OrderStatus.Finished)
            };

            bool isSameDay = (request.EndDate - request.StartDate).TotalHours <= 26;

            if (isSameDay)
            {
                var hourlyData = validOrders
                    .GroupBy(o => o.Timestamp.ToLocalTime().Hour)
                    .ToDictionary(g => g.Key, g => g.Count());

                for (int i = 0; i < 24; i++)
                {
                    response.SalesOverTime.Labels.Add($"{i:00}:00");
                    response.SalesOverTime.Values.Add(hourlyData.ContainsKey(i) ? hourlyData[i] : 0);
                }
            }
            else
            {
                var dailyData = validOrders
                    .GroupBy(o => o.Timestamp.Date)
                    .ToDictionary(g => g.Key, g => g.Count());

                for (var day = request.StartDate.Date; day <= request.EndDate.Date; day = day.AddDays(1))
                {
                    response.SalesOverTime.Labels.Add(day.ToString("dd/MM"));
                    response.SalesOverTime.Values.Add(dailyData.ContainsKey(day) ? dailyData[day] : 0);
                }
            }

            var soldItems = validOrders.SelectMany(o => o.Products).ToList();

            response.TopProducts = soldItems
                .GroupBy(p => p.Name)
                .Select(g => new ProductStat
                {
                    Name = g.Key,
                    Image = g.FirstOrDefault()?.Image ?? "",
                    TotalSales = g.Sum(p => p.Quantity)
                })
                .OrderByDescending(x => x.TotalSales)
            .Take(5)
            .ToList();

            var restaurant = await restaurantResource.GetByIdPublic(request.RestaurantId);

            if (restaurant == null)
                throw new Exception("Restaurant not found!");
            
            // Get all categories for this restaurant
            var categories = await productCategoryResource.GetConfigurationCategories(restaurant.Configuration);

            var specification = productFilteringEngine.GetSpecification(new Engines.Filtering.Interfaces.ProductFilterRequest
            {
                UserId = restaurant.UserId,
                CategoriesIds = categories.Select(category => category.Id).ToList(),
                IsEnabled = true,
            });

            // Get all enabled products for this restaurant
            var restaurantProducts = await _productResource.GetPublicRestaurantProducts(specification);

            var productToCategoryMap = restaurantProducts
                .Where(p => p.Category != null)
                .ToDictionary(p => p.Name, p => p.Category.Name);

            var categoryStats = new Dictionary<string, decimal>();

            foreach (var item in soldItems)
            {
                string catName = productToCategoryMap.ContainsKey(item.Name)
                    ? productToCategoryMap[item.Name]
                    : "Other";

                if (!categoryStats.ContainsKey(catName)) categoryStats[catName] = 0;
                categoryStats[catName] += item.Quantity;
            }

            response.SalesByCategory = categoryStats
                .Select(x => new CategoryStat { Name = x.Key, TotalSales = x.Value })
                .ToList();

            return response;
        }
    }
}