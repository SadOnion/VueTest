using Microsoft.AspNetCore.SignalR;
using System.Threading.Tasks;

namespace MyProject
{
    public class ConnectionHub : Hub
    {
        public override async Task OnConnectedAsync()
        {
            await Clients.All.SendAsync("ReciveMessage","New Connection");
        }
    }
}