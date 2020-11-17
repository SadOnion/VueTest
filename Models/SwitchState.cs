using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace MyProject.Models
{
    public class SwitchState : INetworkMessage
    {
        public string Header {get; set; }
        public bool State {get; set;}

        public SwitchState(bool state)
        {
            Header = "SwitchState";
            State = state;
        }
    }
}
