
using Honse.Global.Extensions;
using Honse.Managers.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace Honse.API.Controllers
{
    [Route("api/productCategory")]
    [ApiController]
    public class ProductCategoryController : ControllerBase
    {
        private readonly IProductCategoryManager productCategoryManager;
        private readonly IUserManager userManager;

        public ProductCategoryController(Managers.Interfaces.IProductCategoryManager productCategoryManager, Managers.Interfaces.IUserManager userManager)
        {
            this.productCategoryManager = productCategoryManager;
            this.userManager = userManager;
        }

        [Authorize]
        [HttpGet]
        [Route("{id}")]
        public async Task<IActionResult> GetRestaurantsCategory([FromRoute] Guid id)
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

            var categoryResponse = await productCategoryManager.GetCategoryById(id, user.Id).WithTryCatch();

            if (!categoryResponse.IsSuccessfull)
            {
                return BadRequest(categoryResponse.Exception.Message);
            }

            return Ok(categoryResponse.Result);
        }

        [Authorize]
        [HttpGet]
        [Route("restaurant/{id}")]
        public async Task<IActionResult> GetCategory([FromRoute] Guid id)
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

            var categoryResponse = await productCategoryManager.GetRestaurantCategories(user.Id, id).WithTryCatch();

            if (!categoryResponse.IsSuccessfull)
            {
                return BadRequest(categoryResponse.Exception.Message);
            }

            return Ok(categoryResponse.Result);
        }

        [Authorize]
        [HttpGet]
        [Route("all")]
        public async Task<IActionResult> GetAllCategories()
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

            var categoryResponse = await productCategoryManager.GetAllCategories(user.Id).WithTryCatch();

            if (!categoryResponse.IsSuccessfull)
            {
                return BadRequest(categoryResponse.Exception.Message);
            }

            return Ok(categoryResponse.Result);
        }

        [Authorize]
        [HttpPost]
        public async Task<IActionResult> CreateProduct([FromBody] Managers.Interfaces.CreateProductCategoryRequest request)
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

            var categoryResponse = await productCategoryManager.AddCategory(request).WithTryCatch();

            if (!categoryResponse.IsSuccessfull)
            {
                return BadRequest(categoryResponse.Exception.Message);
            }

            return Created();
        }

        [Authorize]
        [HttpPut]
        public async Task<IActionResult> UpdateProduct([FromBody] Managers.Interfaces.UpdateProductCategoryRequest request)
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

            var categoryResponse = await productCategoryManager.UpdateCategory(request).WithTryCatch();

            if (!categoryResponse.IsSuccessfull)
            {
                return BadRequest(categoryResponse.Exception.Message);
            }

            return Ok(categoryResponse.Result);
        }
    }
}
