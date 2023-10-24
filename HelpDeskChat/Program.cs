using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using HelpDeskChat.Data;
using HelpDeskChat.Services;
using HelpDeskChat.Hubs;

var builder = WebApplication.CreateBuilder(args);
builder.Services.AddDbContext<HelpDeskChatContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("HelpDeskChatContext") ?? throw new InvalidOperationException("Connection string 'HelpDeskChatContext' not found.")));

// Add services to the container.
builder.Services.AddControllersWithViews();

// SignalR
builder.Services.AddSignalR(options =>
{
    options.EnableDetailedErrors = true;
});

// Services
builder.Services.AddScoped<UserService>();
builder.Services.AddScoped<ChatService>();
builder.Services.AddScoped<MessageService>();

var app = builder.Build();

// Configure the HTTP request pipeline.
if (!app.Environment.IsDevelopment())
{
    app.UseExceptionHandler("/Home/Error");
    // The default HSTS value is 30 days. You may want to change this for production scenarios, see https://aka.ms/aspnetcore-hsts.
    app.UseHsts();
}

app.UseHttpsRedirection();
app.UseStaticFiles();

app.UseRouting();

app.UseAuthorization();

app.MapControllerRoute(
    name: "default",
    pattern: "{controller=Home}/{action=Index}/{id?}");

app.MapHub<ChatHub>("/ChatHub");

app.Run();