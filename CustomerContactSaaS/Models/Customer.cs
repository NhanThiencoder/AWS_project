using System.ComponentModel.DataAnnotations;

namespace CustomerContactSaaS.Models
{
    public class Customer
    {
        [Key]
        public int Id { get; set; }

        [Required(ErrorMessage = "Vui lòng nhập họ và tên")]
        [StringLength(100)]
        [Display(Name = "Full Name")]
        public string FullName { get; set; } // 

        [Display(Name = "Address")]
        public string Address { get; set; } // 

        [Required(ErrorMessage = "Vui lòng nhập số điện thoại")]
        [Phone(ErrorMessage = "Số điện thoại không hợp lệ")]
        [Display(Name = "Phone Number")]
        public string PhoneNumber { get; set; } // 

        [Required(ErrorMessage = "Vui lòng nhập địa chỉ email")]
        [EmailAddress(ErrorMessage = "Email không hợp lệ")]
        [Display(Name = "Email Address")]
        public string EmailAddress { get; set; } // 
    }
}