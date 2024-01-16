using HelpDeskChat.Services;
using Microsoft.AspNetCore.Mvc;
using IHostingEnvironment = Microsoft.AspNetCore.Hosting.IHostingEnvironment;

namespace HelpDeskChat.Controllers
{
    public class ChatController : Controller
    {
        private readonly ChatService _chatService;
        private readonly IWebHostEnvironment _appEnvironment;
        private readonly string wwwroot;

        public ChatController(ChatService chatService, IWebHostEnvironment appEnvironment)
        {
            _chatService = chatService;
            _appEnvironment = appEnvironment;
            wwwroot = _appEnvironment.WebRootPath;
        }

        public async Task<IActionResult> Index()
        {
            var chats = await _chatService.FindAllAsync();
            return View(chats.OrderByDescending(_ => _.StartTime).ToList());
        }

        
        public async Task<IActionResult> UploadImage(IFormFile image)
        {
            try
            {
                if (image != null)
                {
                    Random random = new Random();
                    string uploadPath = wwwroot + "\\img";
                    Directory.CreateDirectory(uploadPath);
                    string fileName = random.Next().ToString();
                    string fileExtension = Path.GetExtension(image.FileName);
                    string filePath = Path.Combine(uploadPath, fileName + fileExtension);
                    string src = Path.Combine("img", fileName + fileExtension);

                    while (new FileInfo(filePath).Exists)
                    {
                        fileName = random.Next().ToString();
                        filePath = Path.Combine(uploadPath, fileName, fileExtension);
                        src = Path.Combine("img", fileName + fileExtension);
                    }

                    using (var stream = new FileStream(filePath, FileMode.Create))
                    {
                        await image.CopyToAsync(stream);
                    }

                    return Ok( new { message = "Imagem enviada.", src = src });

                }

                return BadRequest(new { message = "Imagem não enviada." });
            }
            catch (Exception)
            {

                return StatusCode(500, new { message = "Erro ao enviar imagem." });
            }
            
        }
    }
}