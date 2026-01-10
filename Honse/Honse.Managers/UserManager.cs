using Honse.Global;
using Honse.Global.Extensions;
using Honse.Managers.Interfaces;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace Honse.Managers
{
    public class UserManager : IUserManager
    {
        private readonly UserManager<User> userManager;
        private readonly IConfiguration configuration;
        private readonly SignInManager<User> signInManager;
        private readonly Engines.Validation.Interfaces.IUserValidationEngine userValidationEngine;

        public UserManager(UserManager<User> userManager,
        IConfiguration configuration,
        SignInManager<User> signInManager,
        Engines.Validation.Interfaces.IUserValidationEngine userValidationEngine)
        {
            this.userManager = userManager;
            this.configuration = configuration;
            this.signInManager = signInManager;
            this.userValidationEngine = userValidationEngine;
        }

        public async Task<User> GetUserByName(string userName)
        {
            User? user = await userManager.FindByNameAsync(userName);

            if (user == null)
                throw new Exception("User not found!");

            return user;
        }

        public async Task<UserAuthenticationResponse> Login(UserLoginRequest request)
        {
            userValidationEngine.ValidateLogin(request.DeepCopyTo<Engines.Common.UserLogin>());

            User? user = await userManager.Users.FirstOrDefaultAsync(x => x.UserName == request.UserName || x.Email == request.UserName);

            if (user == null)
            {
                throw new Exception("Invalid username or password!");
            }

            SignInResult result = await signInManager.CheckPasswordSignInAsync(user, request.Password, false);

            if (!result.Succeeded)
            {
                throw new Exception("Invalid username or password!");
            }

            return new UserAuthenticationResponse
            {
                Token = CreateToken(user),
                Succeeded = true,
                Username = user.UserName
            };
        }

        public async Task<UserAuthenticationResponse> Register(UserRegisterRequest request)
        {
            userValidationEngine.ValidateRegister(request.DeepCopyTo<Engines.Common.UserRegister>());

            User user = request.DeepCopyTo<User>();

            IdentityResult createdUser = await userManager.CreateAsync(user, request.Password);

            if (!createdUser.Succeeded)
            {
                throw new Exception(string.Join("\n", createdUser.Errors.Select(e => e.Description)));
            }

            return new UserAuthenticationResponse
            {
                Succeeded = true,
                Username = user.UserName,
                Token = CreateToken(user)
            };
        }

        private string CreateToken(User user)
        {
            List<Claim> claims = new List<Claim>
            {
                new(JwtRegisteredClaimNames.Email, user.Email),
                new(JwtRegisteredClaimNames.GivenName, user.UserName),
                new(JwtRegisteredClaimNames.Sub, user.Id.ToString()),
            };

            SigningCredentials credentials = new SigningCredentials(
                new SymmetricSecurityKey(Encoding.UTF8.GetBytes(configuration["JWT:SigningKey"])),
                SecurityAlgorithms.HmacSha512);

            SecurityTokenDescriptor tokenDescriptor = new SecurityTokenDescriptor
            {
                Subject = new ClaimsIdentity(claims),
                Expires = DateTime.Now.AddDays(7),
                SigningCredentials = credentials,
                Issuer = configuration["JWT:Issuer"],
                Audience = configuration["JWT:Audience"]
            };

            JwtSecurityTokenHandler tokenHandler = new JwtSecurityTokenHandler();

            SecurityToken token = tokenHandler.CreateToken(tokenDescriptor);

            return tokenHandler.WriteToken(token);
        }
        
        public async Task<User> UpdateProfile(string userId, UpdateProfileRequest request)
        {
            userValidationEngine.ValidateProfileUpdate(new Engines.Common.UserProfileUpdate
            {
                UserName = request.UserName,
                Email = request.Email
            });

            User? user = await userManager.FindByIdAsync(userId);
            if (user == null)
                throw new Exception("User not found!");

            var usernameResult = await userManager.SetUserNameAsync(user, request.UserName.Trim());
            if (!usernameResult.Succeeded)
                throw new Exception(string.Join("\n", usernameResult.Errors.Select(e => e.Description)));

            var emailResult = await userManager.SetEmailAsync(user, request.Email.Trim());
            if (!emailResult.Succeeded)
                throw new Exception(string.Join("\n", emailResult.Errors.Select(e => e.Description)));

            return user;
        }
        public async Task ChangePassword(string userId, ChangePasswordRequest request)
        {
            userValidationEngine.ValidateChangePassword(new Engines.Common.UserChangePassword
            {
                CurrentPassword = request.CurrentPassword,
                NewPassword = request.NewPassword,
                ConfirmNewPassword = request.ConfirmNewPassword
            });

            User? user = await userManager.FindByIdAsync(userId);
            if (user == null)
                throw new Exception("User not found!");

            var result = await userManager.ChangePasswordAsync(user, request.CurrentPassword, request.NewPassword);
            if (!result.Succeeded)
                throw new Exception(string.Join("\n", result.Errors.Select(e => e.Description)));
        }
        
    }
}
