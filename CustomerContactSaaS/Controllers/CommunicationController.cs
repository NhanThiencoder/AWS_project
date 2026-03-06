using Microsoft.AspNetCore.Mvc;
using CustomerContactSaaS.Data;
using CustomerContactSaaS.Models;
using CustomerContactSaaS.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace CustomerContactSaaS.Controllers
{
    public class CommunicationController : Controller
    {
        private readonly ApplicationDbContext _context;
        private readonly ISmsService _smsService;
        private readonly IEmailService _emailService;

        // Tiêm (Inject) DbContext và các AWS Services vào
        public CommunicationController(ApplicationDbContext context, ISmsService smsService, IEmailService emailService)
        {
            _context = context;
            _smsService = smsService;
            _emailService = emailService;
        }

        [HttpPost]
        public async Task<IActionResult> SendMessage(CommunicationViewModel model)
        {
            if (model.SelectedCustomerIds == null || !model.SelectedCustomerIds.Any())
            {
                TempData["Error"] = "Vui lòng chọn ít nhất một khách hàng.";
                return RedirectToAction("Index", "Customer");
            }

            // Lấy thông tin các khách hàng được chọn từ Database
            var customers = await _context.Customers
                .Where(c => model.SelectedCustomerIds.Contains(c.Id))
                .ToListAsync();

            int successCount = 0;

            foreach (var customer in customers)
            {
                bool isSent = false;
                if (model.CommunicationType == "SMS" && !string.IsNullOrEmpty(customer.PhoneNumber))
                {
                    isSent = await _smsService.SendSmsAsync(customer.PhoneNumber, model.MessageBody);
                }
                else if (model.CommunicationType == "Email" && !string.IsNullOrEmpty(customer.EmailAddress))
                {
                    isSent = await _emailService.SendEmailAsync(customer.EmailAddress, model.Subject, model.MessageBody);
                }

                if (isSent) successCount++;
            }

            TempData["Success"] = $"Đã gửi thành công {successCount}/{customers.Count} tin nhắn.";
            return RedirectToAction("Index", "Customer");
        }
    }
}