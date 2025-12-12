using Honse.Global.Extensions;
using Honse.Managers.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace Honse.API.Controllers
{
    [Route("api/public/orders")]
    [ApiController]
    public class PublicOrderController : ControllerBase
    {
        private readonly IOrderManager orderManager;

        public PublicOrderController(IOrderManager orderManager)
        {
            this.orderManager = orderManager;
        }

        /// <summary>
        /// Gets order details publicly (for customers to track their order)
        /// </summary>
        /// <param name="id"></param>
        /// <returns></returns>
        [HttpGet]
        [Route("{id}")]
        public async Task<IActionResult> GetOrderDetails([FromRoute] Guid id)
        {
            if (!ModelState.IsValid)
            {
                string errorMessage = ModelState.Values
                    .SelectMany(x => x.Errors)
                    .First()
                    .ErrorMessage;

                return BadRequest((new { errorMessage }));
            }

            var orderResponse = await orderManager.GetOrderById(id).WithTryCatch();

            if (!orderResponse.IsSuccessfull)
            {
                return BadRequest(orderResponse.Exception.Message);
            }

            if (orderResponse.Result == null)
            {
                return NotFound(new { errorMessage = "Order not found" });
            }

            return Ok(orderResponse.Result);
        }

        /// <summary>
        /// Allows customer to cancel their order
        /// </summary>
        /// <param name="id"></param>
        /// <returns></returns>
        [HttpPost]
        [Route("cancel/{id}")]
        public async Task<IActionResult> CancelOrder([FromRoute] Guid id)
        {
            if (!ModelState.IsValid)
            {
                string errorMessage = ModelState.Values
                    .SelectMany(x => x.Errors)
                    .First()
                    .ErrorMessage;

                return BadRequest((new { errorMessage }));
            }

            var cancelResponse = await orderManager.CancelOrder(id).WithTryCatch();

            if (!cancelResponse.IsSuccessfull)
            {
                return BadRequest(cancelResponse.Exception.Message);
            }

            return Ok(new { message = "Order cancelled successfully" });
        }

        [HttpPost]
        [Route("place")]
        public async Task<IActionResult> PlaceOrder([FromBody] PlaceOrderRequest request)
        {
            if (!ModelState.IsValid)
            {
                string errorMessage = ModelState.Values
                    .SelectMany(x => x.Errors)
                    .First()
                    .ErrorMessage;

                return BadRequest(new { errorMessage });
            }

            var placeResponse = await orderManager.PlaceOrder(request).WithTryCatch();

            if (!placeResponse.IsSuccessfull)
            {
                return BadRequest(placeResponse.Exception.Message);
            }

            return Ok(new { tokenId = placeResponse.Result, message = "Order placed successfully. Please check your email to confirm." });
        }

        [HttpPost]
        [Route("validate")]
        public async Task<IActionResult> ValidateOrder([FromBody] PlaceOrderRequest request)
        {
            if (!ModelState.IsValid)
            {
                string errorMessage = ModelState.Values
                    .SelectMany(x => x.Errors)
                    .First()
                    .ErrorMessage;

                return BadRequest(new { errorMessage });
            }

            var validationResponse = await orderManager.ValidateOrder(request).WithTryCatch();

            if (!validationResponse.IsSuccessfull)
            {
                return BadRequest(validationResponse.Exception.Message);
            }

            if (!validationResponse.Result.IsValid)
            {
                return BadRequest(new { errors = validationResponse.Result.Errors });
            }

            return Ok(new { message = "Order validation successful" });
        }

        [HttpPost]
        [Route("confirm/{id}")]
        public async Task<IActionResult> ConfirmOrder([FromRoute] Guid id)
        {
            if (!ModelState.IsValid)
            {
                string errorMessage = ModelState.Values
                    .SelectMany(x => x.Errors)
                    .First()
                    .ErrorMessage;

                return BadRequest(new { errorMessage });
            }

            var confirmResponse = await orderManager.ConfirmOrder(id).WithTryCatch();

            if (!confirmResponse.IsSuccessfull)
            {
                return BadRequest(confirmResponse.Exception.Message);
            }

            return Ok(new { order = confirmResponse.Result, message = "Order confirmed successfully" });
        }
    }
}
