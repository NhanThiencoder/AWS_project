using Amazon.SimpleEmail;
using Amazon.SimpleEmail.Model;
using CustomerContactSaaS.Services.Interfaces;

namespace CustomerContactSaaS.Services.AWSServices
{
    public class SesEmailService : IEmailService
    {
        private readonly IAmazonSimpleEmailService _sesClient;
        // Chú ý: Cần verify email này trên AWS SES console trước khi gửi
        private readonly string _senderEmail = "your-verified-email@example.com";

        public SesEmailService(IAmazonSimpleEmailService sesClient)
        {
            _sesClient = sesClient;
        }

        public async Task<bool> SendEmailAsync(string toEmail, string subject, string body)
        {
            try
            {
                var sendRequest = new SendEmailRequest
                {
                    Source = _senderEmail,
                    Destination = new Destination { ToAddresses = new List<string> { toEmail } },
                    Message = new Message
                    {
                        Subject = new Content(subject),
                        Body = new Body { Html = new Content(body) }
                    }
                };
                var response = await _sesClient.SendEmailAsync(sendRequest);
                return response.HttpStatusCode == System.Net.HttpStatusCode.OK;
            }
            catch (Exception ex)
            {
                // Log lỗi ở đây (CloudWatch)
                return false;
            }
        }
    }
}