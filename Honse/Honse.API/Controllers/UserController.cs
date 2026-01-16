using System.Security.Claims;
using Honse.Global.Extensions;
using Honse.Managers.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;

namespace Honse.API.Controllers
{
    [Route("api/users")]
    [ApiController]
    public class UserController : ControllerBase
    {
        private readonly IUserManager userManager;
        private readonly UserManager<Honse.Global.User> identityUserManager;

        public UserController(
            IUserManager userManager,
            UserManager<Honse.Global.User> identityUserManager
        )
        {
            this.userManager = userManager;
            this.identityUserManager = identityUserManager;
        }

        [HttpPost("register")]
        public async Task<IActionResult> RegisterUser([FromBody] UserRegisterRequest request)
        {
            if (!ModelState.IsValid)
            {
                string errorMessage = ModelState.Values
                    .SelectMany(x => x.Errors)
                    .First()
                    .ErrorMessage;

                return BadRequest((new { errorMessage }));
            }

            var response = await userManager.Register(request).WithTryCatch();

            if (!response.IsSuccessfull)
            {
                return BadRequest(response.Exception.Message);
            }

            return Ok(response.Result);
        }

        [HttpPost("login")]
        public async Task<IActionResult> LoginUser([FromBody] UserLoginRequest request)
        {

            if (!ModelState.IsValid)
            {
                string errorMessage = ModelState.Values
                    .SelectMany(x => x.Errors)
                    .First()
                    .ErrorMessage;

                return BadRequest((new { errorMessage = errorMessage }));
            }

            var response = await userManager.Login(request).WithTryCatch();

            if (!response.IsSuccessfull)
            {
                return BadRequest(response.Exception.Message);
            }

            return Ok(response.Result);
        }
        
        [HttpPut("me")]
        [Authorize]
        public async Task<IActionResult> UpdateProfile([FromBody] UpdateProfileRequest request)
        {
            if (!ModelState.IsValid)
            {
                string errorMessage = ModelState.Values
                    .SelectMany(x => x.Errors)
                    .First()
                    .ErrorMessage;
                return BadRequest(new { errorMessage });
            }

            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            
            if (string.IsNullOrEmpty(userId))
                return Unauthorized();

            var response = await userManager.UpdateProfile(userId, request).WithTryCatch();

            if (!response.IsSuccessfull)
                return BadRequest(new { errorMessage = response.Exception.Message });

            return Ok(new { userName = response.Result.UserName, email = response.Result.Email });
        }

        [HttpPost("change-password")]
        [Authorize]
        public async Task<IActionResult> ChangePassword([FromBody] ChangePasswordRequest request)
        {
            if (!ModelState.IsValid)
            {
                string errorMessage = ModelState.Values
                    .SelectMany(x => x.Errors)
                    .First()
                    .ErrorMessage;
                return BadRequest(new { errorMessage });
            }

            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            
            if (string.IsNullOrEmpty(userId))
                return Unauthorized();

            var response = await userManager.ChangePassword(userId, request).WithTryCatch();

            if (!response.IsSuccessfull)
                return BadRequest(new { errorMessage = response.Exception.Message });

            return Ok(new { message = "Password changed successfully" });
        }

        [Authorize]
        [HttpGet("me")]
        public async Task<IActionResult> Me()
        {
            var userId =
                User.FindFirstValue(ClaimTypes.NameIdentifier) ??
                User.FindFirstValue(JwtRegisteredClaimNames.Sub) ??
                User.FindFirstValue("sub");

            if (string.IsNullOrWhiteSpace(userId))
                return Unauthorized(new { errorMessage = "Invalid token: missing user id." });

            var user = await identityUserManager.FindByIdAsync(userId);

            if (user == null)
                return Unauthorized(new { errorMessage = "User not found." });

            return Ok(new
            {
                username = user.UserName,
                email = user.Email
            });
        }

    }
}
