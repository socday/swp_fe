import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "../ui/dialog";
import { Button } from "../ui/button";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import { Calendar } from "../ui/calendar";
import { motion } from "motion/react";
import { Clock, CheckCircle2, X, CalendarDays, Loader2 } from "lucide-react";
import { RoomImageGallery } from "../shared/RoomImageGallery";
import { getRoomImages } from "../../api/roomImages";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Checkbox } from "../ui/checkbox";

import { type Room } from "../../api/api";

import { useBookingDialog, type RecurrencePattern } from "./useBookingDialog";

interface BookingDialogProps {
  room: Room;
  open: boolean;
  userRole: "student" | "lecturer" | "admin" | "staff" | "security";
  initialDate?: string; // ISO date string from parent (e.g., "2025-12-17")
  onClose: () => void;
  onSuccess?: () => void;
}

export function BookingDialog({ room, open, userRole, initialDate, onClose, onSuccess }: BookingDialogProps) {
  const {
    date,
    setDate,
    selectedSlots,
    handleSlotToggle,
    handleRemoveSlot,
    purpose,
    setPurpose,
    submitting,
    handleSubmit,
    bookingType,
    setBookingType,
    startDate,
    setStartDate,
    endDate,
    setEndDate,
    recurrencePattern,
    setRecurrencePattern,
    selectedDays,
    handleDayToggle,
    interval,
    setInterval,
    autoFindAlternative,
    setAutoFindAlternative,
    skipConflicts,
    setSkipConflicts,
    availableSlots,
    allSlots,
    convertToVietnameseDay,
    conflictCheckResult,
    checkingConflicts,
    conflictChecked,
    handleCheckConflicts,
  } = useBookingDialog(room, initialDate, onSuccess, onClose, userRole);

  const roomImages = getRoomImages(room.id);

  // Use allSlots for recurring bookings, availableSlots for single bookings
  const displaySlots = bookingType === "recurring" ? allSlots : availableSlots;

  const getRecurrencePatternLabel = (pattern: RecurrencePattern) => {
    const labels = {
      1: "Daily",
      2: "Weekly",
      3: "Weekdays",
      4: "Weekends",
      5: "Monthly",
      6: "Custom",
      7: "Semester",
    };
    return labels[pattern];
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[70vw] w-[70vw] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Book {room.name}</DialogTitle>
          <DialogDescription>
            {room.building} - {room.campus === "FU_FPT" ? "FU FPT Campus" : "NVH Campus"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="space-y-6 py-4">
            {/* Room Images */}
            {roomImages.length > 0 && (
              <div>
                <Label>Room Photos</Label>
                <div className="mt-2">
                  <RoomImageGallery 
                    images={roomImages} 
                    roomName={room.name}
                    compact={false}
                  />
                </div>
              </div>
            )}

            {/* Booking Type - For Lecturer, Staff, and Admin */}
            {(userRole === "lecturer" || userRole === "admin" || userRole === "staff") && (
              <div className="space-y-3">
                <Label className="flex items-center gap-2">
                  <CalendarDays className="h-4 w-4" />
                  Booking Type
                </Label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setBookingType("single")}
                    className={`p-4 rounded-lg border-2 text-left ${
                      bookingType === "single"
                        ? "border-orange-500 bg-orange-50"
                        : "border-gray-200 bg-white hover:border-orange-300"
                    }`}
                  >
                    <div className={`font-semibold ${bookingType === "single" ? "text-orange-900" : "text-gray-900"}`}>
                      Single Day
                    </div>
                    <div className="text-sm text-gray-600 mt-1">Book for one specific date</div>
                  </button>
                  
                  <button
                    type="button"
                    onClick={() => setBookingType("recurring")}
                    className={`p-4 rounded-lg border-2 text-left ${
                      bookingType === "recurring"
                        ? "border-orange-500 bg-orange-50"
                        : "border-gray-200 bg-white hover:border-orange-300"
                    }`}
                  >
                    <div className={`font-semibold ${bookingType === "recurring" ? "text-orange-900" : "text-gray-900"}`}>
                      Recurring Booking
                    </div>
                    <div className="text-sm text-gray-600 mt-1">Daily, Weekly, or Custom pattern</div>
                  </button>
                </div>
              </div>
            )}

            {/* Date Selector */}
            {bookingType === "single" ? (
              <div className="space-y-2">
                <Label>Select Date</Label>
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                  disabled={(d) => d < new Date(new Date().setHours(0, 0, 0, 0))}
                  className="rounded-md border w-full"
                />
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Start Date</Label>
                  <Calendar
                    mode="single"
                    selected={startDate}
                    onSelect={setStartDate}
                    disabled={(d) => d < new Date(new Date().setHours(0, 0, 0, 0))}
                    className="rounded-md border w-full"
                  />
                </div>
                <div className="space-y-2">
                  <Label>End Date</Label>
                  <Calendar
                    mode="single"
                    selected={endDate}
                    onSelect={setEndDate}
                    disabled={(d) => !startDate || d < startDate}
                    className="rounded-md border w-full"
                  />
                  {startDate && endDate && (
                    <p className="text-sm text-gray-600">
                      Duration: {Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))} days
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Recurrence Pattern - Only for Recurring */}
            {bookingType === "recurring" && (userRole === "lecturer" || userRole === "staff" || userRole === "admin") && (
              <div className="space-y-3">
                <Label>Recurrence Pattern</Label>
                <Select
                  value={recurrencePattern.toString()}
                  onValueChange={(value) => setRecurrencePattern(parseInt(value) as RecurrencePattern)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">Daily - Repeat every day</SelectItem>
                    <SelectItem value="2">Weekly - Repeat every week</SelectItem>
                    <SelectItem value="3">Weekdays - Monday to Friday only</SelectItem>
                    <SelectItem value="4">Weekends - Saturday and Sunday only</SelectItem>
                    <SelectItem value="5">Monthly - Same date each month</SelectItem>
                    <SelectItem value="6">Custom - Choose specific days</SelectItem>
                    <SelectItem value="7">Semester - Every semester</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Custom Days - Only for Custom Pattern */}
            {bookingType === "recurring" && recurrencePattern === 6 && (userRole === "lecturer" || userRole === "staff" || userRole === "admin") && (
              <div className="space-y-3">
                <Label>Select Days (Vietnamese format)</Label>
                <p className="text-sm text-gray-600">Choose which days of the week to repeat this booking</p>
                <div className="grid grid-cols-7 gap-2">
                  {[
                    { id: 2, label: "Mon", full: "Monday" },
                    { id: 3, label: "Tue", full: "Tuesday" },
                    { id: 4, label: "Wed", full: "Wednesday" },
                    { id: 5, label: "Thu", full: "Thursday" },
                    { id: 6, label: "Fri", full: "Friday" },
                    { id: 7, label: "Sat", full: "Saturday" },
                    { id: 8, label: "Sun", full: "Sunday" },
                  ].map((day) => {
                    const isSelected = selectedDays.includes(day.id);
                    return (
                      <button
                        key={day.id}
                        type="button"
                        onClick={() => handleDayToggle(day.id)}
                        className={`p-3 rounded-lg border-2 text-center transition-all ${
                          isSelected
                            ? "border-orange-500 bg-orange-500 text-white"
                            : "border-gray-200 bg-white hover:border-orange-300 hover:bg-orange-50"
                        }`}
                        title={day.full}
                      >
                        <div className="text-sm font-semibold">{day.label}</div>
                      </button>
                    );
                  })}
                </div>
                {selectedDays.length > 0 && (
                  <p className="text-sm text-orange-600">
                    Selected {selectedDays.length} day{selectedDays.length > 1 ? "s" : ""} per week
                  </p>
                )}
              </div>
            )}

            {/* Advanced Options - Only for Recurring */}
            {bookingType === "recurring" && (userRole === "lecturer" || userRole === "staff" || userRole === "admin") && (
              <div className="space-y-4 border-t pt-4">
                <Label className="text-base font-semibold">Advanced Options</Label>
                
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="autoFindAlternative"
                    checked={autoFindAlternative}
                    onCheckedChange={(checked) => setAutoFindAlternative(checked as boolean)}
                  />
                  <label
                    htmlFor="autoFindAlternative"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Auto-find alternative rooms if unavailable
                  </label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="skipConflicts"
                    checked={skipConflicts}
                    onCheckedChange={(checked) => setSkipConflicts(checked as boolean)}
                  />
                  <label
                    htmlFor="skipConflicts"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Skip conflicting dates instead of failing entire booking
                  </label>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="interval">Interval (repeat every X {getRecurrencePatternLabel(recurrencePattern).toLowerCase()})</Label>
                  <Select
                    value={interval.toString()}
                    onValueChange={(value) => setInterval(parseInt(value))}
                  >
                    <SelectTrigger id="interval">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1 (every occurrence)</SelectItem>
                      <SelectItem value="2">2 (every other occurrence)</SelectItem>
                      <SelectItem value="3">3</SelectItem>
                      <SelectItem value="4">4</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}



            {/* Time Slots */}
            <div className="space-y-3">
              <Label className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Select Time Slots (Multiple Selection)
              </Label>

              {allSlots.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {allSlots.map((slot, index) => {
                    const isSelected = selectedSlots.some((s) => s.id === slot.id);
                    return (
                      <motion.div
                        key={slot.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                      >
                        <button
                          type="button"
                          onClick={() => handleSlotToggle(slot)}
                          className={`w-full p-4 rounded-lg border-2 relative text-left ${
                            isSelected
                              ? "border-orange-500 bg-orange-50 shadow-md"
                              : "border-gray-200 bg-white hover:border-orange-300 hover:bg-orange-50"
                          }`}
                        >
                          {isSelected && (
                            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="absolute top-2 right-2">
                              <CheckCircle2 className="h-5 w-5 text-orange-500" />
                            </motion.div>
                          )}

                          <div className={`text-sm ${isSelected ? "text-orange-600" : "text-gray-600"}`}>
                            {slot.label}
                          </div>

                          <div className={isSelected ? "text-orange-900" : "text-gray-900"}>{slot.displayTime}</div>

                          {isSelected && (
                            <motion.div
                              layoutId={`slot-${slot.id}`}
                              className="absolute bottom-0 left-0 right-0 h-1 bg-orange-500"
                            />
                          )}
                        </button>
                      </motion.div>
                    );
                  })}
                </div>
              ) : (
                <div className="rounded-md border border-dashed border-orange-300 p-4 text-center text-sm text-orange-700">
                  All remaining slots for today have already passed. Pick another date to see more options.
                </div>
              )}

              {/* Selected Slots List */}
              {selectedSlots.length > 0 && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-orange-50 p-4 rounded-lg">
                  <div className="flex justify-between items-center">
                    <p className="text-orange-800 font-semibold">
                      Selected {selectedSlots.length} slot{selectedSlots.length > 1 ? "s" : ""}:
                    </p>

                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => selectedSlots.forEach((s) => handleRemoveSlot(s.id))}
                      className="text-orange-600"
                    >
                      Clear All
                    </Button>
                  </div>

                  <div className="flex flex-wrap gap-2 mt-2">
                    {selectedSlots.map((slot) => (
                      <div
                        key={slot.id}
                        className="flex items-center gap-2 bg-white border border-orange-300 rounded-md px-3 py-1"
                      >
                        <span className="text-orange-900">
                          {slot.label} — {slot.displayTime}
                        </span>

                        <button type="button" onClick={() => handleRemoveSlot(slot.id)}>
                          <X className="h-3 w-3 text-orange-600" />
                        </button>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </div>

            {/* Purpose */}
            <div className="space-y-2">
              <Label htmlFor="purpose">Purpose of Booking</Label>
              <Textarea
                id="purpose"
                placeholder="Describe your purpose..."
                value={purpose}
                onChange={(e) => setPurpose(e.target.value)}
                rows={4}
                required
              />
            </div>
          </div>

                      {/* Conflict Check Result - Only for Recurring */}
            {bookingType === "recurring" && conflictCheckResult && (
              <div className="border-t pt-4">
                <div className={`rounded-lg p-4 ${
                  conflictCheckResult.blockedCount > 0 && !skipConflicts
                    ? 'bg-red-50 border-2 border-red-300'
                    : conflictCheckResult.conflictCount > 0
                    ? 'bg-yellow-50 border-2 border-yellow-300'
                    : 'bg-green-50 border-2 border-green-300'
                }`}>
                  <div className="space-y-3">
                    <div className="flex items-start justify-between">
                      <h3 className={`font-semibold text-lg ${
                        conflictCheckResult.blockedCount > 0 && !skipConflicts
                          ? 'text-red-800'
                          : conflictCheckResult.conflictCount > 0
                          ? 'text-yellow-800'
                          : 'text-green-800'
                      }`}>
                        Conflict Check Results
                      </h3>
                    </div>

                    <p className={`text-sm font-medium ${
                      conflictCheckResult.blockedCount > 0 && !skipConflicts
                        ? 'text-red-700'
                        : conflictCheckResult.conflictCount > 0
                        ? 'text-yellow-700'
                        : 'text-green-700'
                    }`}>
                      {conflictCheckResult.message}
                    </p>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      <div className="bg-white rounded-md p-3 shadow-sm">
                        <div className="text-xs text-gray-600 mb-1">Total Dates</div>
                        <div className="text-2xl font-bold text-gray-900">{conflictCheckResult.totalDates}</div>
                      </div>
                      <div className="bg-white rounded-md p-3 shadow-sm">
                        <div className="text-xs text-green-600 mb-1">Can Proceed</div>
                        <div className="text-2xl font-bold text-green-600">{conflictCheckResult.canProceedCount}</div>
                      </div>
                      <div className="bg-white rounded-md p-3 shadow-sm">
                        <div className="text-xs text-yellow-600 mb-1">Conflicts</div>
                        <div className="text-2xl font-bold text-yellow-600">{conflictCheckResult.conflictCount}</div>
                      </div>
                      <div className="bg-white rounded-md p-3 shadow-sm">
                        <div className="text-xs text-red-600 mb-1">Blocked</div>
                        <div className="text-2xl font-bold text-red-600">{conflictCheckResult.blockedCount}</div>
                      </div>
                    </div>

                    {conflictCheckResult.conflicts && conflictCheckResult.conflicts.length > 0 && (
                      <details className="mt-4">
                        <summary className="cursor-pointer text-sm font-medium text-gray-700 hover:text-gray-900">
                          View detailed conflicts ({conflictCheckResult.conflicts.filter(c => c.hasConflict).length} dates)
                        </summary>
                        <div className="mt-3 max-h-60 overflow-y-auto space-y-2">
                          {conflictCheckResult.conflicts.filter(c => c.hasConflict).map((conflict, index) => (
                            <div
                              key={index}
                              className={`p-3 rounded-md text-sm ${
                                conflict.canProceed
                                  ? 'bg-yellow-100 border border-yellow-300'
                                  : 'bg-red-100 border border-red-300'
                              }`}
                            >
                              <div className="font-medium">
                                {conflict.bookingDate} - {conflict.dayOfWeek}
                              </div>
                              <div className="text-xs mt-1">{conflict.message}</div>
                              {conflict.alternativeFacilityName && (
                                <div className="text-xs mt-1 text-green-700">
                                  Alternative: {conflict.alternativeFacilityName}
                                </div>
                              )}
                              {conflict.conflictingBooking && (
                                <div className="text-xs mt-1 text-gray-600">
                                  Booked by: {conflict.conflictingBooking.userName} ({conflict.conflictingBooking.userRole})
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </details>
                    )}
                  </div>
                </div>
              </div>
            )}

            {checkingConflicts && bookingType === "recurring" && (
              <div className="border-t pt-4">
                <div className="rounded-lg bg-blue-50 border-2 border-blue-300 p-4">
                  <div className="flex items-center gap-2">
                    <div className="animate-spin h-5 w-5 border-2 border-blue-600 border-t-transparent rounded-full"></div>
                    <span className="text-blue-800 font-medium">Checking for conflicts...</span>
                  </div>
                </div>
              </div>
            )}

          <DialogFooter className="flex flex-col sm:flex-row gap-2">
            <Button type="button" variant="outline" onClick={onClose} disabled={submitting || checkingConflicts}>
              Cancel
            </Button>

            {bookingType === "recurring" && !conflictChecked && (
              <Button 
                type="button" 
                onClick={handleCheckConflicts} 
                className="bg-blue-500 hover:bg-blue-600"
                disabled={checkingConflicts || !startDate || !endDate || selectedSlots.length === 0 || !purpose}
              >
                {checkingConflicts ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Checking Conflicts...
                  </>
                ) : (
                  `Check Conflicts for ${selectedSlots.length} Slot${selectedSlots.length > 1 ? "s" : ""}`
                )}
              </Button>
            )}

            {(bookingType === "single" || (bookingType === "recurring" && conflictChecked)) && (
              <Button 
                type="submit" 
                className="bg-orange-500 hover:bg-orange-600" 
                disabled={submitting || checkingConflicts}
              >
                {submitting 
                  ? "Submitting..." 
                  : bookingType === "recurring"
                  ? `Proceed with Booking (${selectedSlots.length} slot${selectedSlots.length > 1 ? "s" : ""})`
                  : `Submit ${selectedSlots.length} Booking Request${selectedSlots.length > 1 ? "s" : ""}`
                }
              </Button>
            )}
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
