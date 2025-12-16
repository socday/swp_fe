import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Calendar, Clock, MapPin, XCircle } from "lucide-react";
import { motion } from "motion/react";
import { RoomImageGallery } from "../shared/RoomImageGallery";
import { getRoomImages } from "../../api/roomImages";

import { useMyBookings } from "./useMyBookings";

interface MyBookingsProps {
  userId: string;
}

export function MyBookings({ userId }: MyBookingsProps) {
  const { bookings, loading, handleCancelBooking, getStatusBadgeType } =
    useMyBookings(userId);

  const renderStatusBadge = (status: string) => {
    const type = getStatusBadgeType(status);

    switch (type) {
      case "approved":
        return <Badge className="bg-green-500">Approved</Badge>;
      case "pending":
        return <Badge className="bg-yellow-500">Pending</Badge>;
      case "rejected":
        return <Badge variant="destructive">Rejected</Badge>;
      case "cancelled":
        return <Badge variant="secondary">Cancelled</Badge>;
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="py-12 text-center text-gray-500">
          <p>Loading bookings...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>My Bookings</CardTitle>
        <CardDescription>View and manage your facility reservations</CardDescription>
      </CardHeader>

      <CardContent>
        <div className="space-y-4">
          {bookings.map((booking, index) => {
            const roomImages = getRoomImages(booking.roomImageKey);
            const bookingDate = new Date(booking.date);

            return (
              <motion.div
                key={booking.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between">
                      <div className="space-y-3 flex-1">
                        <div className="flex items-center gap-3">
                          <h3 className="text-lg">{booking.facilityName}</h3>
                          {renderStatusBadge(booking.status)}
                        </div>

                        {/* Details */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-600">
                          <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4" />
                            <span>
                              {booking.campusLabel || "Unknown campus"}
                              {booking.buildingLabel && ` - ${booking.buildingLabel}`}
                            </span>
                          </div>

                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4" />
                            <span>
                              {bookingDate.toLocaleDateString("en-US", {
                                weekday: "short",
                                year: "numeric",
                                month: "short",
                                day: "numeric",
                              })}
                            </span>
                          </div>

                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4" />
                            <span>                            
                              {booking.slotLabel}
                              {booking.slotDisplayTime && ` (${booking.slotDisplayTime})`}
                            </span>
                          </div>
                        </div>

                        <div className="text-sm">
                          <span className="text-gray-600">Purpose: </span>
                          {booking.purpose || "N/A"}
                        </div>

                        {/* Room Images - Lấy từ local asset */}
                        {roomImages.length > 0 && (
                          <div className="mt-3">
                            <RoomImageGallery 
                              images={roomImages} 
                              roomName={booking.facilityName}
                              compact={true}
                            />
                          </div>
                        )}
                      </div>

                      {booking.status === "Pending" && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleCancelBooking(booking.id)}
                        >
                          <XCircle className="h-4 w-4 mr-2" />
                          Cancel
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}

          {bookings.length === 0 && (
            <div className="py-12 text-center text-gray-500">
              <p>No bookings found</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}