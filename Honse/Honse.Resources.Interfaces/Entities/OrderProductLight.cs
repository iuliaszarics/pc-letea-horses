namespace Honse.Resources.Interfaces.Entities;
 public class OrderProductLight : Entity
    {
        public Guid OrderId { get; set; }

        // Navigation property to parent Order
        public Order? Order { get; set; }

        public string Name { get; set; } = string.Empty;

        public decimal Quantity { get; set; }

        public decimal Price { get; set; }

        public decimal VAT { get; set; }

        // This is a computed column in SQL. 
        // In C#, we can just map it for reading, or calculate it via a getter.
        public decimal Total { get; set; } 

        // UserId is inherited from Entity
    }