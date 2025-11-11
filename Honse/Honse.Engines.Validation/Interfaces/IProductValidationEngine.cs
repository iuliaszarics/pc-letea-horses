
namespace Honse.Engines.Validation.Interfaces
{
    public interface IProductValidationEngine
    {
        void ValidateCreateProduct(Common.CreateProduct product);

        void ValidateUpdateProduct(Common.UpdateProduct product);

    }
}
