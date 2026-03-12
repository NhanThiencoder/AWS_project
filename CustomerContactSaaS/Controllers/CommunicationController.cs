using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using CustomerContactSaaS.Data;
using CustomerContactSaaS.Services.Interfaces;

namespace CustomerContactSaaS.Controllers
{
    public class CommunicationController : Controller
    {
        private readonly ApplicationDbContext _context;
        private readonly IEmailService _emailService;
        private readonly ISmsService _smsService;

        public CommunicationController(ApplicationDbContext context, IEmailService emailService, ISmsService smsService)
        {
            _context = context;
            _emailService = emailService;
            _smsService = smsService;
        }

        [HttpPost]
        public async Task<IActionResult> SendMessage(List<int> SelectedCustomerIds, string CommunicationType, string Subject, string MessageBody)
        {
            // Kiểm tra xem user có chọn khách hàng nào chưa
            if (SelectedCustomerIds == null || !SelectedCustomerIds.Any())
            {
                TempData["ErrorMessage"] = "Vui lòng chọn ít nhất 1 khách hàng để gửi!";
                return RedirectToAction("Index", "Customer");
            }

            int successCount = 0;

            // Lấy danh sách khách hàng từ Database dựa vào các ID được tích chọn
            var customers = await _context.Customers
                .Where(c => SelectedCustomerIds.Contains(c.Id))
                .ToListAsync();

            foreach (var customer in customers)
            {
                if (CommunicationType == "Email")
                {
                    // Gọi hàm gửi Email qua AWS SES
                    bool isSent = await _emailService.SendEmailAsync(customer.EmailAddress, Subject, MessageBody);
                    if (isSent) successCount++;
                }
                else if (CommunicationType == "SMS")
                {
                    // Tạm thời bỏ qua SMS vì đang lỗi Sandbox, nếu mượt Email thì ta xử SMS sau
                    bool isSent = await _smsService.SendSmsAsync(customer.PhoneNumber, MessageBody);
                    if (isSent) successCount++;
                }
            }

            TempData["SuccessMessage"] = $"Đã gửi thành công {successCount}/{customers.Count} tin nhắn {CommunicationType} qua AWS!";
            return RedirectToAction("Index", "Customer");
        }
    }
}