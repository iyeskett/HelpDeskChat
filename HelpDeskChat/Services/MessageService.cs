using HelpDeskChat.Data;
using HelpDeskChat.Models;
using Microsoft.EntityFrameworkCore;

namespace HelpDeskChat.Services
{
    public class MessageService
    {
        private readonly HelpDeskChatContext _context;

        public MessageService(HelpDeskChatContext context)
        {
            _context = context;
        }

        public async Task<List<Message>> FindByChatIdAsync(int id) => await _context.Messages.Where(_ => _.Chat.Id == id).OrderBy(_ => _.MessageDate).ToListAsync();

        public async Task<Message> InsertAsync(Message message)
        {
            _context.Messages.Add(message);
            await _context.SaveChangesAsync();

            return message;
        }
    }
}