using System.ComponentModel.DataAnnotations;

namespace Honse.Engines.Common
{
    public class CreateRestaurant
    {
        public Guid UserId { get; set; }

        public string Name { get; set; } = string.Empty;

        public string Description { get; set; } = string.Empty;

        public Global.Address Address { get; set; }

        public string Phone { get; set; } = string.Empty;

        [EmailAddress]
        public string Email { get; set; } = string.Empty;

        public string Image { get; set; } = string.Empty;

        public string CuisineType { get; set; } = string.Empty;

        public TimeOnly OpeningTime { get; set; }

        public TimeOnly ClosingTime { get; set; }
    }
}
