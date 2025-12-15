namespace FPT_Booking_BE.DTOs
{
    public class FacilityDto
    {
        public int FacilityId { get; set; }
        public string FacilityName { get; set; } = string.Empty;
        public string CampusName { get; set; } = string.Empty; 
        public string TypeName { get; set; } = string.Empty;   
        public string ImageUrl { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;     
    }
}