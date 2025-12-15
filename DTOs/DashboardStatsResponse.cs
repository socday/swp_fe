namespace FPT_Booking_BE.DTOs
{
    public class DashboardStatsResponse
    {
        public int TotalUsers { get; set; }
        public int TotalBookings { get; set; }
        public int PendingBookings { get; set; } 
        public int TotalReports { get; set; }
        public int PendingReports { get; set; } 

        public List<TopFacilityDto> TopFacilities { get; set; } = new List<TopFacilityDto>();
        public List<MonthlyBookingDto> BookingInMonths { get; set; } = new List<MonthlyBookingDto>();
    }

    public class TopFacilityDto
    {
        public string FacilityName { get; set; } = null!;
        public int BookingCount { get; set; }
    }

    public class MonthlyBookingDto
    {
        public string Month { get; set; } = null!; 
        public int Count { get; set; }
    }
}