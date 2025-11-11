
using Honse.Engines.Common;
using Honse.Engines.Validation.Interfaces;
using Honse.Global.Exceptions;

namespace Honse.Engines.Validation
{
    public class ProductCategoryValidationEngine : IProductCategoryValidationEngine
    {
        public void ValidateCreateProductCategory(CreateProductCategory productCategory)
        {
            string errorMessage = "";

            List<int> vats = [0, 5, 11, 21];

            if (productCategory.UserId == Guid.Empty)
                errorMessage += "UserId is required!\n";

            if (productCategory.RestaurantId == Guid.Empty)
                errorMessage += "RestaurantId is required!\n";

            if (string.IsNullOrEmpty(productCategory.Name))
                errorMessage += "Category name is required!\n";

            if (!productCategory.Name.All(char.IsLetterOrDigit))
                errorMessage += "Category name is not valid!\n";

            if (!string.IsNullOrEmpty(errorMessage))
                throw new ValidationException(errorMessage);
        }

        public void ValidateUpdateProductCategory(UpdateProductCategoryRequest productCategory)
        {
            string errorMessage = "";

            List<int> vats = [0, 5, 11, 21];

            if (productCategory.UserId == Guid.Empty)
                errorMessage += "UserId is required!\n";

            //if (productCategory.RestaurantId == Guid.Empty)
            //    errorMessage += "RestaurantId is required!\n";

            if (string.IsNullOrEmpty(productCategory.Name))
                errorMessage += "Category name is required!\n";

            if (!string.IsNullOrEmpty(errorMessage))
                throw new ValidationException(errorMessage);
        }
    }
}
