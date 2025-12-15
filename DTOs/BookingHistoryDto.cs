namespace FPT_Booking_BE.DTOs
{
    public class BookingHistoryDto
    {
        public int Id { get; set; }
        public int UserId { get; set; }
        public DateOnly BookingDate { get; set; } 
        public decimal TotalAmount { get; set; }
        public string Status { get; set; } = string.Empty;
        public string FacilityName { get; set; } = string.Empty;
        public string SlotName { get; set; } = string.Empty;
        public TimeOnly StartTime { get; set; }
        public TimeOnly EndTime { get; set; }
    }
}