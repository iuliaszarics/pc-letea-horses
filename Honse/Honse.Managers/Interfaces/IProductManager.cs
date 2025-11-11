
namespace Honse.Managers.Interfaces
{
    public interface IProductManager
    {
        Task<Product> AddProduct(CreateProductRequest request);

        Task<Product> GetProductById(Guid id, Guid userId);

        Task<Product> UpdateProduct(UpdateProductRequest request);

        Task DeleteProduct(Guid id, Guid userId);

        Task<List<Product>> GetAllProducts(Guid userId);

        Task<Global.PaginatedResult<Product>> FilterProducts(ProductFilterRequest request);
    }

    public class Product
    {
        public Guid Id { get; set; }

        public Guid UserId { get; set; }

        public string Name { get; set; } = string.Empty;

        public string Description { get; set; } = string.Empty;

        public decimal Price { get; set; }

        public decimal VAT { get; set; }

        public string Image { get; set; } = string.Empty;

        public ProductCategory Category { get; set; }
    }

    public class CreateProductRequest
    {
        public Guid UserId { get; set; }

        public string Name { get; set; } = string.Empty;

        public string Description { get; set; } = string.Empty;

        public decimal Price { get; set; }

        public decimal VAT { get; set; }

        public string Image { get; set; } = string.Empty; 

        public Guid CategoryId { get; set; }
    }

    public class UpdateProductRequest
    {
        public Guid UserId { get; set; }

        public string Name { get; set; } = string.Empty;

        public string Description { get; set; } = string.Empty;

        public decimal Price { get; set; }

        public decimal VAT { get; set; }

        public string Image { get; set; } = string.Empty;

        public Guid CategoryId { get; set; }
    }

    public class ProductFilterRequest
    {
        public Guid UserId { get; set; }
        
        public string? SearchKey { get; set; }

        public string? CategoryName { get; set; }

        public Guid? CategoryId { get; set; }

        public Guid? RestaurantId { get; set; }

        public bool? IsActive { get; set; }

        public decimal? MinPrice { get; set; }

        public decimal? MaxPrice { get; set; }

        public int PageSize { get; set; }

        public int PageNumber { get; set; }
    }

    public class ProductCategory
    {
        public Guid Id { get; set; }

        public string Name { get; set; } = string.Empty;
    }
}
