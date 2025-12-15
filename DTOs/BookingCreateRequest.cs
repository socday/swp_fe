namespace FPT_Booking_BE.DTOs
{
    public class BookingCreateRequest
    {
        public int FacilityId { get; set; }
        public DateOnly BookingDate { get; set; }
        public int SlotId { get; set; }
        public string Purpose { get; set; } = string.Empty;
    }
}