using Microsoft.EntityFrameworkCore;
using CustomerContactSaaS.Models;

namespace CustomerContactSaaS.Data
{
    public class ApplicationDbContext : DbContext
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
            : base(options)
        {
        }

        // Bảng Customers trong Database
        public DbSet<Customer> Customers { get; set; }
    }
}