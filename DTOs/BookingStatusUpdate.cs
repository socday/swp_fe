namespace FPT_Booking_BE.DTOs
{
    public class BookingStatusUpdate
    {
        public string Status { get; set; } = string.Empty; 
        public string? RejectionReason { get; set; }
    }
}