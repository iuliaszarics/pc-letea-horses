using System.ComponentModel.DataAnnotations;

namespace Honse.Engines.Common
{
    public class UserLogin
    {
        public string UserName { get; set; }

        public string Password { get; set; }
    }

    public class UserRegister
    {
        public string UserName { get; set; }

        [EmailAddress]
        public string Email { get; set; }

        public string Password { get; set; }

        public string ConfirmPassword { get; set; }
    }

    public class UserProfileUpdate
    {
        public string UserName { get; set; }

        [EmailAddress]
        public string Email { get; set; }
    }
    
    public class UserChangePassword
    {
        public string CurrentPassword { get; set; }

        public string NewPassword { get; set; }

        public string ConfirmNewPassword { get; set; }
    }
}
