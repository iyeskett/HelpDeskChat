using HelpDeskChat.Services;
using Microsoft.AspNetCore.Mvc;

namespace HelpDeskChat.Controllers
{
    public class ChatController : Controller
    {
        private readonly ChatService _chatService;

        public ChatController(ChatService chatService)
        {
            _chatService = chatService;
        }

        public async Task<IActionResult> Index()
        {
            var chats = await _chatService.FindAllAsync();
            return View(chats);
        }
    }
}