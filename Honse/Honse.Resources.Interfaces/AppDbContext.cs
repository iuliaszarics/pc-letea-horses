using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

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
    }
}
