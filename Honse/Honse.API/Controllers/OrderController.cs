using Honse.Global.Extensions;
using Honse.Managers.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace Honse.API.Controllers
{
    [Route("api/orders")]
    [ApiController]
    public class OrderController : ControllerBase
    {
        private readonly IOrderManager orderManager;
        private readonly IUserManager userManager;

        public OrderController(IOrderManager orderManager, IUserManager userManager)
        {
            this.orderManager = orderManager;
            this.userManager = userManager;
        }

        /// <summary>
        /// Gets all the orders of a restaurant
        /// </summary>
        /// <param name="restaurantId"></param>
        /// <returns></returns>
        [Authorize]
        [HttpGet]
        [Route("all/{restaurantId}")]
        public async Task<IActionResult> GetAllOrders([FromRoute] Guid restaurantId)
        {
            if (!ModelState.IsValid)
            {
                string errorMessage = ModelState.Values
                    .SelectMany(x => x.Errors)
                    .First()
                    .ErrorMessage;

                return BadRequest((new { errorMessage }));
            }

            string? userName = User.FindFirstValue(ClaimTypes.GivenName);

            var userResponse = await userManager.GetUserByName(userName).WithTryCatch();

            if (!userResponse.IsSuccessfull)
            {
                return BadRequest(userResponse.Exception.Message);
            }

            Global.User user = userResponse.Result;

            var orderResponse = await orderManager.GetAllOrdersByRestaurant(restaurantId, user.Id).WithTryCatch();

            if (!orderResponse.IsSuccessfull)
            {
                return BadRequest(orderResponse.Exception.Message);
            }

            return Ok(orderResponse.Result);
        }

        [Authorize]
        [HttpGet]
        public async Task<IActionResult> GetFilteredOrders([FromQuery] OrderFilterRequest request)
        {
            if (!ModelState.IsValid)
            {
                string errorMessage = ModelState.Values
                    .SelectMany(x => x.Errors)
                    .First()
                    .ErrorMessage;

                return BadRequest((new { errorMessage }));
            }

            string? userName = User.FindFirstValue(ClaimTypes.GivenName);

            var userResponse = await userManager.GetUserByName(userName).WithTryCatch();

            if (!userResponse.IsSuccessfull)
            {
                return BadRequest(userResponse.Exception.Message);
            }

            Global.User user = userResponse.Result;

            request.UserId = user.Id;

            var orderResponse = await orderManager.FilterOrders(request).WithTryCatch();

            if (!orderResponse.IsSuccessfull)
            {
                return BadRequest(orderResponse.Exception.Message);
            }

            return Ok(orderResponse.Result);
        }

        /// <summary>
        /// Gets details of an order
        /// </summary>
        /// <param name="restaurantId"></param>
        /// <param name="id"></param>
        /// <returns></returns>
        [Authorize]
        [HttpGet]
        [Route("details/{restaurantId}/{id}")]
        public async Task<IActionResult> GetOrderDetails([FromRoute] Guid restaurantId, [FromRoute] Guid id)
        {
            if (!ModelState.IsValid)
            {
                string errorMessage = ModelState.Values
                    .SelectMany(x => x.Errors)
                    .First()
                    .ErrorMessage;

                return BadRequest((new { errorMessage }));
            }

            string? userName = User.FindFirstValue(ClaimTypes.GivenName);

            var userResponse = await userManager.GetUserByName(userName).WithTryCatch();

            if (!userResponse.IsSuccessfull)
            {
                return BadRequest(userResponse.Exception.Message);
            }

            Global.User user = userResponse.Result;

            var orderResponse = await orderManager.GetOrderById(id, user.Id).WithTryCatch();

            if (!orderResponse.IsSuccessfull)
            {
                return BadRequest(orderResponse.Exception.Message);
            }

            // Verify order belongs to restaurant
            if (orderResponse.Result?.RestaurantId != restaurantId)
            {
                return BadRequest(new { errorMessage = "Order does not belong to this restaurant" });
            }

            return Ok(orderResponse.Result);
        }

        /// <summary>
        /// Processes an order from one status to another
        /// </summary>
        /// <param name="request"></param>
        /// <returns></returns>
        [Authorize]
        [HttpPost]
        [Route("process")]
        public async Task<IActionResult> ProcessOrder([FromBody] OrderProcessRequest request)
        {
            if (!ModelState.IsValid)
            {
                string errorMessage = ModelState.Values
                    .SelectMany(x => x.Errors)
                    .First()
                    .ErrorMessage;

                return BadRequest((new { errorMessage }));
            }

            string? userName = User.FindFirstValue(ClaimTypes.GivenName);

            var userResponse = await userManager.GetUserByName(userName).WithTryCatch();

            if (!userResponse.IsSuccessfull)
            {
                return BadRequest(userResponse.Exception.Message);
            }

            Global.User user = userResponse.Result;

            request.UserId = user.Id;

            var orderResponse = await orderManager.ProcessOrder(request).WithTryCatch();

            if (!orderResponse.IsSuccessfull)
            {
                return BadRequest(orderResponse.Exception.Message);
            }

            return Ok(orderResponse.Result);
        }

        [Authorize]
        [HttpPost]
        public async Task<IActionResult> CreateOrder([FromBody] CreateOrderRequest request)
        {
            if (!ModelState.IsValid)
            {
                string errorMessage = ModelState.Values
                    .SelectMany(x => x.Errors)
                    .First()
                    .ErrorMessage;

                return BadRequest((new { errorMessage }));
            }

            string? userName = User.FindFirstValue(ClaimTypes.GivenName);

            var userResponse = await userManager.GetUserByName(userName).WithTryCatch();

            if (!userResponse.IsSuccessfull)
            {
                return BadRequest(userResponse.Exception.Message);
            }

            Global.User user = userResponse.Result;

            request.UserId = user.Id;

            var orderResponse = await orderManager.AddOrder(request).WithTryCatch();

            if (!orderResponse.IsSuccessfull)
            {
                return BadRequest(orderResponse.Exception.Message);
            }

            return Created();
        }
    }
}
