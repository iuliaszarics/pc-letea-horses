using System;
using System.Collections.Generic;

namespace Honse.Global.Dashboard
{
    public class DashboardStatsRequest
    {
        public Guid RestaurantId { get; set; }
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
    }

    public class DashboardStatsResponse
    {
        public decimal TotalRevenue { get; set; }
        public int NewOrders { get; set; }
        public int CompletedOrders { get; set; }

        public ChartData SalesOverTime { get; set; } = new();

        public List<CategoryStat> SalesByCategory { get; set; } = new();

        public List<ProductStat> TopProducts { get; set; } = new();
    }

    public class ChartData
    {
        public List<string> Labels { get; set; } = new();
        public List<decimal> Values { get; set; } = new(); 
    }

    public class CategoryStat
    {
        public string Name { get; set; } = string.Empty;
        public decimal TotalSales { get; set; }
    }

    public class ProductStat
    {
        public string Name { get; set; } = string.Empty;
        public string Image { get; set; } = string.Empty;
        public decimal TotalSales { get; set; }
    }
}