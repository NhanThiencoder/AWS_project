using Amazon.SimpleNotificationService;
using Amazon.SimpleNotificationService.Model;
using CustomerContactSaaS.Services.Interfaces;

namespace CustomerContactSaaS.Services.AWSServices
{
    public class SnsSmsService : ISmsService
    {
        private readonly IAmazonSimpleNotificationService _snsClient;

        public SnsSmsService(IAmazonSimpleNotificationService snsClient)
        {
            _snsClient = snsClient;
        }

        public async Task<bool> SendSmsAsync(string phoneNumber, string message)
        {
            try
            {
                var request = new PublishRequest
                {
                    Message = message,
                    PhoneNumber = phoneNumber // Phải có mã quốc gia, VD: +84981234567
                };
                var response = await _snsClient.PublishAsync(request);
                return response.HttpStatusCode == System.Net.HttpStatusCode.OK;
            }
            catch (Exception ex)
            {
                // Log lỗi
                return false;
            }
        }
    }
}