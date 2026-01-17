
using Honse.Global;
using Honse.Global.Extensions;
using Honse.Managers.Interfaces;

namespace Honse.Managers
{
    public class ProductManager : Interfaces.IProductManager
    {
        private readonly Resources.Interfaces.IProductResource productResource;
        private readonly Resources.Interfaces.IProductCategoryResource productCategoryResource;
        private readonly Engines.Filtering.Interfaces.IProductFilteringEngine productFilteringEngine;
        private readonly Engines.Validation.Interfaces.IProductValidationEngine productValidationEngine;

        public ProductManager(
            Resources.Interfaces.IProductResource productResource,
            Resources.Interfaces.IProductCategoryResource productCategoryResource,
            Engines.Filtering.Interfaces.IProductFilteringEngine productFilteringEngine,
            Engines.Validation.Interfaces.IProductValidationEngine productValidationEngine)
        {
            this.productResource = productResource;
            this.productCategoryResource = productCategoryResource;
            this.productFilteringEngine = productFilteringEngine;
            this.productValidationEngine = productValidationEngine;
        }

        public async Task<Interfaces.Product> AddProduct(CreateProductRequest request)
        {
            productValidationEngine.ValidateCreateProduct(request.DeepCopyTo<Engines.Common.CreateProduct>());

            var productCategory = await productCategoryResource.GetByIdNoTracking(request.CategoryId, request.UserId);

            var product = request.DeepCopyTo<Resources.Interfaces.Entities.Product>();

            product.Id = Guid.NewGuid();

            if (productCategory == null)
            {
                Guid categoryId = Guid.NewGuid();

                await productCategoryResource.Add(new Resources.Interfaces.Entities.ProductCategory
                {
                    Id = categoryId,
                    Name = request.CategoryName,
                    UserId = request.UserId,
                });

                product.CategoryId = categoryId;
            }

                product = await productResource.Add(product);

            return product.DeepCopyTo<Interfaces.Product>();
        }

        public async Task DeleteProduct(Guid id, Guid userId)
        {
            bool result = await productResource.Delete(id, userId);

            if (!result)
                throw new Exception("Couldn't delete product!");
        }

        public async Task<List<Interfaces.Product>> GetAllProducts(Guid userId)
        {
            var products = await productResource.GetAll(userId);

            return products.DeepCopyTo<List<Interfaces.Product>>();
        }

        public async Task<Interfaces.Product> GetProductById(Guid id, Guid userId)
        {
            var product = await productResource.GetById(id, userId);

            if (product == null)
                throw new Exception("Product not found!");

            return product.DeepCopyTo<Product>();
        }

        public async Task<PaginatedResult<Product>> FilterProducts(ProductFilterRequest request)
        {
            var specification = productFilteringEngine.GetSpecification(request.DeepCopyTo<Engines.Filtering.Interfaces.ProductFilterRequest>());

            var products = await productResource.Filter(specification, request.PageSize, request.PageNumber);

            return products.DeepCopyTo<PaginatedResult<Product>>();
        }

        public async Task<Interfaces.Product> UpdateProduct(UpdateProductRequest request)
        {
            productValidationEngine.ValidateUpdateProduct(request.DeepCopyTo<Engines.Common.UpdateProduct>());

            var productCategory = await productCategoryResource.GetByIdNoTracking(request.CategoryId, request.UserId); 

            var product = request.DeepCopyTo<Resources.Interfaces.Entities.Product>();

            product.Id = request.Id;

            if (productCategory == null)
            {
                Guid categoryId = Guid.NewGuid();

                productCategory = await productCategoryResource.Add(new Resources.Interfaces.Entities.ProductCategory
                {
                    Id = categoryId,
                    Name = request.CategoryName,
                    UserId = request.UserId,
                });

                product.CategoryId = categoryId;
            }

            product = await productResource.Update(request.Id, request.UserId, product);
            product.Category = productCategory;
            return product.DeepCopyTo<Interfaces.Product>();
        }
    }
}
