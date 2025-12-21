import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Users } from 'lucide-react';
import { Button } from '../ui/button';
import { motion } from 'motion/react';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '../ui/dialog';
import { useAdminScheduleView } from './useAdminScheduleView';
import type { Booking } from './useAdminScheduleView';

const daysOfWeek = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export function AdminScheduleView() {
  const {
    selectedCampus,
    setSelectedCampus,
    loading,
    selectedSlotBookings,
    isDialogOpen,
    setIsDialogOpen,
    getWeekDates,
    goToPreviousWeek,
    goToNextWeek,
    formatDateKey,
    getBookingsForDateAndSlot,
    handleBookingClick,
    timeSlots,
  } = useAdminScheduleView();

  const weekDates = getWeekDates();

  const getEventColor = (booking: Booking) => {
    if (booking.userRole === 'lecturer') {
      return 'bg-orange-100 border-orange-400 text-orange-900';
    }
    return 'bg-blue-100 border-blue-400 text-blue-900';
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <CardTitle className="flex items-center gap-2">
              <CalendarIcon className="h-5 w-5" />
              Weekly Schedule
            </CardTitle>
            <CardDescription className="text-[16px]">View bookings by time slot</CardDescription>
          </div>
          <Select value={selectedCampus} onValueChange={setSelectedCampus}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Campuses</SelectItem>
              <SelectItem value="FU_FPT">FU FPT Campus</SelectItem>
              <SelectItem value="NVH">NVH Campus</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Week Navigation */}
          <div className="flex items-center justify-between">
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button variant="outline" size="sm" onClick={goToPreviousWeek}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
            </motion.div>
            <h3 className="text-center">
              {weekDates[0].toLocaleDateString('en-US', { month: 'long', day: 'numeric' })} -{' '}
              {weekDates[6].toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
            </h3>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button variant="outline" size="sm" onClick={goToNextWeek}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </motion.div>
          </div>

          {/* Schedule Grid */}
          <div className="overflow-x-auto">
            <div className="min-w-[800px]">
              {/* Header Row */}
              <div className="grid grid-cols-8 gap-1 mb-1">
                <div className="p-2 text-center text-xs bg-gray-100 rounded">
                  Time Slot
                </div>
                {weekDates.map((date, index) => {
                  const isToday = formatDateKey(new Date()) === formatDateKey(date);
                  return (
                    <div
                      key={index}
                      className={`p-2 text-center rounded ${
                        isToday ? 'bg-orange-100 border border-orange-300' : 'bg-gray-50'
                      }`}
                    >
                      <div className="text-xs text-gray-600">{daysOfWeek[date.getDay()]}</div>
                      <div className={`${isToday ? 'text-orange-600' : ''}`}>
                        {date.getDate()}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Time Slots Rows */}
              {timeSlots.map((slot, slotIndex) => (
                <motion.div
                  key={slot.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: slotIndex * 0.05 }}
                  className="grid grid-cols-8 gap-1 mb-1"
                >
                  {/* Slot Label */}
                  <div className="p-2 bg-gray-50 rounded border">
                    <div className="text-xs">{slot.label}</div>
                    <div className="text-[10px] text-gray-600">{slot.displayTime}</div>
                  </div>

                  {/* Days */}
                  {weekDates.map((date, dayIndex) => {
                    const bookingsForSlot = getBookingsForDateAndSlot(date, slot.id);
                    const isToday = formatDateKey(new Date()) === formatDateKey(date);

                    // If there are bookings for this slot, show a full-width pill with the room name.
                    // Priority: if any lecturer booking exists, display that (lecturer color), otherwise display a student booking.
                    const lecturerBooking = bookingsForSlot.find(b => b.userRole === 'lecturer');
                    const displayBooking = lecturerBooking || bookingsForSlot[0];
                    const isLecturer = displayBooking?.userRole === 'lecturer';

                    return (
                      <div
                        key={dayIndex}
                        className={`p-1 min-h-[60px] border rounded cursor-pointer hover:bg-gray-50 transition-colors ${
                          isToday ? 'bg-orange-50/30' : 'bg-white'
                        }`}
                        onClick={() => {
                          if (bookingsForSlot.length > 0) {
                            handleBookingClick(bookingsForSlot, slot.label, formatDateKey(date));
                          }
                        }}
                      >
                        {bookingsForSlot.length > 0 && displayBooking && (
                          <div className="h-full flex items-center">
                            <div className={`w-full text-center py-2 rounded-md border ${
                              isLecturer ? 'bg-orange-100 border-orange-300 text-orange-800' : 'bg-blue-100 border-blue-300 text-blue-800'
                            }`}>
                              <span className="font-semibold">{displayBooking.facilityName || displayBooking.roomName}</span>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </motion.div>
              ))}
              {timeSlots.length === 0 && (
                <div className="text-center text-gray-500 py-8">No active slots available.</div>
              )}
            </div>
          </div>

          {/* Legend */}
          <div className="flex items-center gap-4 text-sm pt-4 border-t">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-orange-100 border border-orange-400 rounded"></div>
              <span>Lecturer Bookings</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-blue-100 border border-blue-400 rounded"></div>
              <span>Student Bookings</span>
            </div>
          </div>

          {loading && (
            <div className="text-center text-gray-500 py-8">
              Loading schedule...
            </div>
          )}

          {!loading && selectedSlotBookings?.bookings.length === 0 && (
            <div className="text-center text-gray-500 py-8">
              No bookings scheduled for this week
            </div>
          )}
        </div>
      </CardContent>

      {/* Dialog for Booking Details */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Bookings Details
            </DialogTitle>
            <DialogDescription asChild>
              {selectedSlotBookings && (
                <div className="flex items-center gap-2 mt-2 text-sm text-gray-600">
                  <CalendarIcon className="h-4 w-4" />
                  <span>{selectedSlotBookings.slotLabel}</span>
                  <span>•</span>
                  <span>{new Date(selectedSlotBookings.date).toLocaleDateString('en-US', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}</span>
                  <span>•</span>
                  <span>{selectedSlotBookings.bookings.length} booking(s)</span>
                </div>
              )}
            </DialogDescription>
          </DialogHeader>
          <div className="mt-4">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b bg-gray-50">
                    <th className="p-3 text-left text-sm">Room</th>
                    <th className="p-3 text-left text-sm">User</th>
                    <th className="p-3 text-left text-sm">Role</th>
                    <th className="p-3 text-left text-sm">Purpose</th>
                    <th className="p-3 text-left text-sm">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedSlotBookings?.bookings.map((booking, index) => (
                    <tr 
                      key={booking.id} 
                      className={`border-b hover:bg-gray-50 ${
                        index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'
                      }`}
                    >
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          <div className={`w-3 h-3 rounded ${
                            booking.userRole === 'lecturer' 
                              ? 'bg-orange-400' 
                              : 'bg-blue-400'
                          }`}></div>
                          <span>{booking.facilityName || booking.roomName}</span>
                        </div>
                      </td>
                      <td className="p-3">{booking.bookedBy || booking.userName}</td>
                      <td className="p-3">
                        <span className={`px-2 py-1 rounded text-xs ${
                          booking.userRole === 'lecturer'
                            ? 'bg-orange-100 text-orange-800'
                            : 'bg-blue-100 text-blue-800'
                        }`}>
                          {booking.userRole}
                        </span>
                      </td>
                      <td className="p-3 max-w-xs">
                        <div className="truncate" title={booking.purpose}>
                          {booking.purpose}
                        </div>
                      </td>
                      <td className="p-3">
                        <span className={`px-2 py-1 rounded text-xs ${
                          booking.status === 'approved'
                            ? 'bg-green-50 text-green-700'
                            : booking.status === 'pending'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-green-100 text-green-800'
                        }`}>
                          {booking.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
}