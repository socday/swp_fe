namespace FPT_Booking_BE.DTOs
{
    public class ReportCreateRequest
    {
        public int? BookingId { get; set; }
        public int FacilityId { get; set; }
        public string Title { get; set; } = string.Empty; 
        public string Description { get; set; } = string.Empty;
        public string ReportType { get; set; } = string.Empty;
    }
}