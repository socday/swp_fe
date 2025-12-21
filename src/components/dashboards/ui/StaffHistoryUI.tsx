import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../ui/card";
import { Badge } from "../../ui/badge";
import { Button } from "../../ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "../../ui/dialog";
import { Textarea } from "../../ui/textarea";
import { Label } from "../../ui/label";
import { Calendar, Clock, User, XCircle, CalendarRange } from "lucide-react";
import { Booking } from "../../../api/api";

interface StaffHistoryUIProps {
  bookingHistory: Booking[];
  loading: boolean;
  selectedBooking: Booking | null;
  setSelectedBooking: (booking: Booking | null) => void;
  cancelDialogOpen: boolean;
  setCancelDialogOpen: (open: boolean) => void;
  cancelReason: string;
  setCancelReason: (reason: string) => void;
  handleCancelBooking: () => void;
}

export function StaffHistoryUI({
  bookingHistory,
  loading,
  selectedBooking,
  setSelectedBooking,
  cancelDialogOpen,
  setCancelDialogOpen,
  cancelReason,
  setCancelReason,
  handleCancelBooking,
}: StaffHistoryUIProps) {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Approved":
        return <Badge className="bg-green-500">Approved</Badge>;
      case "Pending":
        return <Badge className="bg-yellow-500">Pending</Badge>;
      case "Rejected":
        return <Badge variant="destructive">Rejected</Badge>;
      case "Cancelled":
        return <Badge variant="secondary">Cancelled</Badge>;
      default:
        return null;
    }
  };

  const openCancelDialog = (booking: Booking) => {
    setSelectedBooking(booking);
    setCancelDialogOpen(true);
  };

  const formatPurpose = (purpose?: string) =>
    (purpose || "No purpose provided").replace("[SEMESTER] ", "");

  // Helper function để get semester days
  const getSemesterDays = (recurringDays: number[]) => {
    const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    return recurringDays.map((d) => dayNames[d]).join(", ");
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="py-12 text-center text-gray-500">
          <p>Loading booking history...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Booking History</CardTitle>
          <CardDescription>View all facility bookings and manage cancellations</CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {bookingHistory.length === 0 ? (
            <p className="text-center text-gray-500 py-8">No booking history</p>
          ) : (
            bookingHistory.map((booking) => {
              const isSemester = booking.isSemester === true;

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
                            {getStatusBadge(booking.status)}
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
                            {booking.bookedBy || booking.userName}
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

                      {/* Cancel Button */}
                      {(booking.status === "Approved" || booking.status === "Pending") && (
                        <Button
                          onClick={() => openCancelDialog(booking)}
                          variant="outline"
                          className="w-full text-red-600 hover:text-red-700"
                        >
                          <XCircle className="h-4 w-4 mr-2" />
                          Cancel {isSemester ? "Semester " : ""}Booking
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </CardContent>
      </Card>

      <Dialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancel Booking</DialogTitle>
            <DialogDescription>
              Are you sure you want to cancel this booking? Please provide a reason.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {selectedBooking && (
              <div className="bg-gray-50 p-4 rounded space-y-2">
                <p>
                  <strong>Room:</strong> {selectedBooking.roomName}
                </p>
                <p>
                  <strong>Date:</strong>{" "}
                  {selectedBooking.isSemester ? (
                    <>
                      {new Date(selectedBooking.date).toLocaleDateString()} →{" "}
                      {new Date(selectedBooking.semesterEndDate!).toLocaleDateString()}
                    </>
                  ) : (
                    new Date(selectedBooking.date).toLocaleDateString()
                  )}
                </p>
                <p>
                  <strong>Time:</strong> {selectedBooking.startTime} - {selectedBooking.endTime}
                </p>
                {selectedBooking.isSemester && (
                  <p>
                    <strong>Type:</strong> <Badge className="bg-orange-500">Semester Booking</Badge>
                  </p>
                )}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="cancelReason">Cancellation Reason</Label>
              <Textarea
                id="cancelReason"
                placeholder="Explain why this booking is being cancelled..."
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                rows={4}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setCancelDialogOpen(false)}>
              Close
            </Button>
            <Button variant="destructive" onClick={handleCancelBooking}>
              Cancel Booking
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
