using System.ComponentModel.DataAnnotations.Schema;

namespace Honse.Resources.Interfaces.Entities
{
    public class ProductCategory : Entity
    {
        public string Name { get; set; } = string.Empty;
    }
}
