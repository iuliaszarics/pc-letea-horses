using System.ComponentModel.DataAnnotations.Schema;

namespace Honse.Resources.Interfaces.Entities
{
    public class ProductCategory : Entity
    {
        public string Name { get; set; } = string.Empty;

        public Restaurant Restaurant { get; set; }

        [ForeignKey("Restaurant")]
        public Guid RestaurantId { get; set; }
    }
}
