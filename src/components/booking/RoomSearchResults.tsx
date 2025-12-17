import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import {
  MapPin,
  Users,
  Monitor,
  Calendar,
  Clock,
} from "lucide-react";
import { RoomImageGallery } from "../shared/RoomImageGallery";
import { getRoomImages } from "../../api/roomImages";
import type { Room } from "../../api/api";

interface RoomSearchResultsProps {
  loading: boolean;
  filteredRooms: Room[];
  selectedDate: string;
  slotSummary: string;
  roomSlotDetails: string;
  onBookRoom: (room: Room) => void;
}

export function RoomSearchResults({
  loading,
  filteredRooms,
  selectedDate,
  slotSummary,
  roomSlotDetails,
  onBookRoom,
}: RoomSearchResultsProps) {
  return (
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
                    onClick={() => onBookRoom(room)}
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
  );
}
