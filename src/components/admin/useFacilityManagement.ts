import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { roomsApi, Room } from '../../api/api';

export function useFacilityManagement() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);

  useEffect(() => {
    loadRooms();
  }, []);

  const loadRooms = async () => {
    setLoading(true);
    const data = await roomsApi.getAll();
    setRooms(data);
    setLoading(false);
  };

  const filteredRooms = rooms.filter((room) => {
    if (!room || !room.name || !room.building) return false;
    return room.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
           room.building.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const handleAddRoom = async (room: Omit<Room, 'id'>) => {
    const id = await roomsApi.create(room);
    if (id) {
      toast.success('Room added successfully');
      setShowAddDialog(false);
      loadRooms();
    } else {
      toast.error('Failed to add room');
    }
  };

  const handleDeleteRoom = async (roomId: string) => {
    const success = await roomsApi.delete(roomId);
    if (success) {
      toast.success('Room deleted successfully');
      loadRooms();
    } else {
      toast.error('Failed to delete room');
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Active':
        return 'bg-green-500';
      case 'Maintenance':
        return 'bg-yellow-500';
      case 'Inactive':
        return 'secondary';
      default:
        return null;
    }
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      'Phòng học': 'bg-blue-100 text-blue-800',
      'Phòng Lab': 'bg-purple-100 text-purple-800',
      'Hội trường': 'bg-green-100 text-green-800',
      'Sân thể thao': 'bg-orange-100 text-orange-800',
    };
    return colors[category] || 'bg-gray-100 text-gray-800';
  };

  const handleViewDetails = (room: Room) => {
    setSelectedRoom(room);
    setShowDetailsDialog(true);
  };

  const handleCloseDetails = () => {
    setShowDetailsDialog(false);
    setSelectedRoom(null);
  };

  return {
    rooms,
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
    setSelectedRoom,
    showDetailsDialog,
    setShowDetailsDialog,
    handleViewDetails,
    handleCloseDetails,
    loadRooms,
  };
}