using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Honse.API.Controllers
{
    [Route("api/orders")]
    [ApiController]
    public class OrderController : ControllerBase
    {
        /// <summary>
        /// Gets all the orders of a restaurant
        /// </summary>
        /// <returns></returns>
        [Authorize]
        [HttpGet]
        [Route("all/{restaurantId}")]
        public async Task<IActionResult> GetAllOrders([FromRoute] Guid restaurantId)
        {
            return Ok();
        }

        /// <summary>
        /// Filters the orders of a restaurant
        /// </summary>
        /// <returns></returns>
        [Authorize]
        [HttpGet]
        public async Task<IActionResult> GetFilteredOrders() //TODO: Add filter object
        {
            return Ok();
        }

        /// <summary>
        /// Gets details of an order
        /// </summary>
        /// <param name="restaurantId"></param>
        /// <param name=""></param>
        /// <returns></returns>
        [Authorize]
        [HttpGet]
        [Route("details/{restaurantId}/{id}")]
        public async Task<IActionResult> GetOrderDetails([FromRoute] Guid restaurantId, [FromRoute] Guid id)
        {
            return Ok();
        }

        /// <summary>
        /// Processes an order from one status to another
        /// </summary>
        /// <param name="request"></param>
        /// <returns></returns>
        [Authorize]
        [HttpPost]
        [Route("process")]
        public async Task<IActionResult> ProcessOrder([FromBody] Managers.Interfaces.OrderProcessRequest request)
        {
            return Ok();
        }

        [Authorize]
        [HttpPost]
        public async Task<IActionResult> CreateOrder()
        {
            return Ok();
        }
    }
}
