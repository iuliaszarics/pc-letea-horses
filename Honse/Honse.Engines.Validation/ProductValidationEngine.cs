using Honse.Engines.Common;
using Honse.Engines.Validation.Interfaces;
using Honse.Global.Exceptions;

namespace Honse.Engines.Validation
{
    public class ProductValidationEngine : IProductValidationEngine
    {
        public void ValidateCreateProduct(CreateProduct product)
        {
            string errorMessage = "";

            List<int> vats = [0, 5, 11, 21];

            if (product.UserId == Guid.Empty)
                errorMessage += "UserId is required!\n";

            if (string.IsNullOrEmpty(product.Name))
                errorMessage += "Product name is required!\n";

            if (product.Price < 0)
                errorMessage += "Product price can't be negative!\n";

            if (!vats.Any(vat => vat == product.VAT))
                errorMessage += "Product VAT is not valid!\n";

            if (!string.IsNullOrEmpty(errorMessage))
                throw new ValidationException(errorMessage);
        }

        public void ValidateUpdateProduct(UpdateProduct product)
        {
            string errorMessage = "";

            List<int> vats = [0, 5, 11, 21];

            if (product.Id == Guid.Empty)
                errorMessage += "Id is required!\n";

            if (product.UserId == Guid.Empty)
                errorMessage += "UserId is required!\n";

            if (string.IsNullOrEmpty(product.Name))
                errorMessage += "Product name is required!\n";

            if (product.Price < 0)
                errorMessage += "Product price can't be negative!\n";

            if (!vats.Any(vat => vat == product.VAT))
                errorMessage += "Product VAT is not valid!\n";

            if (!string.IsNullOrEmpty(errorMessage))
                throw new ValidationException(errorMessage);
        }
    }
}
