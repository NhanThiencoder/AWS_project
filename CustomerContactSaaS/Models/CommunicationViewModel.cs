namespace CustomerContactSaaS.Models
{
	public class CommunicationViewModel
	{
		public List<int> SelectedCustomerIds { get; set; } = new List<int>();
		public string CommunicationType { get; set; } // "SMS" hoặc "Email"
		public string Subject { get; set; } // Dùng cho Email
		public string MessageBody { get; set; }
	}
}