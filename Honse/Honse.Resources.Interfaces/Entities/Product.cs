using System.ComponentModel.DataAnnotations.Schema;

namespace Honse.Resources.Interfaces.Entities
{
    public class Product : Entity
    {
        public string Name { get; set; } = string.Empty;

        public string Description { get; set; } = string.Empty;

        public decimal Price { get; set; }

        public decimal VAT { get; set; }

        public string Image { get; set; } = string.Empty;

        public ProductCategory Category { get; set; }

        [ForeignKey("ProductCategory")]
        //[NotMapped]
        public Guid CategoryId { get; set; }

        public bool IsEnabled { get; set; } = true;

        [ForeignKey("Restaurant")]
        public Guid RestaurantId { get; set; }
    }
}
