using MyProject.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.WebSockets;
using System.Text.Json;
using System.Threading;
using System.Threading.Tasks;

namespace MyProject.Networking
{
    public class SwitchGame
    {
        private bool switchButton;
        WebClient[] clients;
        public SwitchGame(WebClient player1, WebClient player2)
        {
            clients = new WebClient[]{player1,player2};
        }
        public async Task MainLoop()
        {
            var p1Message = WaitForMessage(clients[0]);
            var p2Message = WaitForMessage(clients[1]);
            var tasks = new Task<(string,WebClient)>[]{p1Message,p2Message};
            await Task.Factory.ContinueWhenAny(tasks,ProcessMessage);
        }

        private async Task<(string,WebClient)> WaitForMessage(WebClient client)
        {
            var result = await SocketMessage.ReciveMessage(client.Socket);
            return (result,client);
        }

        private async Task ProcessMessage(Task<(string,WebClient)> message)
        {
            await SetSwitch(true);
            await MainLoop();
        }
        private async Task SetSwitch(bool newValue)
        {
            switchButton = newValue;
            await SendBrodcast();
        }
        private async Task SendBrodcast()
        {
            var info = new SwitchState(switchButton);
            foreach (var item in clients)
            {
                await SocketMessage.SendJson(item.Socket,info);
            }
        }
    }
}
