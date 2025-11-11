
namespace Honse.Managers.Interfaces
{
    public interface IProductCategoryManager
    {
        Task<List<ProductCategory>> GetAllCategories(Guid userId);

        Task<ProductCategory> GetCategoryById(Guid id, Guid userId);

        Task<List<ProductCategory>> GetRestaurantCategories(Guid userId, Guid restaurantId);

        //Task DeleteCategory(Guid id, Guid userId);

        Task<ProductCategory> AddCategory(CreateProductCategoryRequest request);

        Task<ProductCategory> UpdateCategory(UpdateProductCategoryRequest request);
    }

    public class ProductCategory
    {
        public Guid Id { get; set; }

        public string Name { get; set; } = string.Empty;

        public Guid RestaurantId { get; set; }

        public Restaurant Restaurant { get; set; }
    }

    public class CreateProductCategoryRequest
    {
        public string Name { get; set; } = string.Empty;

        public Guid RestaurantId { get; set; }

        public Guid UserId { get; set; }
    }

    public class UpdateProductCategoryRequest
    {
        public Guid Id { get; set; }

        public string Name { get; set; } = string.Empty;

        public Guid RestaurantId { get; set; }

        public Guid UserId { get; set; }
    }
}
