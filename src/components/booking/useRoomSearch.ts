import { useEffect, useState } from "react";
import { roomsApi, Room } from "../../lib/api";

export function useRoomSearch() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCampus, setSelectedCampus] = useState("all");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [minCapacity, setMinCapacity] = useState("");
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);

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
    if (!room?.name || !room?.building) return false;

    const matchesSearch =
      room.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      room.building.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCampus = selectedCampus === "all" || room.campus === selectedCampus;
    const matchesCategory = selectedCategory === "all" || room.category === selectedCategory;
    const matchesCapacity = !minCapacity || room.capacity >= parseInt(minCapacity);
    const matchesStatus = room.status === "Active";

    return matchesSearch && matchesCampus && matchesCategory && matchesCapacity && matchesStatus;
  });

  return {
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
  };
}
