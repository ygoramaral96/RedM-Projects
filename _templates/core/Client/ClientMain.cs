using System;
using CitizenFX.Core;
using CitizenFX.Core.Native;

namespace Template.Client
{
    public class ClientMain : BaseScript
    {
        public ClientMain()
        {
            Debug.WriteLine("Template Client Script Started!");
            
            // Register NUI callbacks
            API.RegisterNuiCallbackType("sampleAction");
            
            EventHandlers["__cfx_nui:sampleAction"] += new Action<IDictionary<string, object>, CallbackDelegate>(HandleSampleAction);
            
            // Sample tick event
            Tick += OnTick;
        }

        private async System.Threading.Tasks.Task OnTick()
        {
            // Add your client tick logic here
            await Delay(0);
        }

        private void HandleSampleAction(IDictionary<string, object> data, CallbackDelegate callback)
        {
            Debug.WriteLine("Sample action received from NUI");
            
            // Send response back to NUI
            callback(new
            {
                status = "success",
                message = "Action processed"
            });
        }

        /// <summary>
        /// Sends data to the NUI (React frontend)
        /// </summary>
        private void SendNuiMessage(string action, object data)
        {
            API.SendNuiMessage(Newtonsoft.Json.JsonConvert.SerializeObject(new
            {
                action = action,
                data = data
            }));
        }

        /// <summary>
        /// Example method to show NUI
        /// </summary>
        public void ShowUI()
        {
            API.SetNuiFocus(true, true);
            SendNuiMessage("setVisible", new { visible = true });
        }

        /// <summary>
        /// Example method to hide NUI
        /// </summary>
        public void HideUI()
        {
            API.SetNuiFocus(false, false);
            SendNuiMessage("setVisible", new { visible = false });
        }
    }
}

