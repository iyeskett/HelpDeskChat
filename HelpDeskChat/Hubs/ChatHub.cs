using HelpDeskChat.Models;
using HelpDeskChat.Services;
using Microsoft.AspNetCore.SignalR;
using System;

namespace HelpDeskChat.Hubs
{
    public class ChatHub : Hub
    {
        private readonly ChatService _chatService;
        private readonly MessageService _messageService;

        public ChatHub(ChatService chatService, MessageService messageService)
        {
            _chatService = chatService;
            _messageService = messageService;
        }

        public override async Task OnDisconnectedAsync(Exception? exception)
        {
            var connectId = Context.ConnectionId;
            await base.OnDisconnectedAsync(exception);
        }

        public async Task SendMessage(string message, int chatId)
        {
            try
            {
                Chat chat;
                Message msg;
                if (chatId == 0)
                {
                    chat = new Chat() { StartTime = DateTime.Now };
                    chat = await _chatService.InsertAsync(chat);
                    await Groups.AddToGroupAsync(Context.ConnectionId, chat.Id.ToString());
                }
                else
                {
                    chat = await _chatService.FindByIdAsync(chatId);
                }

                msg = new() { Chat = chat, MessageDate = DateTime.Now, Text = message, Sender = "Customer" };
                msg = await _messageService.InsertAsync(msg);

                await Clients.Others.SendAsync("EmployeesReceive", message, chat);
                await Clients.Caller.SendAsync("Sent", true, message, chat.Id);
            }
            catch (Exception e)
            {
                await Clients.Caller.SendAsync("Sent", false, message);
            }
        }

        public async Task SendMessageToCustomer(string message, int chatId)
        {
            try
            {
                Chat chat = await _chatService.FindByIdAsync(chatId);

                Message msg = new() { Chat = chat, MessageDate = DateTime.Now, Text = message, Sender = "Employee" };
                msg = await _messageService.InsertAsync(msg);

                await Clients.Groups(chatId.ToString()).SendAsync("CustomerReceive", message);
                await Clients.All.SendAsync("EmployeesSent", true, message, chatId);
            }
            catch (Exception e)
            {
                await Clients.Caller.SendAsync("EmployeesSent", false, message);
            }
        }

        public async Task GetMessagesByChatId(int chatId)
        {
            try
            {
                var messages = await _messageService.FindByChatIdAsync(chatId);
                var chat = await _chatService.FindByIdAsync(chatId);
                await Clients.Caller.SendAsync("ReceiveMessages", messages, chat);
            }
            catch (Exception)
            {
                throw;
            }
        }

        public async Task NewConnectionId(int chatId)
        {
            try
            {
                var chat = await _chatService.FindByIdAsync(chatId);
                await Groups.AddToGroupAsync(Context.ConnectionId, chat.Id.ToString());
            }
            catch (Exception)
            {
                throw;
            }
        }

        public async Task EndChat(int chatId)
        {
            try
            {
                Chat dbChat = await _chatService.FindByIdAsync(chatId);
                dbChat.Closed = true;
                await _chatService.UpdateAsync(dbChat);

                await Clients.All.SendAsync("ChatClosed", true, dbChat.Id);
            }
            catch (Exception)
            {
                await Clients.All.SendAsync("ChatClosed", false);
            }
        }
    }
}