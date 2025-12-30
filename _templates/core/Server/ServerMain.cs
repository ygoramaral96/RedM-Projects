using System;
using CitizenFX.Core;
using CitizenFX.Core.Native;

namespace Template.Server
{
    public class ServerMain : BaseScript
    {
        public ServerMain()
        {
            Debug.WriteLine("Template Server Script Started!");
            
            // Register server events
            EventHandlers["Template:ServerEvent"] += new Action<Player, string>(OnServerEvent);
            EventHandlers["playerConnecting"] += new Action<Player, string, CallbackDelegate>(OnPlayerConnecting);
        }

        private void OnServerEvent([FromSource] Player source, string message)
        {
            Debug.WriteLine($"Received event from player {source.Name}: {message}");
            
            // Example: Send response back to client
            source.TriggerEvent("Template:ClientEvent", "Response from server");
        }

        private void OnPlayerConnecting([FromSource] Player player, string playerName, CallbackDelegate deferrals)
        {
            deferrals.Defer();
            
            // Perform async checks here if needed
            Debug.WriteLine($"Player {playerName} is connecting...");
            
            deferrals.Update($"Hello {playerName}, checking data...");
            
            // Accept the connection
            deferrals.Done();
        }

        /// <summary>
        /// Example command registration
        /// </summary>
        [Command("template")]
        private void TemplateCommand(int source, List<object> args, string raw)
        {
            Player player = Players[source];
            player.TriggerEvent("chat:addMessage", new
            {
                color = new[] { 255, 0, 0 },
                args = new[] { "[Template]", "Command executed!" }
            });
        }

        /// <summary>
        /// Broadcasts a message to all players
        /// </summary>
        private void BroadcastToAll(string message)
        {
            TriggerClientEvent("Template:ClientEvent", message);
        }
    }
}

