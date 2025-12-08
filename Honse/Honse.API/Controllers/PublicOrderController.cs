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

            var orderResponse = await orderManager.GetOrderByIdPublic(id).WithTryCatch();

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

            var cancelResponse = await orderManager.CancelOrderPublic(id).WithTryCatch();

            if (!cancelResponse.IsSuccessfull)
            {
                return BadRequest(cancelResponse.Exception.Message);
            }

            return Ok(new { message = "Order cancelled successfully" });
        }
    }
}
