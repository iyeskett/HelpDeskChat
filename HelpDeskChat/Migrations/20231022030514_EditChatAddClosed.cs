using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace HelpDeskChat.Migrations
{
    public partial class EditChatAddClosed : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "Finished",
                table: "Chat",
                newName: "Closed");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "Closed",
                table: "Chat",
                newName: "Finished");
        }
    }
}
