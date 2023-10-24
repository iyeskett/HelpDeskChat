using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using HelpDeskChat.Models;

namespace HelpDeskChat.Data
{
    public class HelpDeskChatContext : DbContext
    {
        public HelpDeskChatContext(DbContextOptions<HelpDeskChatContext> options)
            : base(options)
        {
        }

        public DbSet<HelpDeskChat.Models.User> User { get; set; } = default!;
        public DbSet<HelpDeskChat.Models.Chat> Chat { get; set; } = default!;
        public DbSet<HelpDeskChat.Models.Message> Messages { get; set; } = default!;

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<User>()
                .Property(u => u.Password)
                .HasColumnType("nvarchar(max)");
        }
    }
}