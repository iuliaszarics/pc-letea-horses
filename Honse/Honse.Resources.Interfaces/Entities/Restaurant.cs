
namespace Honse.Resources.Interfaces.Entities
{
    public class Restaurant : Entity
    {
        public string Name { get; set; } = string.Empty;
        
        public string Description { get; set; } = string.Empty;

        public string Address {  get; set; } = string.Empty;

        public string City { get; set; } = string.Empty;
    
        public string PostalCode { get; set; } = string.Empty;

        public string Phone { get; set; } = string.Empty;

        public string Email {  get; set; } = string.Empty;

        public string Website { get; set; } = string.Empty;

        public string Image { get; set; } = string.Empty;

        public string CuisineType {  get; set; } = string.Empty;

        public float AverageRating { get; set; } = 0;

        public int TotalReviews { get; set; } = 0;

        public bool IsEnabled { get; set; } = true;

        // openingtime of type time ( hours:minutes)
        public TimeOnly OpeningTime { get; set; }

        public TimeOnly ClosingTime { get; set; }
        
        // UserID is inherited from EntityClass
    }

}
