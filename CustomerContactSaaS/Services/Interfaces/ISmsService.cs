using System.Threading.Tasks;

namespace CustomerContactSaaS.Services.Interfaces
{
    public interface ISmsService
    {
        Task<bool> SendSmsAsync(string phoneNumber, string message);
    }
}