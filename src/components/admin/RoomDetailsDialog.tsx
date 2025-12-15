import { Room } from '../../api/api';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../ui/dialog';
import { Badge } from '../ui/badge';
import { MapPin, Users, Monitor, Building2 } from 'lucide-react';
import { RoomImageGallery } from '../shared/RoomImageGallery';
import { RoomImageManager } from './RoomImageManager';
import { Separator } from '../ui/separator';
import { ScrollArea } from '../ui/scroll-area';

interface RoomDetailsDialogProps {
  room: Room | null;
  open: boolean;
  onClose: () => void;
  onUpdate: () => void;
  isAdmin?: boolean; // True nếu là admin (có quyền CRUD ảnh)
}

export function RoomDetailsDialog({ room, open, onClose, onUpdate, isAdmin = false }: RoomDetailsDialogProps) {
  if (!room) return null;

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      Classroom: 'bg-blue-500 text-white',
      Lab: 'bg-purple-500 text-white',
      'Meeting Room': 'bg-green-500 text-white',
      'Lecture Hall': 'bg-orange-500 text-white',
      'Study Room': 'bg-teal-500 text-white',
    };
    return colors[category] || 'bg-gray-500 text-white';
  };

  const getStatusBadge = (status: string) => {
    const badges: Record<string, string> = {
      Active: 'bg-green-100 text-green-800',
      Maintenance: 'bg-yellow-100 text-yellow-800',
      Inactive: 'bg-gray-100 text-gray-800',
    };
    return badges[status] || 'bg-gray-100 text-gray-800';
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <span>{room.name}</span>
            <Badge className={getCategoryColor(room.category)}>{room.category}</Badge>
            <Badge className={getStatusBadge(room.status)}>{room.status}</Badge>
          </DialogTitle>
          <DialogDescription asChild>
            <div className="flex items-center gap-4 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                <span>
                  {room.campus === 'FU_FPT' ? 'FU FPT Campus' : 'NVH Campus'}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Building2 className="h-4 w-4" />
                <span>{room.building}, Floor {room.floor}</span>
              </div>
            </div>
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[calc(90vh-8rem)] pr-4">
          <div className="space-y-6">
            {/* Room Images */}
            <div>
              {isAdmin ? (
                <RoomImageManager room={room} onUpdate={onUpdate} />
              ) : (
                <RoomImageGallery images={room.images} roomName={room.name} />
              )}
            </div>

            <Separator />

            {/* Room Details */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-gray-600">
                  <Users className="h-5 w-5" />
                  <div>
                    <p className="text-xs text-gray-500">Capacity</p>
                    <p className="font-medium">{room.capacity} people</p>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-gray-600">
                  <Monitor className="h-5 w-5" />
                  <div>
                    <p className="text-xs text-gray-500">Amenities</p>
                    <p className="font-medium">{room.amenities.length} available</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Amenities List */}
            {room.amenities.length > 0 && (
              <div>
                <h4 className="font-medium mb-2">Available Amenities</h4>
                <div className="flex flex-wrap gap-2">
                  {room.amenities.map((amenity, index) => (
                    <Badge key={index} variant="outline">
                      {amenity}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
