import { useEffect, useMemo, useState } from "react";
import { roomsApi, Room, slotsApi, FacilityType, facilitiesApi } from "../../api/api";
import type { FrontendSlot } from "../../api/apiAdapters";

const getCurrentTimeString = () => {
  const now = new Date();
  const hours = String(now.getHours()).padStart(2, "0");
  const minutes = String(now.getMinutes()).padStart(2, "0");
  return `${hours}:${minutes}`;
};

const isTodayDate = (value: string) => {
  const today = new Date().toISOString().split("T")[0];
  return value === today;
};

export function useRoomSearch() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [slots, setSlots] = useState<FrontendSlot[]>([]);
  const [loading, setLoading] = useState(false);

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCampus, setSelectedCampus] = useState("");
  const [selectedCategoryId, setSelectedCategoryId] = useState("");
  const [minCapacity, setMinCapacity] = useState("");
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedSlotId, setSelectedSlotId] = useState("all");
  const [facilityTypes, setFacilityTypes] = useState<FacilityType[]>([]);

  const filtersReady = Boolean(
    selectedCampus &&
    selectedCategoryId &&
    selectedDate &&
    minCapacity.trim()
  );

  useEffect(() => {
  const fetchFacilityTypes = async () => {
    try {
      const data = await facilitiesApi.getAllFacilityTypes(); 
      setFacilityTypes(data);
    } catch (error) {
      console.error('Error fetching facility types:', error);
    }
  };

  fetchFacilityTypes();
}, []);
  useEffect(() => {
    let isMounted = true;

    slotsApi
      .getAll()
      .then((slotData) => {
        if (!isMounted) return;
        setSlots(slotData.filter((slot) => slot.isActive));
      })
      .catch((error) => {
        console.error("Failed to load slots", error);
        if (!isMounted) return;
        setSlots([]);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (!filtersReady) {
      setRooms([]);
      setSelectedRoom(null);
      setLoading(false);
      return;
    }

    let isMounted = true;
    setLoading(true);

    roomsApi
      .getAll()
      .then((roomData) => {
        if (!isMounted) return;
        setRooms(roomData);
      })
      .catch((error) => {
        console.error("Failed to load rooms", error);
        if (!isMounted) return;
        setRooms([]);
      })
      .finally(() => {
        if (!isMounted) return;
        setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [filtersReady, selectedCampus, selectedCategoryId, selectedDate, minCapacity]);

  useEffect(() => {
    if (!selectedDate) {
      setSelectedSlotId("all");
    }
  }, [selectedDate]);

  const availableSlots = useMemo(() => {
    if (!selectedDate) return [];
    if (isTodayDate(selectedDate)) {
      const currentTime = getCurrentTimeString();
      return slots.filter((slot) => slot.startTime > currentTime);
    }
    return slots;
  }, [slots, selectedDate]);

  useEffect(() => {
    if (selectedSlotId === "all") return;
    const exists = availableSlots.some((slot) => slot.id.toString() === selectedSlotId);
    if (!exists) {
      setSelectedSlotId("all");
    }
  }, [availableSlots, selectedSlotId]);

  const minCapacityNumber = parseInt(minCapacity, 10);
  const filteredRooms = filtersReady ? rooms.filter((room) => {
    if (!room?.name || !room?.building) return false;

    const matchesSearch =
      room.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      room.building.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCampus = room.campus === selectedCampus;
    // 🛑 CHECK ROOM'S facilityTypeId AGAINST selectedCategoryId
    const matchesCategory = room.facilityTypeId === selectedCategoryId; 
    const matchesCapacity = Number.isNaN(minCapacityNumber) || room.capacity >= minCapacityNumber;
    const matchesStatus = room.status === "Active";

    return matchesSearch && matchesCampus && matchesCategory && matchesCapacity && matchesStatus;
  }) : [];

  return {
    loading,
    filteredRooms,
    availableSlots,
    filtersReady,

    searchTerm,
    setSearchTerm,

    facilityTypes,
    setFacilityTypes,

    selectedCampus,
    setSelectedCampus,

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
  };
}
