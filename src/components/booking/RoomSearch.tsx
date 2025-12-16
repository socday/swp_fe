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
import { BookingDialog } from "./BookingDialog";
import { RoomImageGallery } from "../shared/RoomImageGallery";
import { getRoomImages } from "../../api/roomImages";

import { useRoomSearch } from "./useRoomSearch";

interface RoomSearchProps {
  userRole: "student" | "lecturer" | "admin";
}

export function RoomSearch({ userRole }: RoomSearchProps) {
  const {
    loading,
    filteredRooms,
    availableSlots,
    filtersReady,

    searchTerm,
    setSearchTerm,

    selectedCampus,
    setSelectedCampus,

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
                value={selectedCampus || undefined}
                onValueChange={setSelectedCampus}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="FU_FPT">
                    FU FPT Campus
                  </SelectItem>
                  <SelectItem value="NVH">
                    NVH Campus
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Category */}
            <div className="space-y-2">
              <Label className="flex items-center gap-1 items-start">
                Category <span className="text-red-500">*</span>
              </Label>
              <Select
                value={selectedCategoryId !== null ? String(selectedCategoryId) : undefined}
                onValueChange={(value) => setSelectedCategoryId(Number(value))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select..." />
                </SelectTrigger>
                <SelectContent>
                  {facilityTypes.map((facilityType) => (
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

            {/* Capacity */}
            <div className="space-y-2">
              <Label className="flex items-center gap-1">
                Min. Capacity <span className="text-red-500">*</span>
              </Label>
              <Input
                type="number"
                placeholder="e.g. 20"
                min={1}
                value={minCapacity}
                onChange={(e) => setMinCapacity(e.target.value)}
              />
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

            {/* Preferred Slot */}
            {selectedDate && (
              <div className="space-y-2">
                <Label className="flex items-center gap-1">
                  Preferred Slot <span className="text-xs font-normal text-gray-500">(optional)</span>
                </Label>
                <Select
                  value={selectedSlotId}
                  onValueChange={setSelectedSlotId}
                  disabled={!availableSlots.length}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Remaining Slots</SelectItem>
                    {availableSlots.map((slot) => (
                      <SelectItem key={slot.id} value={slot.id.toString()}>
                        {slot.name} ({formatTime(slot.startTime)} - {formatTime(slot.endTime)})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {selectedDate && !availableSlots.length && (
                  <p className="text-xs text-orange-600">
                    No remaining slots later than the current time for this date.
                  </p>
                )}
              </div>
            )}
          </div>

          {selectedDate && availableSlots.length > 0 && (
            <div className="space-y-2">
              <Label className="flex items-center gap-2 text-gray-700">
                <Clock className="h-4 w-4" /> Available Slots for {new Date(selectedDate).toLocaleDateString()}
              </Label>
              <div className="flex flex-wrap gap-2">
                {availableSlots.map((slot) => (
                  <Badge key={slot.id} variant="secondary" className="text-sm">
                    {slot.name}: {formatTime(slot.startTime)} - {formatTime(slot.endTime)}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {!filtersReady && (
            <div className="flex items-start gap-3 rounded-md border border-dashed border-orange-300 bg-orange-50 p-4 text-sm text-orange-700">
              <Info className="mt-0.5 h-4 w-4 flex-shrink-0" />
              <p>
                Choose a campus, category, booking date, and minimum capacity to load available rooms.
              </p>
            </div>
          )}

          {filtersReady && (
            <>
              {/* Results Header */}
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-600">
                  {loading ? "Loading rooms..." : `${filteredRooms.length} rooms found`}
                </p>
                <p className="text-sm text-gray-600">
                  {selectedDate ? new Date(selectedDate).toLocaleDateString() : "Select a date"}
                  {" • "}
                  {slotSummary}
                </p>
              </div>

              {/* Rooms List */}
              {loading ? (
                <div className="py-12 text-center text-gray-500">Loading rooms...</div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredRooms.map((room) => {
                    const roomImages = getRoomImages(room.id);
                    return (
                      <Card key={room.id}>
                        <CardHeader>
                          <div className="flex items-start justify-between">
                            <div>
                              <CardTitle className="text-lg">
                                {room.name}
                              </CardTitle>
                              <CardDescription>
                                {room.category}
                              </CardDescription>
                            </div>
                            <Badge className="bg-green-500">
                              Available
                            </Badge>
                          </div>
                        </CardHeader>

                        <CardContent className="space-y-3">
                          {roomImages.length > 0 && (
                            <RoomImageGallery
                              images={roomImages}
                              roomName={room.name}
                              compact={true}
                            />
                          )}

                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <MapPin className="h-4 w-4" />
                            <span>
                              {room.campus === "FU_FPT"
                                ? "FU FPT"
                                : "NVH"}{" "}
                              - {room.building}, Floor {room.floor}
                            </span>
                          </div>

                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Users className="h-4 w-4" />
                            <span>
                              Capacity: {room.capacity} people
                            </span>
                          </div>

                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Monitor className="h-4 w-4" />
                            <span>{room.amenities.join(", ")}</span>
                          </div>

                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Clock className="h-4 w-4" />
                            <span>{roomSlotDetails}</span>
                          </div>

                          <Button
                            className="w-full bg-orange-500 hover:bg-orange-600"
                            onClick={() => setSelectedRoom(room)}
                          >
                            <Calendar className="h-4 w-4 mr-2" />
                            Book Room
                          </Button>
                        </CardContent>
                      </Card>
                    );
                  })}

                  {filteredRooms.length === 0 && (
                    <div className="col-span-full text-center py-12 text-gray-500">
                      <p>No rooms found matching your criteria</p>
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {selectedRoom && (
        <BookingDialog
          room={selectedRoom}
          open={true}
          userRole={userRole}
          onClose={() => setSelectedRoom(null)}
        />
      )}
    </>
  );
}