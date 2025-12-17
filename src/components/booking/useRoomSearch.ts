import { useEffect, useMemo, useState } from "react";
import { roomsApi, Room, slotsApi, FacilityType, facilitiesApi, CampusDto, campusesApi } from "../../api/api";
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
  const [availableSlots, setAvailableSlots] = useState<FrontendSlot[]>([]);
  const [loading, setLoading] = useState(false);
  const [allActiveSlots, setAllActiveSlots] = useState<FrontendSlot[]>([]);

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCampus, setSelectedCampus] = useState("");
  const [selectedCategoryId, setSelectedCategoryId] = useState("");
  const [minCapacity, setMinCapacity] = useState("");
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [selectedDate, setSelectedDate] = useState("");
  const [purpose, setPurpose] = useState("");
  const [selectedSlotId, setSelectedSlotId] = useState("all");
  const [facilityTypes, setFacilityTypes] = useState<FacilityType[]>([]);
  const [campusTypes, setCampusTypes] = useState<CampusDto[]>([]);

  const filtersReady = Boolean(
    selectedCampus &&
    selectedCategoryId &&
    selectedDate &&
    minCapacity.trim()
  );

  useEffect(() => {
  const fetchFacilityTypes = async () => {
    try {

      const data = await facilitiesApi.getAll(); 
      setFacilityTypes(data);
      console.log('Fetched facility types:', data);
    } catch (error) {
      console.error('Error fetching facility types:', error);
    }
  };
    fetchFacilityTypes();
  }, []);


  useEffect(() => {
  const fetchCampusTypes = async () => {
    try {
      const data = await campusesApi.getAll(); 
      setCampusTypes(data);
      console.log('Fetched campus types:', data);
    } catch (error) {
      console.error('Error fetching campus types:', error);
    }
  };
    fetchCampusTypes();
  }, []);
  
  useEffect(() => {
    let isMounted = true;

    slotsApi
      .getAvailable(undefined, selectedDate)
      .then((slotData) => {
        if (!isMounted) return;
        const baseSlots = slotData.filter((slot) => !slot.isActive);
        setAllActiveSlots(slotData.filter((slot) => !slot.isActive));
        const currentTime = getCurrentTimeString();
        const now = new Date();

        const isToday = new Date(selectedDate).toDateString() === now.toDateString();
        const finalAvailableSlots = baseSlots.filter((slot) => {
          // If the date is in the future, show all slots
          if (!isToday) return true;

          // If it is Today, we filter:
          // We assume slot.startTime is "HH:mm" or "HH:mm:ss". 
          // We slice(0, 5) to ensure we compare "HH:mm" with "HH:mm"
          const slotStart = slot.startTime.substring(0, 5);
          
          // KEEP if slotStart is greater than currentTime
          return slotStart > currentTime;
        });
        setAvailableSlots(finalAvailableSlots);
        console.log("Fetched slots:", finalAvailableSlots);
      })
      .catch((error) => {
        console.error("Failed to load slots", error);
        if (!isMounted) return;
        setAllActiveSlots([]);
        setAvailableSlots([]);
      });

    return () => {
      isMounted = false;
    };
  }, [selectedDate]);

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



  const filteredRooms = filtersReady ? rooms : [];

  return {
    loading,
    filteredRooms,
    availableSlots,
    filtersReady,

    allActiveSlots,
    setAllActiveSlots,

    searchTerm,
    setSearchTerm,

    facilityTypes,
    setFacilityTypes,

    campusTypes,
    setCampusTypes,

    selectedCampus,
    setSelectedCampus,

    selectedCategoryId,
    setSelectedCategoryId,

    minCapacity,
    setMinCapacity,

    purpose,
    setPurpose,

    selectedDate,
    setSelectedDate,

    selectedSlotId,
    setSelectedSlotId,

    selectedRoom,
    setSelectedRoom,
  };
}
