
namespace Honse.Engines.Common
{
    public class CreateProductCategory
    {
        public Guid Id { get; set; }

        public string Name { get; set; } = string.Empty;

        public Guid RestaurantId { get; set; }

        public Guid UserId { get; set; }
    }

    public class UpdateProductCategoryRequest
    {
        public Guid Id { get; set; }

        public string Name { get; set; } = string.Empty;

        public Guid? RestaurantId { get; set; }

        public Guid UserId { get; set; }
    }
}
