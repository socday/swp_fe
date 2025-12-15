using System;
using System.Collections.Generic;

namespace FPT_Booking_BE.DTOs
{
    public class BookingRecurringRequest
    {
        public int FacilityId { get; set; }
        public int SlotId { get; set; }
        public string Purpose { get; set; } = string.Empty;

        public DateOnly StartDate { get; set; }
        public DateOnly EndDate { get; set; }

        public List<int> DaysOfWeek { get; set; } = new List<int>();
    }
}