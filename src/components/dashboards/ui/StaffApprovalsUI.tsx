import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../ui/card";
import { Badge } from "../../ui/badge";
import { Button } from "../../ui/button";
import { Calendar, Clock, User, Check, X, CalendarRange } from "lucide-react";
import { RoomImageGallery } from "../../shared/RoomImageGallery";
import { getRoomImages } from "../../../api/roomImages";
import type { Booking } from "../../../api/api";

interface StaffApprovalsUIProps {
  pendingBookings: Booking[];
  loading: boolean;
  handleApproveBooking: (id: string | number, booking: Booking) => void;
  handleRejectBooking: (id: string | number) => void;
}

export function StaffApprovalsUI({
  pendingBookings,
  loading,
  handleApproveBooking,
  handleRejectBooking,
}: StaffApprovalsUIProps) {
  const formatPurpose = (purpose?: string) =>
    (purpose || "No purpose provided").replace("[SEMESTER] ", "");

  if (loading) {
    return (
      <Card>
        <CardContent className="py-12 text-center text-gray-500">
          <p>Loading pending bookings...</p>
        </CardContent>
      </Card>
    );
  }

  // Helper function để get semester days
  const getSemesterDays = (recurringDays: number[]) => {
    const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    return recurringDays.map((d) => dayNames[d]).join(", ");
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Pending Approvals</CardTitle>
        <CardDescription>Review and approve facility booking requests</CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {pendingBookings.length === 0 ? (
          <p className="text-center text-gray-500 py-8">No pending bookings</p>
        ) : (
          pendingBookings.map((booking) => {
            const isSemester = booking.isSemester === true;
            // Lấy images từ local data
            const roomImages = getRoomImages(booking.roomId);

            return (
              <Card
                key={booking.id}
                className={isSemester ? "border-2 border-orange-200 bg-orange-50/30" : ""}
              >
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    {/* Header */}
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          {isSemester && (
                            <Badge className="bg-orange-500">
                              <CalendarRange className="h-3 w-3 mr-1" />
                              SEMESTER BOOKING
                            </Badge>
                          )}
                          <Badge variant="outline">
                            {booking.campus === "FU_FPT" ? "FU FPT" : "NVH"}
                          </Badge>
                        </div>
                        <h3 className="text-lg">{booking.roomName}</h3>
                        <p className="text-sm text-gray-600">{booking.building}</p>
                      </div>
                    </div>

                    {/* Details */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-600">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4" />
                        <span>                          
                          {booking.userName} ({booking.userRole})
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        <span>
                          {isSemester ? (
                            <>
                              {new Date(booking.date).toLocaleDateString("en-US", {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                              })}{" "}
                              → {new Date(booking.semesterEndDate!).toLocaleDateString("en-US", {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                              })}
                            </>
                          ) : (
                            new Date(booking.date).toLocaleDateString("en-US", {
                              weekday: "short",
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                            })
                          )}
                        </span>
                      </div>
                      {isSemester && (
                        <div className="flex items-center gap-2">
                          <CalendarRange className="h-4 w-4" />
                          <span>{getSemesterDays(booking.recurringDays!)}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        <span>
                          {booking.startTime} - {booking.endTime}
                        </span>
                      </div>
                    </div>

                    {/* Purpose */}
                    <div className={isSemester ? "bg-white p-3 rounded border border-orange-200" : "bg-gray-50 p-3 rounded"}>
                      <p className="text-sm">
                        <span className="text-gray-700">Purpose:</span>{" "}
                        {formatPurpose(booking.purpose)}
                      </p>
                    </div>

                    {/* Room Images - Lấy từ local asset */}
                    {roomImages.length > 0 && (
                      <div className="mt-4">
                        <RoomImageGallery 
                          images={roomImages} 
                          roomName={booking.roomName}
                          compact={true}
                        />
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex gap-2">
                      <Button
                        onClick={() => handleApproveBooking(booking.id, booking)}
                        className="flex-1 bg-green-500 hover:bg-green-600"
                      >
                        <Check className="h-4 w-4 mr-2" />
                        Approve{isSemester ? " Semester" : ""}
                      </Button>
                      <Button
                        onClick={() => handleRejectBooking(booking.id)}
                        variant="destructive"
                        className="flex-1"
                      >
                        <X className="h-4 w-4 mr-2" />
                        Reject{isSemester ? " Semester" : ""}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </CardContent>
    </Card>
  );
}