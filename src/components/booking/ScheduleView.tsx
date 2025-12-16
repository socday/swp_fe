import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Button } from "../ui/button";

import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
} from "lucide-react";

import { TIME_SLOTS } from "../../api/timeSlots";
import { motion } from "motion/react";

import { useScheduleView } from "./useScheduleView";

interface ScheduleViewProps {
  userId?: string;
}

export function ScheduleView({ userId }: ScheduleViewProps) {
  const {
    daysOfWeek,
    weekDates,
    selectedCampus,
    loading,
    bookings,

    setSelectedCampus,
    goToPreviousWeek,
    goToNextWeek,
    getBookingsForDateAndSlot,
    getEventColor,
    formatDateKey,
  } = useScheduleView(userId);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <CardTitle className="flex items-center gap-2">
              <CalendarIcon className="h-5 w-5" />
              Weekly Schedule
            </CardTitle>
            <CardDescription>View bookings by time slot</CardDescription>
          </div>

          <Select value={selectedCampus} onValueChange={setSelectedCampus}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Campus" />
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
          {/* Week navigation */}
          <div className="flex items-center justify-between">
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button variant="outline" size="sm" onClick={goToPreviousWeek}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
            </motion.div>

            <h3 className="text-center font-medium">
              {weekDates[0].toLocaleDateString("en-US", {
                month: "long",
                day: "numeric",
              })}{" "}
              -{" "}
              {weekDates[6].toLocaleDateString("en-US", {
                month: "long",
                day: "numeric",
                year: "numeric",
              })}
            </h3>

            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button variant="outline" size="sm" onClick={goToNextWeek}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </motion.div>
          </div>

          {/* Schedule grid */}
          <div className="overflow-x-auto">
            <div className="min-w-[900px]">
              {/* Header row */}
              <div className="grid grid-cols-8 gap-1 mb-1">
                <div className="p-2 text-center text-xs bg-gray-100 rounded">
                  Time Slot
                </div>

                {weekDates.map((date, i) => {
                  const isToday =
                    formatDateKey(new Date()) === formatDateKey(date);

                  return (
                    <div
                      key={i}
                      className={`p-2 rounded text-center ${
                        isToday
                          ? "bg-orange-100 border border-orange-300"
                          : "bg-gray-50"
                      }`}
                    >
                      <div className="text-xs text-gray-600">
                        {daysOfWeek[i]}
                      </div>
                      <div className={isToday ? "text-orange-600" : ""}>
                        {date.getDate()}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Time slot rows */}
              {TIME_SLOTS.map((slot, slotIdx) => (
                <motion.div
                  key={slot.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: slotIdx * 0.05 }}
                  className="grid grid-cols-8 gap-1 mb-1"
                >
                  {/* Slot label */}
                  <div className="p-2 border bg-gray-50 rounded">
                    <div className="text-xs">{slot.label}</div>
                    <div className="text-[10px] text-gray-600">
                      {slot.displayTime}
                    </div>
                  </div>

                  {/* Day cells */}
                  {weekDates.map((date, dayIdx) => {
                    const isToday =
                      formatDateKey(new Date()) === formatDateKey(date);

                    const bookingsForSlot = getBookingsForDateAndSlot(
                      date,
                      slot.id
                    );

                    return (
                      <div
                        key={dayIdx}
                        className={`p-1 min-h-[60px] border rounded ${
                          isToday ? "bg-orange-50/50" : "bg-white"
                        }`}
                      >
                        <div className="space-y-1">
                          {bookingsForSlot.map((bk) => (
                            <motion.div
                              key={bk.id}
                              initial={{ scale: 0.8, opacity: 0 }}
                              animate={{ scale: 1, opacity: 1 }}
                              whileHover={{ scale: 1.05 }}
                              className={`p-1 rounded border text-[10px] truncate cursor-default ${getEventColor(
                                bk
                              )}`}
                              title={`${bk.facilityName} - ${bk.purpose ?? ""}`}
                            >
                              <div>{bk.facilityName}</div>
                            </motion.div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </motion.div>
              ))}
            </div>
          </div>

          {loading && (
            <div className="text-center text-gray-500 py-8">
              Loading schedule...
            </div>
          )}

          {!loading && bookings.length === 0 && (
            <div className="text-center text-gray-500 py-8">
              No bookings scheduled for this week
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}