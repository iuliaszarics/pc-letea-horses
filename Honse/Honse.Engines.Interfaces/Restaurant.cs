using System.ComponentModel.DataAnnotations;

namespace Honse.Engines.Common
{
    public class CreateRestaurant
    {
        public Guid UserId { get; set; }

        public string Name { get; set; } = string.Empty;

        public string Description { get; set; } = string.Empty;

        public string Address { get; set; } = string.Empty;

        public string City { get; set; } = string.Empty;

        public string PostalCode { get; set; } = string.Empty;

        public string Phone { get; set; } = string.Empty;

        [EmailAddress]
        public string Email { get; set; } = string.Empty;

        public string Website { get; set; } = string.Empty;

        public string Image { get; set; } = string.Empty;

        public string CuisineType { get; set; } = string.Empty;

        public TimeOnly OpeningTime { get; set; }

        public TimeOnly ClosingTime { get; set; }
    }
}
