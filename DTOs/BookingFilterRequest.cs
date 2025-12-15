using System;

namespace FPT_Booking_BE.DTOs
{
    public class BookingFilterRequest
    {
        public DateTime? FromDate { get; set; } 
        public DateTime? ToDate { get; set; }  

        public int? UserId { get; set; }     
        public int? FacilityId { get; set; } 
        public int? CampusId { get; set; }   

        public string? Status { get; set; }

        public int PageIndex { get; set; } = 1;
        public int PageSize { get; set; } = 10;

        public string SortBy { get; set; } = "Newest";
    }

    public class BookingResponse
    {
        public int BookingId { get; set; }
        public string FacilityName { get; set; } = null!; 
        public string CampusName { get; set; } = null!;  
        public DateTime BookingDate { get; set; }
        public TimeSpan StartTime { get; set; }
        public TimeSpan EndTime { get; set; }
        public string Status { get; set; } = null!;
        public string BookedBy { get; set; } = null!;     
        public int UserId { get; set; } 
    }
}