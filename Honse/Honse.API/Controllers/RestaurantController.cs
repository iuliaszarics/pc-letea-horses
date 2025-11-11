using Azure;
using Honse.Global;
using Honse.Global.Extensions;
using Honse.Managers.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace Honse.API.Controllers
{
    [Route("api/restaurants")]
    [ApiController]
    public class RestaurantController : ControllerBase
    {
        private readonly IRestaurantManager restaurantManager;
        private readonly IUserManager userManager;

        public RestaurantController(IRestaurantManager restaurantManager, IUserManager userManager)
        {
            this.restaurantManager = restaurantManager;
            this.userManager = userManager;
        }

        [Authorize]
        [HttpGet]
        [Route("{id}")]
        public async Task<IActionResult> GetRestaurant([FromRoute] Guid id)
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
            var restaurantResponse = await restaurantManager.GetRestaurantById(id, user.Id).WithTryCatch();


            if (!restaurantResponse.IsSuccessfull)
            {
                return BadRequest(restaurantResponse.Exception.Message);
            }

            return Ok(restaurantResponse.Result);
        }

        [Authorize]
        [HttpGet]
        public async Task<IActionResult> GetFilteredRestaurants([FromQuery] RestaurantFilterRequest request)
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
            var restaurantResponse = await restaurantManager.FilterRestaurants(request).WithTryCatch();

            if (!restaurantResponse.IsSuccessfull)
            {
                return BadRequest(restaurantResponse.Exception.Message);
            }

            return Ok(restaurantResponse.Result);
        }

        [HttpGet]
        [Route("all")]
        public async Task<IActionResult> GetAllRestaurants([FromQuery] PublicRestaurantFilterRequest request)
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

        [Authorize]
        [HttpPost]
        public async Task<IActionResult> CreateRestaurant([FromBody] CreateRestaurantRequest request)
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

            var restaurantResponse = await restaurantManager.AddRestaurant(request).WithTryCatch();

            if (!restaurantResponse.IsSuccessfull)
            {
                return BadRequest(restaurantResponse.Exception.Message);
            }

            return Created();
        }

        [Authorize]
        [HttpPut]
        [Route("{id}")]
        public async Task<IActionResult> UpdateRestaurant([FromRoute] Guid id, [FromBody] UpdateRestaurantRequest request)
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


            request.Id = id;


            var restaurantResponse = await restaurantManager.UpdateRestaurant(request).WithTryCatch();

            if (!restaurantResponse.IsSuccessfull)
            {
                return BadRequest(restaurantResponse.Exception.Message);
            }

            return Ok(restaurantResponse.Result);
        }

        [Authorize]
        [HttpDelete]
        [Route("{id}")]
        public async Task<IActionResult> DeleteRestaurant([FromRoute] Guid id)
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

            var restaurantResponse = await restaurantManager.DeleteRestaurant(id, user.Id).WithTryCatch();

            if (!restaurantResponse.IsSuccessfull)
            {
                return BadRequest(restaurantResponse.Exception.Message);
            }

            return Ok();
        }
    }
}
