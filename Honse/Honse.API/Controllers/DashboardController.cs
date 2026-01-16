using Honse.Global.Dashboard;
using Honse.Managers;
using Honse.Managers.Interfaces;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Threading.Tasks;

namespace Honse.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class DashboardController : ControllerBase
    {
        private readonly IDashboardManager _dashboardManager;

        public DashboardController(IDashboardManager dashboardManager)
        {
            _dashboardManager = dashboardManager;
        }

        [HttpGet("stats")]
        public async Task<IActionResult> GetStats(
            [FromQuery] Guid restaurantId,
            [FromQuery] DateTime startDate,
            [FromQuery] DateTime endDate)
        {
            var request = new DashboardStatsRequest
            {
                RestaurantId = restaurantId,
                StartDate = startDate,
                EndDate = endDate
            };

            var result = await _dashboardManager.GetStats(request);
            return Ok(result);
        }
    }
}