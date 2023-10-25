using HelpDeskChat.Data;
using HelpDeskChat.Models;
using Microsoft.EntityFrameworkCore;

namespace HelpDeskChat.Services
{
    public class ChatService
    {
        private readonly HelpDeskChatContext _context;

        public ChatService(HelpDeskChatContext context)
        {
            _context = context;
        }

        public async Task<List<Chat>> FindAllAsync() => await _context.Chat.ToListAsync();

        public async Task<Chat> FindByIdAsync(int id) => await _context.Chat.FirstOrDefaultAsync(chat => chat.Id == id);

        public async Task<Chat> InsertAsync(Chat chat)
        {
            _context.Chat.Add(chat);
            await _context.SaveChangesAsync();

            return chat;
        }

        public async Task<bool> UpdateAsync(Chat chat)
        {
            try
            {
                _context.Chat.Update(chat);
                await _context.SaveChangesAsync();

                return true;
            }
            catch (Exception)
            {
                return false;
            }
        }
    }
}