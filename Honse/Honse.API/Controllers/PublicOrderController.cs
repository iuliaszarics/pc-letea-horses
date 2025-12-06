using Microsoft.AspNetCore.Mvc;

namespace Honse.API.Controllers
{
    [Route("api/public/orders")]
    [ApiController]
    public class PublicOrderController : ControllerBase
    {
        [HttpGet]
        [Route("{id}")]
        public async Task<IActionResult> GetOrderDetails([FromRoute] Guid id)
        {
            return Ok();
        }

        [HttpPost]
        [Route("cance/{id}")]
        public async Task<IActionResult> CancelOrder([FromRoute] Guid id)
        {
            return Ok();
        }
    }
}
