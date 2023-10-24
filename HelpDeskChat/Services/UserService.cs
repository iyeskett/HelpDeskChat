using Microsoft.EntityFrameworkCore;
using HelpDeskChat.Data;
using HelpDeskChat.Models;

namespace HelpDeskChat.Services
{
    public class UserService
    {
        private readonly HelpDeskChatContext _context;

        public UserService(HelpDeskChatContext helpDeskChatContext)
        {
            _context = helpDeskChatContext;
        }

        public async Task<List<User>> FindAllAsync() => await _context.User.ToListAsync();

        public async Task<User> FindByIdAsync(int id) => await _context.User.FirstOrDefaultAsync(user => user.Id == id);

        public async Task<User> FindByEmailAsync(string email) => await _context.User.FirstOrDefaultAsync(user => user.Email == email);

        public async Task<User> FindByNameAsync(string name) => await _context.User.FirstOrDefaultAsync(user => user.Name == name);

        public async Task InsertAsync(User user)
        {
            _context.User.Add(user);
            await _context.SaveChangesAsync();
        }

        public async Task RemoveAsync(int? id)
        {
            try
            {
                var user = await _context.User.FirstOrDefaultAsync(user => user.Id == id);
                _context.User.Remove(user);
                await _context.SaveChangesAsync();
            }
            catch (Exception e)
            {
                throw new Exception(e.Message);
            }
        }

        public async Task UpdateAsync(User user)
        {
            bool hasAny = await _context.User.AnyAsync();

            if (!hasAny) throw new Exception("Id not found");

            try
            {
                _context.User.Update(user);
                await _context.SaveChangesAsync();
            }
            catch (Exception e)
            {
                throw new Exception(e.Message);
            }
        }
    }
}