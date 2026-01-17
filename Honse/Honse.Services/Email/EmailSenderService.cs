using System.Net;
using System.Net.Mail;
using Microsoft.AspNetCore.Identity.UI.Services;
using Microsoft.Extensions.Configuration;

namespace Honse.Services.Email
{
    public class EmailSenderService : IEmailSender
    {
        private readonly IConfiguration _configuration;

        public EmailSenderService(IConfiguration configuration)
        {
            _configuration = configuration;
        }

        public async Task SendEmailAsync(string email, string subject, string htmlMessage)
        {
            var emailSettings = _configuration.GetSection("EmailSettings");

            try
            {
                using (var client = new SmtpClient())
                {
                    client.Host = emailSettings["SmtpServer"];
                    client.Port = int.Parse(emailSettings["SmtpPort"]);
                    client.EnableSsl = bool.Parse(emailSettings["EnableSsl"] ?? "true");
                    client.DeliveryMethod = SmtpDeliveryMethod.Network;
                    client.UseDefaultCredentials = false;
                    client.Credentials = new NetworkCredential(
                        emailSettings["SmtpUsername"],
                        emailSettings["SmtpPassword"]);

                    client.Timeout = 10000; // 10 seconds timeout

                    var mailMessage = new MailMessage
                    {
                        From = new MailAddress(
                            emailSettings["FromAddress"],
                            emailSettings["FromName"]),
                        Subject = subject,
                        Body = htmlMessage,
                        IsBodyHtml = true
                    };

                    mailMessage.To.Add(email);

                    await client.SendMailAsync(mailMessage);
                }
            }
            catch (SmtpException ex)
            {
                // Log the full error including inner exception
                Console.WriteLine($"SMTP Error: {ex.Message}");
                if (ex.InnerException != null)
                {
                    Console.WriteLine($"Inner Exception: {ex.InnerException.Message}");
                }
                throw;
            }
        }
    }
}