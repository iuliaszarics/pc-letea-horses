using Honse.Global.Extensions;
using Honse.Managers.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Honse.API.Controllers
{
    [Route("public/restaurants")]
    [ApiController]
    public class PublicRestaurantController : ControllerBase
    {
        private readonly IRestaurantManager restaurantManager;

        public PublicRestaurantController(IRestaurantManager restaurantManager)
        {
            this.restaurantManager = restaurantManager;
        }

        [AllowAnonymous]
        [HttpGet]
        public async Task<IActionResult> GetPublicRestaurants([FromQuery] int pageSize = 20, [FromQuery] int pageNumber = 1)
        {
            if (!ModelState.IsValid)
            {
                string errorMessage = ModelState.Values
                    .SelectMany(x => x.Errors)
                    .First()
                    .ErrorMessage;

                return BadRequest(new { errorMessage });
            }

            if (pageSize < 1 || pageSize > 100 || pageNumber < 1)
            {
                return BadRequest(new { errorMessage = "Invalid pagination." });
            }

            var response = await restaurantManager.GetPublicRestaurants(pageSize, pageNumber).WithTryCatch();

            if (!response.IsSuccessfull)
            {
                return BadRequest(response.Exception.Message);
            }

            Response.Headers["Cache-Control"] = "public,max-age=60";
            return Ok(response.Result);
        }
    }
}
