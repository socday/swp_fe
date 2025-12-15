namespace FPT_Booking_BE.DTOs
{
    public class SlotDto
    {
        public int SlotId { get; set; }
        public string SlotName { get; set; } = string.Empty;

        public TimeOnly StartTime { get; set; }
        public TimeOnly EndTime { get; set; }

        public bool IsActive { get; set; }
    }
}