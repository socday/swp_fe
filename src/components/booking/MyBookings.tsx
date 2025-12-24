import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Label } from "../ui/label";
import { Calendar, Clock, MapPin, XCircle, Eye, CalendarClock, ArrowUpDown } from "lucide-react";
import { motion } from "motion/react";
import { RoomImageGallery } from "../shared/RoomImageGallery";
import { getRoomImages } from "../../api/roomImages";
import { RecurringGroupDetailsDialog } from "./RecurringGroupDetailsDialog";
import { useState } from "react";
import type { RecurringBookingSummary } from "../../api/api/types";

import { useMyBookings } from "./useMyBookings";

interface MyBookingsProps {
  userId: string;
}

export function MyBookings({ userId }: MyBookingsProps) {
  const { 
    bookings, 
    recurringGroups,
    loading, 
    bookingType,
    setBookingType,
    sortBy,
    setSortBy,
    showTodayOnly,
    setShowTodayOnly,
    handleCancelBooking, 
    getStatusBadgeType,
    refreshBookings 
  } = useMyBookings(userId);

  const [selectedGroup, setSelectedGroup] = useState<RecurringBookingSummary | null>(null);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);

  const handleViewDetails = (group: RecurringBookingSummary) => {
    setSelectedGroup(group);
    setDetailsDialogOpen(true);
  };

  const handleDialogClose = () => {
    setDetailsDialogOpen(false);
    setSelectedGroup(null);
  };

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
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>My Bookings</CardTitle>
            <CardDescription>View and manage your facility reservations</CardDescription>
          </div>
          <div className="flex gap-3">
            {bookingType === "individual" && (
              <>
                <div className=" items-end">                  
                  <Label htmlFor="show-today-only">Today</Label>
                  <Button
                    variant={showTodayOnly ? "default" : "outline"}
                    onClick={() => setShowTodayOnly(!showTodayOnly)}
                    className={showTodayOnly ? "bg-orange-500 hover:bg-orange-600" : ""}
                  >
                    <CalendarClock className="h-4 w-4 mr-2" />
                    Today's Bookings
                  </Button>
                </div>
                <div className="w-48">
                  <Label htmlFor="sort-by">Sort By</Label>
                  <Select value={sortBy} onValueChange={(value: "Newest" | "Oldest") => setSortBy(value)}>
                    <SelectTrigger id="sort-by">
                      <ArrowUpDown className="h-4 w-4 mr-2" />
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Oldest">Oldest First</SelectItem>
                      <SelectItem value="Newest">Newest First</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </>
            )}
            <div className="w-56">
              <Label htmlFor="booking-type">Booking Type</Label>
              <Select value={bookingType} onValueChange={(value: "individual" | "recurring") => setBookingType(value)}>
                <SelectTrigger id="booking-type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="individual">Individual Bookings</SelectItem>
                  <SelectItem value="recurring">Recurring Groups</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {bookingType === "individual" ? (
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
                              {booking.slotDisplayTime }
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
                <p>No individual bookings found</p>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {recurringGroups.map((group, index) => (
              <motion.div
                key={group.recurrenceId}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card>
                  <CardContent className="pt-6">
                    <div className="space-y-3">
                      <div className="flex items-center gap-3 flex-wrap">
                        <h3 className="text-lg font-semibold">{group.facilityName}</h3>
                        <Badge className="bg-blue-500">Recurring</Badge>
                        {group.pendingCount > 0 && (
                          <Badge className="bg-yellow-500">Pending ({group.pendingCount})</Badge>
                        )}
                        {group.approvedCount === group.totalBookings && (
                          <Badge className="bg-green-500">All Approved</Badge>
                        )}
                        {group.rejectedCount === group.totalBookings && (
                          <Badge className="bg-red-500">All Rejected</Badge>
                        )}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-600">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          <span>
                            {new Date(group.startDate).toLocaleDateString()} - {new Date(group.endDate).toLocaleDateString()}
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4" />
                          <span>{group.slotName}</span>
                        </div>

                        <div className="text-sm col-span-2">
                          <span className="font-medium">Email: </span>
                          {group.userName}
                        </div>

                        <div className="text-sm col-span-2">
                          <span className="font-medium">Total Bookings: </span>
                          {group.totalBookings} ({group.approvedCount} approved, {group.pendingCount} pending, {group.rejectedCount} rejected)
                        </div>
                      </div>

                      {group.purpose && (
                        <div className="text-sm">
                          <span className="text-gray-600">Purpose: </span>
                          {group.purpose}
                        </div>
                      )}

                      {/* View Details Button */}
                      <div className="pt-3 border-t">
                        <Button
                          onClick={() => handleViewDetails(group)}
                          variant="outline"
                          className="w-full"
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          View Booking Details
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}

            {recurringGroups.length === 0 && (
              <div className="py-12 text-center text-gray-500">
                <p>No recurring booking groups found</p>
              </div>
            )}
          </div>
        )}

        {/* Recurring Group Details Dialog */}
        {selectedGroup && (
          <RecurringGroupDetailsDialog
            open={detailsDialogOpen}
            onOpenChange={handleDialogClose}
            recurrenceGroupId={selectedGroup.recurrenceGroupId}
            facilityName={selectedGroup.facilityName}
            slotName={selectedGroup.slotName}
            startDate={selectedGroup.startDate}
            endDate={selectedGroup.endDate}
            totalBookings={selectedGroup.totalBookings}
            pendingCount={selectedGroup.pendingCount}
            approvedCount={selectedGroup.approvedCount}
            rejectedCount={selectedGroup.rejectedCount}
            isStaffOrAdmin={false}
            onActionComplete={() => {
              handleDialogClose();
              refreshBookings();
            }}
          />
        )}
      </CardContent>
    </Card>
  );
}