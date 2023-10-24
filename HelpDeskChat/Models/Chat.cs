namespace HelpDeskChat.Models
{
    public class Chat
    {
        public int Id { get; set; }
        public DateTime StartTime { get; set; }

        public bool Read { get; set; }
        public bool Closed { get; set; }
    }
}