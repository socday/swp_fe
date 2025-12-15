namespace FPT_Booking_BE.DTOs
{
    public class CreateTaskRequest
    {
        public string Title { get; set; } = null!;
        public string Description { get; set; } = "";
        public string Priority { get; set; } = "Normal"; 
        public int? AssignedToId { get; set; }
    }

}
