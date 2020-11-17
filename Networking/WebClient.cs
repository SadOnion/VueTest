using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.WebSockets;
using System.Threading.Tasks;

namespace MyProject.Networking
{
    public class WebClient
    {
        private static int Ids = 0;

        public int Id { get; private set; }
        public WebSocket Socket { get; private set; }
        public WebClient(WebSocket socket)
        {
            Id = Ids++;
            Socket = socket;
        }
    }
}
