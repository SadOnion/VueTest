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
        private Dictionary<string,string> players = new Dictionary<string, string>();

        public override async Task OnConnectedAsync()
        {
            var playerList = players.SelectMany(x => x.Value).ToList();
            await Clients.Caller.SendAsync("initialData",playerList,GlobalState);
        }
        public override async Task OnDisconnectedAsync(Exception exception)
        {
            await Clients.Others.SendAsync("playerDisconnected", players[Context.ConnectionId]);
            players.Remove(Context.ConnectionId);
        }
        public async Task<string> SetName(string name)
        {
            int offset = 0;
            string main = name;
            while (players.ContainsValue(name))
            {
                name = main + offset;
                offset++;
            }
            if (players.ContainsKey(Context.ConnectionId))
            {
                await Clients.Others.SendAsync("playerDisconnected", players[Context.ConnectionId]);
                players.Remove(Context.ConnectionId);
            }

            players[Context.ConnectionId] = name;
            await Clients.Others.SendAsync("playerJoined", name);
            return name;
        }
        public async Task ChangeState(bool newState)
        {
            GlobalState = newState;
            await Clients.Others.SendAsync("SwitchStateChanged",GlobalState,players[Context.ConnectionId]);
        }
    }
}
