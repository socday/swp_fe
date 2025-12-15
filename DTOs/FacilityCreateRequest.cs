namespace FPT_Booking_BE.DTOs
{
    public class FacilityCreateRequest
    {
        public string FacilityName { get; set; } = string.Empty;
        public int CampusId { get; set; }
        public int TypeId { get; set; }
        public string? ImageUrl { get; set; }
        public string Status { get; set; } = "Available"; 
    }
}