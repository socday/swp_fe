namespace FPT_Booking_BE.DTOs
{
    public class ReportDto
    {
        public int ReportId { get; set; }
        public string Title { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string ReportType { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;
        public DateTime? CreatedAt { get; set; }
        public string CreatedBy { get; set; } = string.Empty;
        public string FacilityName { get; set; } = string.Empty;
    }
}