
using Honse.Engines.Validation.Interfaces;
using Honse.Global.Extensions;
using Honse.Managers.Interfaces;
using Honse.Resources.Interfaces;

namespace Honse.Managers
{
    public class ProductCategoryManager : IProductCategoryManager
    {
        private readonly IProductCategoryResource productCategoryResource;
        private readonly IRestaurantResource restaurantResource;
        private readonly IProductCategoryValidationEngine productCategoryValidationEngine;

        public ProductCategoryManager(Resources.Interfaces.IProductCategoryResource productCategoryResource,
            Resources.Interfaces.IRestaurantResource restaurantResource,
            Engines.Validation.Interfaces.IProductCategoryValidationEngine productCategoryValidationEngine)
        {
            this.productCategoryResource = productCategoryResource;
            this.restaurantResource = restaurantResource;
            this.productCategoryValidationEngine = productCategoryValidationEngine;
        }

        public async Task<ProductCategory> AddCategory(CreateProductCategoryRequest request)
        {
            // Validate
            productCategoryValidationEngine.ValidateCreateProductCategory(request.DeepCopyTo<Engines.Common.CreateProductCategory>());

            var restaurant = await restaurantResource.GetById(request.RestaurantId, request.UserId);

            if (restaurant == null)
                throw new Exception("Restaurant not found!");

            var category = request.DeepCopyTo<Resources.Interfaces.Entities.ProductCategory>();

            category.Id = Guid.NewGuid();

            //[SMV 11/11/25] DON'T ADD THESE, AS THEY WILL TRY TO INSERT IT AGAIN IN THE TABLE
            //category.Restaurant = restaurant;

            category = await productCategoryResource.Add(category);

            return category.DeepCopyTo<ProductCategory>();
        }

        public async Task<List<ProductCategory>> GetAllCategories(Guid userId)
        {
            IEnumerable<Resources.Interfaces.Entities.ProductCategory> categories = await productCategoryResource.GetAll(userId);

            return categories.DeepCopyTo<List<ProductCategory>>();
        }

        public async Task<ProductCategory> GetCategoryById(Guid id, Guid userId)
        {
            var productCategory = await productCategoryResource.GetById(id, userId);

            if (productCategory == null)
                throw new Exception("Product category not found!");

            return productCategory.DeepCopyTo<ProductCategory>();
        }

        public async Task<List<ProductCategory>> GetRestaurantCategories(Guid userId, Guid restaurantId)
        {
            IEnumerable<Resources.Interfaces.Entities.ProductCategory> categories = await productCategoryResource.GetRestaurantCategories(userId, restaurantId);

            return categories.DeepCopyTo<List<ProductCategory>>();
        }

        public async Task<ProductCategory> UpdateCategory(UpdateProductCategoryRequest request)
        {
            // Validate
            productCategoryValidationEngine.ValidateUpdateProductCategory(request.DeepCopyTo<Engines.Common.UpdateProductCategoryRequest>());

            if (request.RestaurantId != null)
            {
                var restaurant = await restaurantResource.GetById(request.RestaurantId.Value, request.UserId);

                if (restaurant == null)
                    throw new Exception("Restaurant not found!");
            }

            var category = request.DeepCopyTo<Resources.Interfaces.Entities.ProductCategory>();

            //[SMV 11/11/25] DON'T ADD THESE, AS THEY WILL TRY TO INSERT IT AGAIN IN THE TABLE
            //category.Restaurant = restaurant;

            category = await productCategoryResource.Update(request.Id, request.UserId, category);

            if (category == null)
                throw new Exception($"Category with id {request.Id} not found!");

            return category.DeepCopyTo<ProductCategory>();
        }
    }
}
