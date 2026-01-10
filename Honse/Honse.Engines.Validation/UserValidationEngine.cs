using Honse.Engines.Validation.Interfaces;
using System.ComponentModel.DataAnnotations;
namespace Honse.Engines.Validation
{
    public class UserValidationEngine : IUserValidationEngine
    {
        public void ValidateLogin(Common.UserLogin user)
        {
            string errorMessage = "";

            if (string.IsNullOrEmpty(user.UserName))
                errorMessage += "The username is not valid!\n";

            if (string.IsNullOrEmpty(user.Password))
                errorMessage += "The password is not valid!\n";

            if (!string.IsNullOrEmpty(errorMessage))
                throw new ValidationException(errorMessage);
        }

        public void ValidateRegister(Common.UserRegister user)
        {
            string errorMessage = "";

            ValidationContext validationContext = new ValidationContext(user) { MemberName = nameof(Common.UserRegister.Email) };

            if (!Validator.TryValidateProperty(user.Email, validationContext, new List<ValidationResult>()))
                errorMessage += "The email is not valid!\n";

            if (string.IsNullOrEmpty(user.UserName))
                errorMessage += "The username is not valid!\n";

            if (user.Password != user.ConfirmPassword)
                errorMessage += "The passwords don't match!\n";

            if (!string.IsNullOrEmpty(errorMessage))
                throw new ValidationException(errorMessage);
        }
        
        public void ValidateProfileUpdate(Common.UserProfileUpdate user)
        {
            var errors = new List<string>();

            // Username validation - match frontend exactly
            var username = user.UserName?.Trim() ?? "";
            
            if (string.IsNullOrWhiteSpace(username))
            {
                errors.Add("Username is required");
            }
            else
            {
                if (username.Length < 3)
                {
                    errors.Add("Username must be at least 3 characters");
                }
                else if (username.Length > 20)
                {
                    errors.Add("Username must be at most 20 characters");
                }
                
                if (username.Contains(" "))
                {
                    errors.Add("Username cannot contain spaces");
                }
                
                // Frontend regex: ^[a-zA-Z0-9._]+$ (letters, numbers, dot, underscore only)
                if (!System.Text.RegularExpressions.Regex.IsMatch(username, @"^[a-zA-Z0-9._]+$"))
                {
                    errors.Add("Use only letters, numbers, dot, underscore");
                }
            }

            // Email validation
            var email = user.Email?.Trim() ?? "";
            
            if (string.IsNullOrWhiteSpace(email))
            {
                errors.Add("Email is required");
            }

            if (errors.Any())
            {
                throw new ValidationException(string.Join("; ", errors));
            }
        }

        public void ValidateChangePassword(Common.UserChangePassword passwordData)
        {
            var errors = new List<string>();

            // Current password validation
            if (string.IsNullOrWhiteSpace(passwordData.CurrentPassword))
            {
                errors.Add("Current password is required");
            }

            // New password validation
            if (string.IsNullOrWhiteSpace(passwordData.NewPassword))
            {
                errors.Add("New password is required");
            }
            else if (passwordData.NewPassword.Length < 8)
            {
                errors.Add("New password must be at least 8 characters");
            }

            // Confirm password validation
            if (string.IsNullOrWhiteSpace(passwordData.ConfirmNewPassword))
            {
                errors.Add("Please confirm the new password");
            }
            else if (passwordData.NewPassword != passwordData.ConfirmNewPassword)
            {
                errors.Add("Passwords do not match");
            }

            if (errors.Any())
            {
                throw new ValidationException(string.Join("; ", errors));
            }
        }
    }
}
