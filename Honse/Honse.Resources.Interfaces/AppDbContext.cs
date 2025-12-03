using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Honse.Resources.Interfaces.Entities;

namespace Honse.Resources.Interfaces
{
    public class AppDbContext : IdentityDbContext<Global.User, IdentityRole<Guid>, Guid>
    {
        public DbSet<Entities.Product> Product { get; set; }
        
        public DbSet<Entities.ProductCategory> ProductCategory { get; set; }

        public DbSet<Entities.Restaurant> Restaurant { get; set; }

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
        }
    }
}
