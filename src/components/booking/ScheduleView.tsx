// import {
//   Card,
//   CardContent,
//   CardDescription,
//   CardHeader,
//   CardTitle,
// } from "../ui/card";
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "../ui/select";
// import { Button } from "../ui/button";

// import {
//   ChevronLeft,
//   ChevronRight,
//   Calendar as CalendarIcon,
// } from "lucide-react";

// import { motion } from "motion/react";

// import { useScheduleView } from "./useScheduleView";

// interface ScheduleViewProps {
//   userId?: string;
// }

// export function ScheduleView({ userId }: ScheduleViewProps) {
//   const {
//     daysOfWeek,
//     weekDates,
//     selectedCampus,
//     loading,
//     bookings,
//     timeSlots,

//     setSelectedCampus,
//     goToPreviousWeek,
//     goToNextWeek,
//     getBookingsForDateAndSlot,
//     getEventColor,
//     formatDateKey,
//   } = useScheduleView(userId);

//   return (
//     <Card>
//       <CardHeader>
//         <div className="flex items-center justify-between flex-wrap gap-4">
//           <div>
//             <CardTitle className="flex items-center gap-2">
//               <CalendarIcon className="h-5 w-5" />
//               Weekly Schedule
//             </CardTitle>
//             <CardDescription>View bookings by time slot</CardDescription>
//           </div>

//           <Select value={selectedCampus} onValueChange={setSelectedCampus}>
//             <SelectTrigger className="w-48">
//               <SelectValue placeholder="Campus" />
//             </SelectTrigger>
//             <SelectContent>
//               <SelectItem value="all">All Campuses</SelectItem>
//               <SelectItem value="FU_FPT">FU FPT Campus</SelectItem>
//               <SelectItem value="NVH">NVH Campus</SelectItem>
//             </SelectContent>
//           </Select>
//         </div>
//       </CardHeader>

//       <CardContent>
//         <div className="space-y-4">
//           {/* Week navigation */}
//           <div className="flex items-center justify-between">
//             <Button variant="outline" size="sm" onClick={goToPreviousWeek}>
//               <ChevronLeft className="h-4 w-4" />
//             </Button>

//             <h3 className="text-center font-medium">
//               {weekDates[0].toLocaleDateString("en-US", {
//                 month: "long",
//                 day: "numeric",
//               })}{" "}
//               -{" "}
//               {weekDates[6].toLocaleDateString("en-US", {
//                 month: "long",
//                 day: "numeric",
//                 year: "numeric",
//               })}
//             </h3>

//             <Button variant="outline" size="sm" onClick={goToNextWeek}>
//               <ChevronRight className="h-4 w-4" />
//             </Button>
//           </div>

//           {/* Schedule grid */}
//           <div className="overflow-x-auto">
//             <div className="min-w-[900px]">
//               {/* Header row */}
//               <div className="grid grid-cols-8 gap-1 mb-1">
//                 <div className="p-2 text-center text-xs bg-gray-100 rounded">
//                   Time Slot
//                 </div>

//                 {weekDates.map((date, i) => {
//                   const isToday =
//                     formatDateKey(new Date()) === formatDateKey(date);

//                   return (
//                     <div
//                       key={i}
//                       className={`p-2 rounded text-center ${
//                         isToday
//                           ? "bg-orange-100 border border-orange-300"
//                           : "bg-gray-50"
//                       }`}
//                     >
//                       <div className="text-xs text-gray-600">
//                         {daysOfWeek[i]}
//                       </div>
//                       <div className={isToday ? "text-orange-600" : ""}>
//                         {date.getDate()}
//                       </div>
//                     </div>
//                   );
//                 })}
//               </div>

//               {/* Time slot rows */}
//               {timeSlots.map((slot) => (
//                 <div
//                   key={slot.id}
//                   className="grid grid-cols-8 gap-1 mb-1"
//                 >
//                   <div className="p-2 border bg-gray-50 rounded">
//                     <div className="text-xs">{slot.label}</div>
//                     <div className="text-[10px] text-gray-600">
//                       {slot.displayTime}
//                     </div>
//                   </div>

//                   {weekDates.map((date, dayIdx) => {
//                     const bookingsForSlot =
//                       getBookingsForDateAndSlot(date, slot.id);

//                     return (
//                       <div
//                         key={dayIdx}
//                         className="p-1 min-h-[60px] border rounded bg-white"
//                       >
//                         <div className="space-y-1">
//                           {bookingsForSlot.map((bk) => (
//                             <div
//                               key={bk.id}
//                               className={`p-1 rounded border text-[10px] truncate ${getEventColor(
//                                 bk
//                               )}`}
//                               title={`${bk.facilityName} - ${bk.purpose ?? ""}`}
//                             >
//                               {bk.facilityName}
//                             </div>
//                           ))}
//                         </div>
//                       </div>
//                     );
//                   })}
//                 </div>
//               ))}
//             </div>
//           </div>

//           {loading && (
//             <div className="text-center text-gray-500 py-8">
//               Loading schedule...
//             </div>
//           )}

//           {!loading && bookings.length === 0 && (
//             <div className="text-center text-gray-500 py-8">
//               No bookings scheduled for this week
//             </div>
//           )}
//         </div>
//       </CardContent>
//     </Card>
//   );
// }

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
    timeSlots,

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
            <Button variant="outline" size="sm" onClick={goToPreviousWeek}>
              <ChevronLeft className="h-4 w-4" />
            </Button>

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

            <Button variant="outline" size="sm" onClick={goToNextWeek}>
              <ChevronRight className="h-4 w-4" />
            </Button>
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
                      <div className={isToday ? "text-orange-600 font-bold" : ""}>
                        {date.getDate()}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Time slot rows */}
              {timeSlots.map((slot) => (
                <div
                  key={slot.id}
                  className="grid grid-cols-8 gap-1 mb-1"
                >
                  {/* Cột hiển thị Slot */}
                  <div className="p-2 border bg-gray-50 rounded flex flex-col justify-center">
                    <div className="text-xs font-bold text-gray-700">{slot.label}</div>
                    <div className="text-[10px] text-gray-500">
                      {slot.displayTime}
                    </div>
                  </div>

                  {/* Các ô nội dung */}
                  {weekDates.map((date, dayIdx) => {
                    const bookingsForSlot = getBookingsForDateAndSlot(date, slot.id);

                    return (
                      <div
                        key={dayIdx}
                        className="min-h-[70px] border rounded bg-white overflow-hidden flex flex-col"
                      >
                        {bookingsForSlot.length > 0 ? (
                          bookingsForSlot.map((bk) => (
                            <div
                              key={bk.id}
                              className={`flex-1 flex items-center justify-center text-center p-2 text-[11px] font-medium transition-colors border-b last:border-b-0 ${getEventColor(
                                bk
                              )}`}
                              title={`${bk.facilityName} - ${bk.purpose ?? ""}`}
                            >
                              <span className="line-clamp-2 px-1">
                                {bk.facilityName}
                              </span>
                            </div>
                          ))
                        ) : (
                          // Ô trống
                          <div className="flex-1 w-full h-full" />
                        )}
                      </div>
                    );
                  })}
                </div>
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