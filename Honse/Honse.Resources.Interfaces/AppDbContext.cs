using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Honse.Resources.Interfaces.Entities;
using Microsoft.EntityFrameworkCore.Diagnostics;

namespace Honse.Resources.Interfaces
{
    public class AppDbContext : IdentityDbContext<Global.User, IdentityRole<Guid>, Guid>
    {
        public DbSet<Entities.Product> Product { get; set; }
        
        public DbSet<Entities.ProductCategory> ProductCategory { get; set; }

        public DbSet<Entities.Restaurant> Restaurant { get; set; }

        public DbSet<Entities.Order> Order { get; set; }

        public DbSet<Entities.OrderConfirmationToken> OrderConfirmationToken { get; set; }

        public AppDbContext(DbContextOptions<AppDbContext> context) : base(context)
        {
        }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            modelBuilder.Entity<Restaurant>()
                .OwnsOne(r => r.Address, owned =>
                {
                    owned.ToJson();
                });

            modelBuilder.Entity<OrderConfirmationToken>()
                .OwnsOne(r => r.DeliveryAddress, owned =>
                {
                    owned.ToJson();
                });

            modelBuilder.Entity<OrderConfirmationToken>()
                .OwnsMany(r => r.Products, owned =>
                {
                    owned.ToJson();
                });

            modelBuilder.Entity<Order>()
                .OwnsOne(r => r.DeliveryAddress, owned =>
                {
                    owned.ToJson();
                });

            modelBuilder.Entity<Order>()
                .OwnsMany(r => r.Products, owned =>
                {
                    owned.ToJson();
                });

            modelBuilder.Entity<Order>()
                .OwnsMany(r => r.StatusHistory, owned =>
                {
                    owned.ToJson();
                });
        }

        protected override void ConfigureConventions(ModelConfigurationBuilder configurationBuilder)
        {
            configurationBuilder.Properties<decimal>()
                .HavePrecision(18, 2);
        }
    }
}
