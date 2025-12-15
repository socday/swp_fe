namespace FPT_Booking_BE.DTOs
{
    public class CampusDto
    {
        public int CampusId { get; set; }
        public string CampusName { get; set; } = string.Empty;
        public string? Address { get; set; }
        public bool IsActive { get; set; } = true;
    }
}