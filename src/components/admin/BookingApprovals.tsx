import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Label } from '../ui/label';
import { Calendar, Clock, User, Check, X } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Booking } from '../../api/api';
import { useBookingApprovals } from './useBookingApprovals';

export function BookingApprovals() {
  const {
    loading,
    bookingType,
    setBookingType,
    pendingRequests,
    approvedRequests,
    rejectedRequests,
    recurringGroups,
    handleApprove,
    handleReject,
  } = useBookingApprovals();

  const RequestCard = ({ request }: { request: Booking }) => (
    <Card>
      <CardContent className="pt-6">
        <div className="space-y-4">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-lg">{request.facilityName}</h3>
              <p className="text-sm text-gray-600">{request.building}</p>
            </div>
            <Badge variant="outline">
              {request.campus === 'FU_FPT' ? 'FU FPT' : 'NVH'}
            </Badge>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4" />
              <span>{request.bookedBy || request.userName} </span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <span>{new Date(request.date).toLocaleDateString('en-US', { 
                weekday: 'short', 
                year: 'numeric', 
                month: 'short', 
                day: 'numeric' 
              })}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              <span>{request.startTime} - {request.endTime}</span>
            </div>
          </div>

          <div className="text-sm">
            <span className="text-gray-600">Purpose: </span>
            <span>{request.purpose}</span>
          </div>


          {request.status === 'Pending' && (
            <div className="flex gap-2">
              <Button
                className="flex-1 bg-green-500 hover:bg-green-600"
                onClick={() => handleApprove(request.id)}
              >
                <Check className="h-4 w-4 mr-2" />
                Approve
              </Button>
              <Button
                variant="destructive"
                className="flex-1"
                onClick={() => handleReject(request.id)}
              >
                <X className="h-4 w-4 mr-2" />
                Reject
              </Button>
            </div>
          )}

          {request.status === 'Approved' && (
            <Badge className="bg-green-500 w-full justify-center">Approved</Badge>
          )}

          {request.status === 'Rejected' && (
            <Badge variant="destructive" className="w-full justify-center">Rejected</Badge>
          )}
        </div>
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <Card>
        <CardContent className="py-12 text-center text-gray-500">
          <p>Loading booking requests...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Booking Approvals</CardTitle>
            <CardDescription>Review and manage facility booking requests</CardDescription>
          </div>
          <div className="w-64">
            <Label htmlFor="booking-type-approvals">Booking Type</Label>
            <Select value={bookingType} onValueChange={(value: "individual" | "recurring") => setBookingType(value)}>
              <SelectTrigger id="booking-type-approvals">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="individual">Individual Bookings</SelectItem>
                <SelectItem value="recurring">Recurring Groups</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {bookingType === "individual" ? (
          <Tabs defaultValue="pending">
          <TabsList className="grid w-full grid-cols-3 max-w-md">
            <TabsTrigger value="pending">
              Pending ({pendingRequests.length})
            </TabsTrigger>
            <TabsTrigger value="approved">
              Approved ({approvedRequests.length})
            </TabsTrigger>
            <TabsTrigger value="rejected">
              Rejected ({rejectedRequests.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="pending" className="mt-6">
            <div className="space-y-4">
              {pendingRequests.map(request => (
                <RequestCard key={request.id} request={request} />
              ))}
              {pendingRequests.length === 0 && (
                <div className="text-center py-12 text-gray-500">
                  <p>No pending requests</p>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="approved" className="mt-6">
            <div className="space-y-4">
              {approvedRequests.map(request => (
                <RequestCard key={request.id} request={request} />
              ))}
              {approvedRequests.length === 0 && (
                <div className="text-center py-12 text-gray-500">
                  <p>No approved requests</p>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="rejected" className="mt-6">
            <div className="space-y-4">
              {rejectedRequests.map(request => (
                <RequestCard key={request.id} request={request} />
              ))}
              {rejectedRequests.length === 0 && (
                <div className="text-center py-12 text-gray-500">
                  <p>No rejected requests</p>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
        ) : (
          <div className="space-y-4 mt-6">
            <h3 className="text-lg font-semibold">Recurring Booking Groups</h3>
            {recurringGroups.map((group) => (
              <Card key={group.recurrenceId}>
                <CardContent className="pt-6">
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <h3 className="text-lg font-semibold">{group.facilityName}</h3>
                      <Badge className="bg-blue-500">Recurring</Badge>
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
                        <span className="font-medium">Pattern: </span>
                        {group.patternName}
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
                  </div>
                </CardContent>
              </Card>
            ))}

            {recurringGroups.length === 0 && (
              <div className="text-center py-12 text-gray-500">
                <p>No recurring booking groups found</p>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}