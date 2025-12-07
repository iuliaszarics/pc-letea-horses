using Honse.Global.Extensions;
using Honse.Managers.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace Honse.API.Controllers
{
    [Route("api/orderProducts")]
    [ApiController]
    public class OrderProductController : ControllerBase
    {
        private readonly IOrderProductManager orderProductManager;
        private readonly IUserManager userManager;

        public OrderProductController(IOrderProductManager orderProductManager, IUserManager userManager)
        {
            this.orderProductManager = orderProductManager;
            this.userManager = userManager;
        }

        [Authorize]
        [HttpGet]
        [Route("{id}")]
        public async Task<IActionResult> GetOrderProduct([FromRoute] Guid id)
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

            var orderProductResponse = await orderProductManager.GetOrderProductById(id).WithTryCatch();

            if (!orderProductResponse.IsSuccessfull)
            {
                return BadRequest(orderProductResponse.Exception.Message);
            }

            return Ok(orderProductResponse.Result);
        }

        [Authorize]
        [HttpGet]
        [Route("order/{orderId}")]
        public async Task<IActionResult> GetOrderProducts([FromRoute] Guid orderId)
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

            var orderProductsResponse = await orderProductManager.GetAllOrderProducts(orderId).WithTryCatch();

            if (!orderProductsResponse.IsSuccessfull)
            {
                return BadRequest(orderProductsResponse.Exception.Message);
            }

            return Ok(orderProductsResponse.Result);
        }

        [Authorize]
        [HttpGet]
        public async Task<IActionResult> GetFilteredOrderProducts([FromQuery] OrderProductFilterRequest request)
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

            var orderProductsResponse = await orderProductManager.FilterOrderProducts(request).WithTryCatch();

            if (!orderProductsResponse.IsSuccessfull)
            {
                return BadRequest(orderProductsResponse.Exception.Message);
            }

            return Ok(orderProductsResponse.Result);
        }

        [Authorize]
        [HttpPost]
        public async Task<IActionResult> CreateOrderProduct([FromBody] CreateOrderProductRequest request)
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

            var orderProductResponse = await orderProductManager.AddOrderProduct(request).WithTryCatch();

            if (!orderProductResponse.IsSuccessfull)
            {
                return BadRequest(orderProductResponse.Exception.Message);
            }

            return Created();
        }

        [Authorize]
        [HttpDelete]
        [Route("{id}")]
        public async Task<IActionResult> DeleteOrderProduct([FromRoute] Guid id)
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

            var orderProductResponse = await orderProductManager.DeleteOrderProduct(id, user.Id).WithTryCatch();

            if (!orderProductResponse.IsSuccessfull)
            {
                return BadRequest(orderProductResponse.Exception.Message);
            }

            return Ok();
        }

        [Authorize]
        [HttpPut]
        public async Task<IActionResult> UpdateOrderProduct([FromBody] UpdateOrderProductRequest request)
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

            var orderProductResponse = await orderProductManager.UpdateOrderProduct(request).WithTryCatch();

            if (!orderProductResponse.IsSuccessfull)
            {
                return BadRequest(orderProductResponse.Exception.Message);
            }

            return Ok(orderProductResponse.Result);
        }
    }
}