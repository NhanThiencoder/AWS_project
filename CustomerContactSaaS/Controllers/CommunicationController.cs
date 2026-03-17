using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using CustomerContactSaaS.Data;
using Amazon.SimpleEmail;
using Amazon.SimpleEmail.Model;

namespace CustomerContactSaaS.Controllers
{
    public class CommunicationController : Controller
    {
        private readonly ApplicationDbContext _context;

        public CommunicationController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpPost]
        public async Task<IActionResult> SendMessage([FromBody] SendMessageRequest request)
        {
            // Kiểm tra dữ liệu đầu vào
            if (request.SelectedCustomerIds == null || !request.SelectedCustomerIds.Any())
                return Json(new { success = false, message = "Lỗi: Chưa chọn khách hàng nào!" });

            // Lấy danh sách Email từ Database
            var customers = await _context.Customers
                .Where(c => request.SelectedCustomerIds.Contains(c.Id))
                .ToListAsync();

            if (request.Mode == "SES")
            {
                var emails = customers.Select(c => c.EmailAddress).Where(e => !string.IsNullOrEmpty(e)).ToList();
                if (!emails.Any()) return Json(new { success = false, message = "Lỗi: Các khách hàng được chọn không có Email hợp lệ." });

                try
                {
                    // Khởi tạo Client kết nối với AWS SES
                    // LƯU Ý: Nếu AWS SES của bạn ở khu vực khác (như N. Virginia) thì đổi USWest1 thành USEast1
                    using var client = new AmazonSimpleEmailServiceClient(Amazon.RegionEndpoint.USWest1);

                    var sendRequest = new SendEmailRequest
                    {
                        // ĐÂY LÀ CHỖ QUAN TRỌNG: Sửa thành Email bạn đã Verify trên AWS SES
                        Source = "nhanthien12721281@gmail.com",

                        Destination = new Destination { ToAddresses = emails },
                        Message = new Message
                        {
                            Subject = new Content(request.Subject),
                            Body = new Body { Text = new Content(request.Content) }
                        }
                    };

                    // Phát lệnh gửi thư
                    var response = await client.SendEmailAsync(sendRequest);

                    // Trả về JSON cho JS hiển thị bảng Log xanh lá
                    return Json(new { success = true, message = $"[HỆ THỐNG AWS SES]\nĐã gửi thành công {emails.Count} email!\nMessageId: {response.MessageId}" });
                }
                catch (Exception ex)
                {
                    return Json(new { success = false, message = "Lỗi từ AWS SES: " + ex.Message });
                }
            }
            else
            {
                // SNS để dành phát triển sau
                return Json(new { success = false, message = "Tính năng Amazon SNS đang được bảo trì." });
            }
        }
    }

    // Class hứng dữ liệu JSON từ giao diện gửi lên
    public class SendMessageRequest
    {
        public string Mode { get; set; }
        public string Subject { get; set; }
        public string Content { get; set; }
        public List<int> SelectedCustomerIds { get; set; }
    }
}