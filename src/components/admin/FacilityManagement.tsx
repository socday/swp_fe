import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { Plus, Trash2, MapPin, Users, Monitor, Eye } from 'lucide-react';
import { AddRoomDialog } from '../shared/AddRoomDialog';
import { RoomDetailsDialog } from './RoomDetailsDialog';
import { useFacilityManagement } from './useFacilityManagement';

export function FacilityManagement() {
  const {
    loading,
    searchTerm,
    setSearchTerm,
    showAddDialog,
    setShowAddDialog,
    filteredRooms,
    handleAddRoom,
    handleDeleteRoom,
    getStatusBadge,
    getCategoryColor,
    selectedRoom,
    showDetailsDialog,
    handleViewDetails,
    handleCloseDetails,
    loadRooms,
  } = useFacilityManagement();

  const renderStatusBadge = (status: string) => {
    const variant = getStatusBadge(status);
    if (!variant) return null;
    
    if (variant === 'secondary') {
      return <Badge variant="secondary">{status}</Badge>;
    }
    return <Badge className={variant}>{status}</Badge>;
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="py-12 text-center text-gray-500">
          <p>Loading facilities...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Facility Management</CardTitle>
              <CardDescription>Manage rooms and facilities across both campuses</CardDescription>
            </div>
            <Button className="bg-orange-500 hover:bg-orange-600" onClick={() => setShowAddDialog(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Room
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <Input
              placeholder="Search rooms or buildings..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />

            <div className="grid grid-cols-1 gap-4">
              {filteredRooms.map((room) => (
                <Card key={room.id}>
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between">
                      <div className="space-y-3 flex-1">
                        <div className="flex items-center gap-3">
                          <h3 className="text-lg">{room.name}</h3>
                          <Badge className={getCategoryColor(room.category)}>
                            {room.category}
                          </Badge>
                          {renderStatusBadge(room.status)}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm text-gray-600">
                          <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4" />
                            <span>
                              {room.campus === 'FU_FPT' ? 'FU FPT' : 'NVH'} - {room.building}, Floor {room.floor}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Users className="h-4 w-4" />
                            <span>Capacity: {room.capacity} people</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Monitor className="h-4 w-4" />
                            <span>{room.amenities.length} amenities</span>
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-2">
                          {room.amenities.map((amenity, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {amenity}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      <div className="flex gap-2 ml-4">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewDetails(room)}
                        >
                          <Eye className="h-4 w-4 text-blue-500" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteRoom(room.id)}
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}

              {filteredRooms.length === 0 && (
                <div className="text-center py-12 text-gray-500">
                  <p>No rooms found</p>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <AddRoomDialog
        open={showAddDialog}
        onClose={() => setShowAddDialog(false)}
        onAdd={handleAddRoom}
      />

      <RoomDetailsDialog
        open={showDetailsDialog}
        onClose={handleCloseDetails}
        room={selectedRoom}
        onUpdate={loadRooms}
        isAdmin={true}
      />
    </>
  );
}