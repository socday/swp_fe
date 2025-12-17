import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "../ui/dialog";
import { Button } from "../ui/button";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import { Calendar } from "../ui/calendar";
import { motion } from "motion/react";
import { Clock, CheckCircle2, X, CalendarDays } from "lucide-react";
import { RoomImageGallery } from "../shared/RoomImageGallery";
import { getRoomImages } from "../../api/roomImages";

import { type Room } from "../../api/api";

import { useBookingDialog } from "./useBookingDialog";

interface BookingDialogProps {
  room: Room;
  open: boolean;
  userRole: "student" | "lecturer" | "admin";
  onClose: () => void;
  onSuccess?: () => void;
}

export function BookingDialog({ room, open, userRole, onClose, onSuccess }: BookingDialogProps) {
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
    semesterStart,
    setSemesterStart,
    semesterEnd,
    setSemesterEnd,
    selectedDays,
    handleDayToggle,
    availableSlots,
  } = useBookingDialog(room, onSuccess, onClose, userRole);

  // Lấy images từ local data thay vì từ API
  const roomImages = getRoomImages(room.id);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Book {room.name}</DialogTitle>
          <DialogDescription>
            {room.building} - {room.campus === "FU_FPT" ? "FU FPT Campus" : "NVH Campus"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="space-y-6 py-4">
            {/* Room Images - Lấy từ local asset */}
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

            {/* Booking Type - Only for Lecturer */}
            {userRole === "lecturer" && (
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
                    onClick={() => setBookingType("semester")}
                    className={`p-4 rounded-lg border-2 text-left ${
                      bookingType === "semester"
                        ? "border-orange-500 bg-orange-50"
                        : "border-gray-200 bg-white hover:border-orange-300"
                    }`}
                  >
                    <div className={`font-semibold ${bookingType === "semester" ? "text-orange-900" : "text-gray-900"}`}>
                      Semester (3 Months)
                    </div>
                    <div className="text-sm text-gray-600 mt-1">Recurring weekly booking</div>
                  </button>
                </div>
              </div>
            )}

            {/* Date Selector */}
            <div className="space-y-2">
              <Label>{bookingType === "semester" ? "Semester Start Date" : "Select Date"}</Label>
              <Calendar
                mode="single"
                selected={bookingType === "semester" ? semesterStart : date}
                onSelect={bookingType === "semester" ? setSemesterStart : setDate}
                disabled={(d) => d < new Date(new Date().setHours(0, 0, 0, 0))}
                className="rounded-md border w-full"
              />
              {bookingType === "semester" && semesterStart && (
                <p className="text-sm text-gray-600">
                  Semester ends: {semesterEnd?.toLocaleDateString()} (3 months from start)
                </p>
              )}
            </div>

            {/* Recurring Days - Only for Semester Booking */}
            {bookingType === "semester" && userRole === "lecturer" && (
              <div className="space-y-3">
                <Label>Select Recurring Days</Label>
                <p className="text-sm text-gray-600">Choose which days of the week to repeat this booking</p>
                <div className="grid grid-cols-7 gap-2">
                  {[
                    { id: 1, label: "Mon", full: "Monday" },
                    { id: 2, label: "Tue", full: "Tuesday" },
                    { id: 3, label: "Wed", full: "Wednesday" },
                    { id: 4, label: "Thu", full: "Thursday" },
                    { id: 5, label: "Fri", full: "Friday" },
                    { id: 6, label: "Sat", full: "Saturday" },
                    { id: 0, label: "Sun", full: "Sunday" },
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

            {/* Time Slots */}
            <div className="space-y-3">
              <Label className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Select Time Slots (Multiple Selection)
              </Label>

              {availableSlots.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {availableSlots.map((slot, index) => {
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
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={submitting}>
              Cancel
            </Button>

            <Button type="submit" className="bg-orange-500 hover:bg-orange-600" disabled={submitting}>
              {submitting 
                ? "Submitting..." 
                : bookingType === "semester" && selectedDays.length > 0
                ? `Submit Semester Booking (${selectedDays.length} days/week × ${selectedSlots.length} slot${selectedSlots.length > 1 ? "s" : ""})`
                : `Submit ${selectedSlots.length} Booking Request${selectedSlots.length > 1 ? "s" : ""}`
              }
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}