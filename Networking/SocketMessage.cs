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
            JsonSerializerOptions options = new JsonSerializerOptions() { PropertyNamingPolicy  = JsonNamingPolicy.CamelCase };
            string json = JsonSerializer.Serialize(obj,options);
            await SendMessage(socket,json);
        }

        public static async Task<string> ReciveMessage(WebSocket socket)
        {
            byte[] buffer = new byte[1024 * 4];            
            var result = await socket.ReceiveAsync(new ArraySegment<byte>(buffer),CancellationToken.None);
            return Encoding.UTF8.GetString(buffer);
        }
    }
}
