
namespace Honse.Engines.Validation.Interfaces
{
    public interface IUserValidationEngine
    {
        void ValidateRegister(Common.UserRegister user);

        void ValidateLogin(Common.UserLogin user);
        
        void ValidateProfileUpdate(Common.UserProfileUpdate user);
        
        void ValidateChangePassword(Common.UserChangePassword passwordData);
    }
}
