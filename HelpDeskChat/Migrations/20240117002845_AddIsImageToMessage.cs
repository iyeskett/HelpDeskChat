using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace HelpDeskChat.Migrations
{
    public partial class AddIsImageToMessage : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "IsImage",
                table: "Messages",
                type: "bit",
                nullable: false,
                defaultValue: false);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "IsImage",
                table: "Messages");
        }
    }
}
