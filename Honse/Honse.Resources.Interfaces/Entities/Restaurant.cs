
using System.ComponentModel.DataAnnotations.Schema;

namespace Honse.Resources.Interfaces.Entities
{
    public class Restaurant : Entity
    {
        public string Name { get; set; } = string.Empty;
        
        public string Description { get; set; } = string.Empty;

        public Global.Address Address { get; set; }
        public string Phone { get; set; } = string.Empty;

        public string Email {  get; set; } = string.Empty;

        public string Image { get; set; } = string.Empty;

        public string CuisineType {  get; set; } = string.Empty;

        public float AverageRating { get; set; } = 0;

        public int TotalReviews { get; set; } = 0;

        public bool IsEnabled { get; set; } = true;

        // openingtime of type time ( hours:minutes)
        public TimeOnly OpeningTime { get; set; }

        public TimeOnly ClosingTime { get; set; }
        
        // UserID is inherited from EntityClass

        // configuration
        public Guid? ConfigurationId { get; set; }

        [ForeignKey("ConfigurationId")]
        public Configuration? Configuration { get; set; }
    }

}
