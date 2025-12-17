import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";

import {
  Search,
  MapPin,
  Users,
  Monitor,
  Calendar,
  Clock,
  Info,
} from "lucide-react";
import { RoomImageGallery } from "../shared/RoomImageGallery";
import { BookingDialog } from "./BookingDialog";
import { getRoomImages } from "../../api/roomImages";
import { RoomSearchResults } from "./RoomSearchResults";

import { useRoomSearch } from "./useRoomSearch";
import type { Room } from "../../api/api";

interface RoomSearchProps {
  userRole: "student" | "lecturer" | "admin";
}

export function RoomSearch({ userRole }: RoomSearchProps) {
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [selectedRoomForBooking, setSelectedRoomForBooking] = React.useState<Room | null>(null);
  
  const {
    loading,
    filteredRooms,
    availableSlots,
    filtersReady,

    searchTerm,
    setSearchTerm,

    selectedCampus,
    setSelectedCampus,

    campusTypes,
    setCampusTypes,

    facilityTypes,
    setFacilityTypes,

    selectedCategoryId,
    setSelectedCategoryId,

    minCapacity,
    setMinCapacity,

    selectedDate,
    setSelectedDate,

    selectedSlotId,
    setSelectedSlotId,

    selectedRoom,
    setSelectedRoom,
  } = useRoomSearch();

  const todayIso = new Date().toISOString().split("T")[0];
  const selectedSlot = availableSlots.find((slot) => slot.id.toString() === selectedSlotId);
  const formatTime = (time?: string) => (time ? time.slice(0, 5) : "--:--");
  const slotSummary = (() => {
    if (!selectedDate) return "Preferred slot optional";
    if (!availableSlots.length) return "No remaining slots for this date";
    if (selectedSlot) {
      return `${selectedSlot.name}: ${formatTime(selectedSlot.startTime)} - ${formatTime(selectedSlot.endTime)}`;
    }
    return "All remaining slots";
  })();
  const roomSlotDetails = (() => {
    if (!selectedDate) return "Select a booking date to see slot availability";
    if (!availableSlots.length) return "No remaining slots for the selected date";
    if (selectedSlot) {
      return `${selectedSlot.name}: ${formatTime(selectedSlot.startTime)} - ${formatTime(selectedSlot.endTime)}`;
    }
    return "All remaining slots remain open";
  })();

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Search Available Rooms</CardTitle>
          <CardDescription>
            Find and book facilities across FU FPT and NVH
            campus
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
            {/* Search */}
            <div className="space-y-2">
              <Label className="flex items-center gap-1">
                Search <span className="text-xs font-normal text-gray-500">(optional)</span>
              </Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Room name or building..."
                  value={searchTerm}
                  onChange={(e) =>
                    setSearchTerm(e.target.value)
                  }
                  className="pl-9"
                />
              </div>
            </div>

            {/* Campus */}
            <div className="space-y-2">
            <Label className="flex items-center gap-1">
              Campus <span className="text-red-500">*</span>
            </Label>
            <Select
              // Ensure value is a string, or undefined if empty
              value={selectedCampus || undefined} 
              // The returned value is already a string, so no need to convert it here
              onValueChange={setSelectedCampus} 
            >
              <SelectTrigger>
                <SelectValue placeholder="Select..." />
              </SelectTrigger> 
              <SelectContent>
                {campusTypes.map((campus) => (
                  console.log('Rendering campus:', campus),
                    <SelectItem
                      key={String(campus.id)} 
                      value={String(campus.id)} 
                    >
                     {campus.name} {/* Use campusName, as per CampusDto */}
                    </SelectItem>
                ))}
                {campusTypes.length === 0 && (
                    <SelectItem value="loading" disabled>
                      Loading campuses...
                    </SelectItem>
                )}
            </SelectContent>
            </Select>
            </div>

            {/* Category */}
            <div className="space-y-2"> 
              <Label className="flex items-center gap-1">
                Category <span className="text-red-500">*</span>
              </Label>
              <Select
                // Ensure value is a string
                value={selectedCategoryId || undefined}
                onValueChange={(value) => setSelectedCategoryId(value)} 
              >
                <SelectTrigger>
                    <SelectValue placeholder="Select..." />
                </SelectTrigger>
                <SelectContent>
                    {facilityTypes.map((facilityType) => (
                  console.log('Rendering facilityType:', facilityType),
                      <SelectItem
                        key={facilityType.typeId}
                        value={String(facilityType.typeId)}
                      >
                        {facilityType.typeName}
                      </SelectItem>
                    ))}
                    {facilityTypes.length === 0 && (
                      <SelectItem value="loading" disabled>
                        Loading categories...
                      </SelectItem>
                    )}
                </SelectContent>
              </Select>
            </div>

            {/* Booking Date */}
            <div className="space-y-2">
              <Label className="flex items-center gap-1">
                Booking Date <span className="text-red-500">*</span>
              </Label>
              <Input
                type="date"
                min={todayIso}
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
              />
            </div>
          </div>

          {!filtersReady && (
            <div className="flex items-start gap-3 rounded-md border border-dashed border-orange-300 bg-orange-50 p-4 text-sm text-orange-700">
              <Info className="mt-0.5 h-4 w-4 flex-shrink-0" />
              <p>
                Choose a campus, category, booking date, and minimum capacity to load available rooms.
              </p>
            </div>
          )}

          {filtersReady && (
            <RoomSearchResults
              loading={loading}
              filteredRooms={filteredRooms}
              selectedDate={selectedDate}
              slotSummary={slotSummary}
              roomSlotDetails={roomSlotDetails}
              onBookRoom={(room) => {
                setSelectedRoomForBooking(room);
                setDialogOpen(true);
              }}
            />
          )}
        </CardContent>
      </Card>

      {selectedRoomForBooking && (
        <BookingDialog
          room={selectedRoomForBooking}
          open={dialogOpen}
          userRole={userRole}
          initialDate={selectedDate}
          onClose={() => {
            setDialogOpen(false);
            setSelectedRoomForBooking(null);
          }}
          onSuccess={() => {
            // Optionally refresh the room list
          }}
        />
      )}
    </>
  );
}