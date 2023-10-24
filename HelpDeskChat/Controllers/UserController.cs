using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Rendering;
using Microsoft.EntityFrameworkCore;
using HelpDeskChat.Data;
using HelpDeskChat.Models;
using Microsoft.AspNetCore.Http;
using HelpDeskChat.Services;
using HelpDeskChat.Services.Exceptions;

namespace HelpDeskChat.Controllers
{
    public class UserController : Controller
    {
        private readonly UserService _userService;

        public UserController(UserService userService)
        {
            _userService = userService;
        }

        public async Task<IActionResult> Login()
        {
            await CreateAdmin();
            return View();
        }

        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> Login(User user)
        {
            User dbUser = await _userService.FindByEmailAsync(user.Email);

            if (dbUser != null)
            {
                if (PasswordEncryptor.VerifyPassword(user.Password, dbUser.Password))
                {
                    dbUser.Password = string.Empty;
                    return Json(new { success = true, user = dbUser, message = "Logado com sucesso" });
                }
                //ViewData["Error"] = "Senha incorreta";
                return Json(new { success = false, user = user, message = "Senha incorreta" });
            }

            //ViewData["Error"] = "Email não cadastrado";
            return Json(new { success = false, user = user, message = "Email não cadastrado" });
        }

        private async Task CreateAdmin()
        {
            try
            {
                User user = await _userService.FindByEmailAsync("admin@admin.com") ?? throw new NotFoundException("Usuário não encontrado."); ;
            }
            catch (NotFoundException)
            {
                User user = new();
                user.Name = "Admin";
                user.Email = "admin@admin.com";
                user.Password = PasswordEncryptor.EncryptPassword("admin@2023@#");

                await _userService.InsertAsync(user);
            }
        }
    }
}