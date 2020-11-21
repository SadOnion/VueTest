using Microsoft.AspNetCore.SignalR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace MyProject.Networking
{
    public class SwitchHub : Hub
    {
        private bool GlobalState = false;

        public override async Task OnConnectedAsync()
        {
            await Clients.Caller.SendAsync("SwitchStateChanged",GlobalState);
        }
        public async Task ChangeState(bool newState)
        {
            GlobalState = newState;
            await Clients.All.SendAsync("SwitchStateChanged",GlobalState);
        }
    }
}
