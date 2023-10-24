namespace HelpDeskChat.Models
{
    public class Message
    {
        public int Id { get; set; }
        public Chat Chat { get; set; } = null!;
        public string Text { get; set; } = null!;

        public string Sender { get; set; } = null!;

        public DateTime MessageDate { get; set; }
    }
}