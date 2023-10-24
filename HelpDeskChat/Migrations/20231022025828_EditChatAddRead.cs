using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace HelpDeskChat.Migrations
{
    public partial class EditChatAddRead : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "Read",
                table: "Chat",
                type: "bit",
                nullable: false,
                defaultValue: false);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Read",
                table: "Chat");
        }
    }
}
