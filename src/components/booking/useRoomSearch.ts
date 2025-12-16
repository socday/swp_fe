import { useEffect, useState } from "react";
import { roomsApi, Room, slotsApi } from "../../api/api";
import type { FrontendSlot } from "../../api/apiAdapters";

export function useRoomSearch() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [slots, setSlots] = useState<FrontendSlot[]>([]);
  const [loading, setLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCampus, setSelectedCampus] = useState("all");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [minCapacity, setMinCapacity] = useState("");
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const todayIso = new Date().toISOString().split("T")[0];
  const [selectedDate, setSelectedDate] = useState(todayIso);
  const [selectedSlotId, setSelectedSlotId] = useState("all");

  useEffect(() => {
    loadRooms();
  }, []);

  const loadRooms = async () => {
    setLoading(true);
    try {
      const [roomData, slotData] = await Promise.all([roomsApi.getAll(), slotsApi.getAll()]);
      console.log("Fetched rooms:", roomData);
      setRooms(roomData);
      setSlots(slotData.filter((slot) => slot.isActive));
    } catch (error) {
      console.error("Failed to load rooms or slots", error);
      setRooms([]);
      setSlots([]);
    } finally {
      setLoading(false);
    }
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
    availableSlots: slots,

    searchTerm,
    setSearchTerm,

    selectedCampus,
    setSelectedCampus,

    selectedCategory,
    setSelectedCategory,

    minCapacity,
    setMinCapacity,

    selectedDate,
    setSelectedDate,

    selectedSlotId,
    setSelectedSlotId,

    selectedRoom,
    setSelectedRoom,
  };
}
