using Azure;
using Honse.Global;
using Honse.Global.Extensions;
using Honse.Managers.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace Honse.API.Controllers
{
    [Route("api/public/restaurants")]
    [ApiController]
    public class PublicRestaurantController : ControllerBase
    {
        private readonly IRestaurantManager restaurantManager;

        public PublicRestaurantController(IRestaurantManager restaurantManager)
        {
            this.restaurantManager = restaurantManager;
        }

        [HttpGet]
        public async Task<IActionResult> GetFilteredRestaurants([FromQuery] PublicRestaurantFilterRequest request)
        {
            if (!ModelState.IsValid)
            {
                string errorMessage = ModelState.Values
                    .SelectMany(x => x.Errors)
                    .First()
                    .ErrorMessage;

                return BadRequest((new { errorMessage }));
            }

            // Validate pagination
            if (request.PageSize < 1 || request.PageSize > 100 || request.PageNumber < 1)
            {
                request.PageSize = 20; // default
                request.PageNumber = 1;
            }

            var restaurantResponse = await restaurantManager.FilterPublicRestaurants(request).WithTryCatch();

            if (!restaurantResponse.IsSuccessfull)
            {
                return BadRequest(restaurantResponse.Exception.Message);
            }

            return Ok(restaurantResponse.Result);
        }
    }
}
