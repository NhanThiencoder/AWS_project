# ☁️ SaaS Customer Contact Management - AWS Cloud Native

![.NET Core](https://img.shields.io/badge/.NET%20Core-10.0-blue)
![AWS EC2](https://img.shields.io/badge/Amazon%20AWS-EC2-FF9900?logo=amazonaws)
![AWS RDS](https://img.shields.io/badge/Amazon%20AWS-RDS-527FFF?logo=amazonaws)
![AWS SES](https://img.shields.io/badge/Amazon%20AWS-SES-DD344C?logo=amazonaws)

## 📖 Giới thiệu (Overview)
Dự án này là một hệ thống Phần mềm dạng Dịch vụ (SaaS) quản lý danh bạ khách hàng được thiết kế và triển khai hoàn toàn trên nền tảng điện toán đám mây Amazon Web Services (AWS). 

Hệ thống cung cấp một giao diện quản trị (Dashboard) hiện đại, mượt mà, cho phép quản lý thông tin khách hàng và tự động hóa quy trình chăm sóc khách hàng thông qua việc gửi Email hàng loạt (Bulk Email) bằng dịch vụ AWS SES.

##Tính năng cốt lõi (Key Features)
* **Quản lý Khách hàng (CRUD):** Thêm, xem, sửa, xóa thông tin khách hàng (Họ tên, SĐT, Email, Địa chỉ, Avatar).
* **Trải nghiệm Single Page Application (SPA):** Toàn bộ thao tác thêm/sửa/xóa được xử lý ngầm bằng công nghệ **AJAX (Fetch API)**, giúp dữ liệu cập nhật tức thời mà không cần tải lại trang.
* **Tương tác Đám mây (Cloud Communication):** Tích hợp SDK Amazon Simple Email Service (SES) để gửi thông báo/khuyến mãi hàng loạt cho khách hàng trực tiếp từ Dashboard.
* **Bảo mật chuẩn Doanh nghiệp:** Không hard-code mật khẩu AWS vào Source Code. Hệ thống sử dụng cơ chế **IAM Role** để cấp quyền nội bộ cho EC2 giao tiếp với SES an toàn tuyệt đối.

---

##Kiến trúc & Cách thức hoạt động (Architecture & How it works)

Dự án được triển khai theo mô hình Cloud-Native phân tán, đảm bảo tính bảo mật và khả năng mở rộng:

1. **Người dùng truy cập (Client Request):** Người dùng truy cập vào hệ thống thông qua địa chỉ DNS Public của **Application Load Balancer (ALB)** (Cổng 80/443).
2. **Máy chủ Ứng dụng (Compute - Amazon EC2):** * ALB điều hướng luồng dữ liệu (traffic) vào máy chủ ảo **EC2 (Windows Server)** đang chạy ứng dụng C# ASP.NET Core MVC tại cổng `5203`.
   * Security Group của EC2 được cấu hình chặn toàn bộ truy cập lạ, chỉ nhận traffic từ ALB. Không mở port RDP (3389) public, việc quản trị EC2 được thực hiện an toàn qua **AWS Systems Manager (Fleet Manager)**.
3. **Cơ sở dữ liệu (Storage - Amazon RDS):**
   * Khi ứng dụng cần đọc/ghi dữ liệu, nó sẽ kết nối với két sắt dữ liệu **Amazon RDS (SQL Server)** qua cổng `1433`.
   * RDS Security Group chỉ cho phép duy nhất Security Group của EC2 được quyền truy cập, đảm bảo Database bị cô lập hoàn toàn khỏi Internet.
4. **Dịch vụ Gửi thư (External Service - Amazon SES):**
   * Khi quản trị viên bấm nút "Gửi Mail", ứng dụng C# sẽ gọi API của Amazon SES.
   * Máy ảo EC2 được gắn sẵn thẻ định danh **IAM Role (`AmazonSESFullAccess`)**, giúp AWS tự động xác thực và cho phép phát thư đi mà không cần bất kỳ Access Key hay Secret Key nào trong mã nguồn.

---

## 💻 Công nghệ sử dụng (Tech Stack)
* **Backend:** C# ASP.NET Core MVC
* **Frontend:** HTML5, CSS3, JavaScript (AJAX, Fetch API), Bootstrap 5, FontAwesome.
* **Database:** Microsoft SQL Server (Amazon RDS)
* **Cloud Provider:** Amazon Web Services (EC2, RDS, SES, IAM, Security Groups)
* **SDK:** `AWSSDK.SimpleEmail`

---

## 🚀 Hướng dẫn cài đặt và Chạy cục bộ (Local Setup)

### Yêu cầu hệ thống (Prerequisites)
* [.NET 10.0 SDK](https://dotnet.microsoft.com/download)
* SQL Server Management Studio (SSMS) hoặc CSDL LocalDB.

### Các bước chạy dự án
1. **Clone repository về máy:**
   ```bash
   git clone [https://github.com/](https://github.com/)[Tên_GitHub_Của_Bạn]/[Tên_Repo].git
   cd [Tên_Repo]
