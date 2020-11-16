using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.WebSockets;
using System.Text;
using System.Text.Json;
using System.Threading;
using System.Threading.Tasks;

namespace MyProject.Networking
{
    public class SocketMessage
    {
        public static async Task SendMessage(WebSocket socket,string message)
        {
            byte[] secret = Encoding.UTF8.GetBytes(message);
            await socket.SendAsync(new ArraySegment<byte>(secret, 0, secret.Length), WebSocketMessageType.Text, true, CancellationToken.None);
        }
        public static async Task SendJson<T>(WebSocket socket, T obj)
        {
            string json = JsonSerializer.Serialize(obj);
            await SendMessage(socket,json);
        }
    }
}
