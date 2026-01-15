using Honse.Global.Dashboard;

namespace Honse.Managers.Interfaces
{
    public interface IDashboardManager
    {
        Task<DashboardStatsResponse> GetStats(DashboardStatsRequest request);
    }
}