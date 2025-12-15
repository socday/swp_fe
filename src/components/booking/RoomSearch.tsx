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
} from "lucide-react";
import { BookingDialog } from "./BookingDialog";
import { RoomImageGallery } from "../shared/RoomImageGallery";
import { getRoomImages } from "../../lib/roomImages";

import { useRoomSearch } from "./useRoomSearch";

interface RoomSearchProps {
  userRole: "student" | "lecturer" | "admin";
}

export function RoomSearch({ userRole }: RoomSearchProps) {
  const {
    loading,
    filteredRooms,

    searchTerm,
    setSearchTerm,

    selectedCampus,
    setSelectedCampus,

    selectedCategory,
    setSelectedCategory,

    minCapacity,
    setMinCapacity,

    selectedRoom,
    setSelectedRoom,
  } = useRoomSearch();

  if (loading) {
    return (
      <Card>
        <CardContent className="py-12 text-center text-gray-500">
          <p>Loading rooms...</p>
        </CardContent>
      </Card>
    );
  }

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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Search */}
            <div className="space-y-2">
              <Label>Search</Label>
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
              <Label>Campus</Label>
              <Select
                value={selectedCampus}
                onValueChange={setSelectedCampus}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">
                    All Campuses
                  </SelectItem>
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
              <Label>Category</Label>
              <Select
                value={selectedCategory}
                onValueChange={setSelectedCategory}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">
                    All Categories
                  </SelectItem>
                  <SelectItem value="Classroom">
                    Classroom
                  </SelectItem>
                  <SelectItem value="Lab">Lab</SelectItem>
                  <SelectItem value="Meeting Room">
                    Meeting Room
                  </SelectItem>
                  <SelectItem value="Lecture Hall">
                    Lecture Hall
                  </SelectItem>
                  <SelectItem value="Study Room">
                    Study Room
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Capacity */}
            <div className="space-y-2">
              <Label>Min. Capacity</Label>
              <Input
                type="number"
                placeholder="e.g. 20"
                value={minCapacity}
                onChange={(e) => setMinCapacity(e.target.value)}
              />
            </div>
          </div>

          {/* Results Header */}
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600">
              {filteredRooms.length} rooms found
            </p>
          </div>

          {/* Rooms List */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredRooms.map((room) => {
              // Lấy images từ local data thay vì từ API
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
                    {/* Room Images - Lấy từ local asset */}
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