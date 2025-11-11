
namespace Honse.Engines.Validation.Interfaces
{
    public interface IProductCategoryValidationEngine
    {
        void ValidateCreateProductCategory(Common.CreateProductCategory productCategory);

        void ValidateUpdateProductCategory(Common.UpdateProductCategoryRequest productCategory);
    }
}
