using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;
using Honse.Global.Extensions;
using Honse.Managers.Interfaces;

namespace Honse.API.Controllers
{
    [Route("api/configurations")]
    [ApiController]
    public class ConfigurationsController : ControllerBase
    {
        private readonly IConfigurationsManager _configurationsManager;
        private readonly IUserManager _userManager;

        public ConfigurationsController(IConfigurationsManager configurationsManager, IUserManager userManager)
        {
            _configurationsManager = configurationsManager;
            _userManager = userManager;
        }

        [Authorize]
        [HttpGet]
        public async Task<IActionResult> GetConfigurations()
        {
            if (!ModelState.IsValid) return BadRequest();

            string? userName = User.FindFirstValue(ClaimTypes.GivenName);
            var userResponse = await _userManager.GetUserByName(userName).WithTryCatch();
            if (!userResponse.IsSuccessfull) return BadRequest(userResponse.Exception.Message);

            var response = await _configurationsManager.GetAllConfigurations(userResponse.Result.Id).WithTryCatch();
            
            if (!response.IsSuccessfull) return BadRequest(response.Exception.Message);
            return Ok(response.Result);
        }

        [Authorize]
        [HttpPost]
        public async Task<IActionResult> CreateConfiguration([FromBody] CreateConfigurationRequest request)
        {
            if (!ModelState.IsValid) return BadRequest();

            string? userName = User.FindFirstValue(ClaimTypes.GivenName);
            var userResponse = await _userManager.GetUserByName(userName).WithTryCatch();
            if (!userResponse.IsSuccessfull) return BadRequest(userResponse.Exception.Message);

            request.UserId = userResponse.Result.Id;

            var response = await _configurationsManager.AddConfiguration(request).WithTryCatch();

            if (!response.IsSuccessfull) return BadRequest(response.Exception.Message);
            return CreatedAtAction(nameof(GetConfigurations), new { id = response.Result.Id }, response.Result);
        }

        [Authorize]
        [HttpPut]
        [Route("{id}")]
        public async Task<IActionResult> UpdateConfiguration([FromRoute] Guid id, [FromBody] UpdateConfigurationRequest request)
        {
            if (!ModelState.IsValid) return BadRequest();

            string? userName = User.FindFirstValue(ClaimTypes.GivenName);
            var userResponse = await _userManager.GetUserByName(userName).WithTryCatch();
            if (!userResponse.IsSuccessfull) return BadRequest(userResponse.Exception.Message);

            request.UserId = userResponse.Result.Id;
            request.Id = id;
            
            var response = await _configurationsManager.UpdateConfiguration(request).WithTryCatch();

            if (!response.IsSuccessfull) return BadRequest(response.Exception.Message);
            return Ok(response.Result);
        }

        [Authorize]
        [HttpDelete]
        [Route("{id}")]
        public async Task<IActionResult> DeleteConfiguration([FromRoute] Guid id)
        {
            string? userName = User.FindFirstValue(ClaimTypes.GivenName);
            var userResponse = await _userManager.GetUserByName(userName).WithTryCatch();
            if (!userResponse.IsSuccessfull) return BadRequest(userResponse.Exception.Message);

            var response = await _configurationsManager.DeleteConfiguration(id, userResponse.Result.Id).WithTryCatch();

            if (!response.IsSuccessfull) return BadRequest(response.Exception.Message);
            return Ok();
        }
    }
}