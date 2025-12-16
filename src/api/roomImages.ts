// Local room images data - không phụ thuộc vào API
export const ROOM_IMAGES: Record<string, string[]> = {
  // Room 101 - Classroom
  
};

// Helper function để lấy images của một room
export const getRoomImages = (roomId: string): string[] => {
  return ROOM_IMAGES[roomId] || [];
};

// Helper function để lấy thumbnail (ảnh đầu tiên)
export const getRoomThumbnail = (roomId: string): string | null => {
  const images = getRoomImages(roomId);
  return images.length > 0 ? images[0] : null;
};
