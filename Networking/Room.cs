using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace MyProject.Networking
{
    public class Room
    {
        private List<WebClient> players = new List<WebClient>();
        private const int MAX_PLAYERS = 2;

        public Room(WebClient player)
        {
            players.Add(player);
        }

        public bool AddPlayer(WebClient player)
        {
            if(players.Count >= MAX_PLAYERS)
                return false;

            players.Add(player);
            if(players.Count == MAX_PLAYERS)
            {
                SwitchGame game = new SwitchGame(players[0],players[1]);
                
            }
            return true;
            
        }
    }
}
