import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "../ui/dialog";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Card, CardContent } from "../ui/card";
import { Calendar, Clock, User, Check, X } from "lucide-react";
import { useState, useEffect } from "react";
import { bookingsApi } from "../../api/api";
import type { Booking } from "../../api/api";
import { toast } from "sonner";
import { RoomImageGallery } from "../shared/RoomImageGallery";
import { getRoomImages } from "../../api/roomImages";

interface RecurringGroupDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  recurrenceGroupId: string;
  facilityName: string;
  slotName: string;
  startDate: string;
  endDate: string;
  totalBookings: number;
  pendingCount: number;
  approvedCount: number;
  rejectedCount: number;
  isStaffOrAdmin?: boolean;
  onActionComplete?: () => void;
}

export function RecurringGroupDetailsDialog({
  open,
  onOpenChange,
  recurrenceGroupId,
  facilityName,
  slotName,
  startDate,
  endDate,
  totalBookings,
  pendingCount,
  approvedCount,
  rejectedCount,
  isStaffOrAdmin = false,
  onActionComplete,
}: RecurringGroupDetailsDialogProps) {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(false);
  const [actionInProgress, setActionInProgress] = useState(false);

  useEffect(() => {
    if (open && recurrenceGroupId) {
      loadBookings();
    }
  }, [open, recurrenceGroupId]);

  const loadBookings = async () => {
    setLoading(true);
    try {
      const data = await bookingsApi.getBookingListOfRecurrenceGroup(recurrenceGroupId);
      setBookings(data);
    } catch (error) {
      console.error("Failed to load recurring group bookings:", error);
      toast.error("Failed to load booking details");
    } finally {
      setLoading(false);
    }
  };

  const handleApproveAll = async () => {
    setActionInProgress(true);
    try {
      const result = await bookingsApi.updateRecurringStatus(recurrenceGroupId, {
        status: "Approved",
      });
      
      if (result) {
        toast.success("All bookings in this recurring group have been approved");
        onOpenChange(false);
        onActionComplete?.();
      } else {
        toast.error("Failed to approve recurring group");
      }
    } catch (error) {
      console.error("Error approving recurring group:", error);
      toast.error("Failed to approve recurring group");
    } finally {
      setActionInProgress(false);
    }
  };

  const handleRejectAll = async () => {
    setActionInProgress(true);
    try {
      const result = await bookingsApi.updateRecurringStatus(recurrenceGroupId, {
        status: "Rejected",
        rejectionReason: "Entire recurring group rejected by staff",
      });
      
      if (result) {
        toast.success("All bookings in this recurring group have been rejected");
        onOpenChange(false);
        onActionComplete?.();
      } else {
        toast.error("Failed to reject recurring group");
      }
    } catch (error) {
      console.error("Error rejecting recurring group:", error);
      toast.error("Failed to reject recurring group");
    } finally {
      setActionInProgress(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "approved":
        return "bg-green-500";
      case "pending":
        return "bg-yellow-500";
      case "rejected":
        return "bg-red-500";
      case "cancelled":
        return "bg-gray-500";
      default:
        return "bg-blue-500";
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Recurring Group Booking Details</DialogTitle>
          <DialogDescription>
            View all bookings in this recurring group
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Summary Section */}
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-3">
                <h3 className="text-lg font-semibold">{facilityName}</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    <span>
                      {new Date(startDate).toLocaleDateString()} - {new Date(endDate).toLocaleDateString()}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    <span>{slotName}</span>
                  </div>

                  <div className="text-sm col-span-2">
                    <span className="font-medium">Total Bookings: </span>
                    {totalBookings} ({approvedCount} approved, {pendingCount} pending, {rejectedCount} rejected)
                  </div>
                </div>

                {/* Action Buttons for Staff/Admin */}
                {isStaffOrAdmin && pendingCount > 0 && (
                  <div className="flex gap-2 pt-4 border-t">
                    <Button
                      onClick={handleApproveAll}
                      disabled={actionInProgress}
                      className="flex-1 bg-green-600 hover:bg-green-700"
                    >
                      <Check className="mr-2 h-4 w-4" />
                      Approve All Pending
                    </Button>
                    <Button
                      onClick={handleRejectAll}
                      disabled={actionInProgress}
                      variant="destructive"
                      className="flex-1"
                    >
                      <X className="mr-2 h-4 w-4" />
                      Reject All Pending
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Bookings List */}
          {loading ? (
            <div className="text-center py-8 text-gray-500">
              <p>Loading bookings...</p>
            </div>
          ) : (
            <div className="space-y-2">
              <h4 className="font-semibold text-sm text-gray-700">Individual Bookings ({bookings.length})</h4>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {bookings.map((booking) => (
                  <Card key={booking.bookingId}>
                    <CardContent className="pt-4">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <Calendar className="h-3 w-3 text-gray-500" />
                            <span className="text-sm font-medium">
                              {new Date(booking.bookingDate).toLocaleDateString()}
                            </span>
                            <Badge className={getStatusColor(booking.status)}>
                              {booking.status}
                            </Badge>
                          </div>
                          
                          {booking.purpose && (
                            <p className="text-xs text-gray-600 mt-1">
                              Purpose: {booking.purpose}
                            </p>
                          )}
                          
                          {booking.rejectionReason && (
                            <p className="text-xs text-red-600 mt-1">
                              Reason: {booking.rejectionReason}
                            </p>
                          )}
                        </div>
                        
                        <div className="text-xs text-gray-500">
                          ID: {booking.bookingId}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
