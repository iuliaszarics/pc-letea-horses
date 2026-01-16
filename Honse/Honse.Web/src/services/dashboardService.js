import { api, failure, parseError, successData } from "./productService";

function toDateOnly(date) {
  return date.toISOString().slice(0, 10);
}

export async function getDashboardDataAPI(restaurantId, startDate, endDate) {
  try {
    const params = new URLSearchParams();
    params.append("restaurantId", restaurantId);
    params.append("startDate", toDateOnly(startDate));
    params.append("endDate", toDateOnly(endDate));

    const res = await api.get(`/api/Dashboard/stats?${params.toString()}`);

    const stats = {
      totalRevenue: res.data.totalRevenue,
      newOrders: res.data.newOrders,
      completedOrders: res.data.completedOrders,
      startDate,
      endDate
    };

    const categories = res.data.salesByCategory || [];
    const totalSales = categories.reduce(
      (sum, c) => sum + c.totalSales,
      0
    );

    const categoriesWithPercent = categories.map(c => ({
      name: c.name,
      sales: c.totalSales,
      percent: totalSales
        ? ((c.totalSales / totalSales) * 100).toFixed(1)
        : "0.0"
    }));

    const salesOverTime = res.data.salesOverTime;

    return successData({
      stats,
      lineChart: {
        timeline: salesOverTime.labels.map((label, idx) => ({
          label,
          sales: salesOverTime.values[idx]
        }))
      },
      categories: categoriesWithPercent,
      topProducts: res.data.topProducts
    });

  } catch (err) {
    return failure(parseError(err, "Failed to statistics"));
  }
}
