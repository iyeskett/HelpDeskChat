using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace HelpDeskChat.Migrations
{
    public partial class EditChatAddFinished : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "Finished",
                table: "Chat",
                type: "bit",
                nullable: false,
                defaultValue: false);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Finished",
                table: "Chat");
        }
    }
}
