using Honse.Engines.Common;
using Honse.Engines.Validation.Interfaces;
using System.ComponentModel.DataAnnotations;

namespace Honse.Engines.Validation
{
    public class RestaurantValidationEngine : IRestaurantValidationEngine
    {
        public void ValidateCreateRestaurant(CreateRestaurant restaurant)
        {
            string errorMessage = "";

            if (restaurant.UserId == Guid.Empty)
                errorMessage += "UserId is required!\n";

            if (string.IsNullOrEmpty(restaurant.Name))
                errorMessage += "Restaurant name is required!\n";

            if (string.IsNullOrEmpty(restaurant.Address))
                errorMessage += "Address is required!\n";

            if (string.IsNullOrEmpty(restaurant.City))
                errorMessage += "City is required!\n";

            if (string.IsNullOrEmpty(restaurant.Phone))
                errorMessage += "Phone is required!\n";

            if (string.IsNullOrEmpty(restaurant.Email))
                errorMessage += "Email is required!\n";

            ValidationContext validationContext = new ValidationContext(restaurant) { MemberName = nameof(CreateRestaurant.Email) };

            if (!Validator.TryValidateProperty(restaurant.Email, validationContext, new List<ValidationResult>()))
                errorMessage += "The email is not valid!\n";

            if (restaurant.OpeningTime >= restaurant.ClosingTime)
                errorMessage += "Opening time must be before closing time!\n";

            if (!string.IsNullOrEmpty(errorMessage))
                throw new ValidationException(errorMessage);
        }
    }
}
