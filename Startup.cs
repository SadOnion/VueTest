using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.SpaServices;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using MyProject.Networking;
using System;
using System.Net.WebSockets;
using System.Text;
using System.Threading;
using System.Threading.Tasks;
using VueCliMiddleware;
using System.Collections.Generic;
using MyProject.Models;

namespace MyProject
{
    public class Startup
    {
        public static List<WebClient> Clients {get; private set;} = new List<WebClient>();

        public Startup(IConfiguration configuration)
        {
            Configuration = configuration;
        }

        public IConfiguration Configuration { get; }

        // This method gets called by the runtime. Use this method to add services to the container.
        public void ConfigureServices(IServiceCollection services)
        {
            services.AddControllersWithViews();

            // Add AddRazorPages if the app uses Razor Pages.
            services.AddRazorPages();

            // In production, the Vue files will be served from this directory
            services.AddSpaStaticFiles(configuration =>
            {
                configuration.RootPath = "ClientApp/dist";
            });
        }

        // This method gets called by the runtime. Use this method to configure the HTTP request pipeline.
        public void Configure(IApplicationBuilder app, IWebHostEnvironment env)
        {
            if (env.IsDevelopment())
            {
                app.UseDeveloperExceptionPage();
            }
            else
            {
                app.UseExceptionHandler("/Error");
                // The default HSTS value is 30 days. You may want to change this for production scenarios, see https://aka.ms/aspnetcore-hsts.
                app.UseHsts();
            }

            var webSocketOptions = new WebSocketOptions()
            {
                KeepAliveInterval = TimeSpan.FromSeconds(120),
                ReceiveBufferSize = 4 * 1024
            };


            app.UseWebSockets();

            app.Use(async (context, next) =>
            {
                if (context.Request.Path == "/ws")
                {
                    if (context.WebSockets.IsWebSocketRequest)
                    {
                        using (WebSocket webSocket = await context.WebSockets.AcceptWebSocketAsync())
                        {
                            await NewConnection(context, webSocket);
                            
                        }
                    }
                    else
                    {
                        context.Response.StatusCode = 400;
                    }
                }
                else
                {
                    await next();
                }

            });

            app.UseHttpsRedirection();
            
            app.UseStaticFiles();
            app.UseSpaStaticFiles();

            app.UseRouting();

            app.UseEndpoints(endpoints =>
            {
                endpoints.MapControllerRoute(
                    name: "default",
                    pattern: "{controller}/{action=Index}/{id?}");

                if (env.IsDevelopment())
                {
                    endpoints.MapToVueCliProxy(
                        "{*path}",
                        new SpaOptions { SourcePath = "ClientApp" },
                        npmScript: "serve",
                        regex: "Compiled successfully");
                }

                // Add MapRazorPages if the app uses Razor Pages. Since Endpoint Routing includes support for many frameworks, adding Razor Pages is now opt -in.
                endpoints.MapRazorPages();
            });

            app.UseSpa(spa =>
            {
                spa.Options.SourcePath = "ClientApp";
            });

           
        }

        public bool GlobalSwitch {get; private set;}
        private async Task SendNewSwitchState(bool state)
        {
            foreach (var item in Clients)
            {
                SwitchState message = new SwitchState(state);
                await SocketMessage.SendJson(item.Socket,message);
            }
        }
        private async Task NewConnection(HttpContext context, WebSocket webSocket)
        {
            Clients.Add(new WebClient(webSocket));
            while(Clients.Count <= 1)
            {
                await Task.Delay(250);
            }

            await SocketMessage.SendMessage(webSocket, "{ \"Header\":\"Joined\"}");

            bool valChange;
            var buffer = new byte[1024 * 4];
            string result = await SocketMessage.ReciveMessage(webSocket);
            while (result != "exit")
            {
                
                if (bool.TryParse(result, out valChange))
                {
                    await SendNewSwitchState(valChange);
                }

                result = await SocketMessage.ReciveMessage(webSocket);
            }
            await webSocket.CloseAsync(WebSocketCloseStatus.NormalClosure,"exit", CancellationToken.None);
        }
    }
}

