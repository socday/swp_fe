import { useState } from 'react';
import { Room, adminApi, roomsApi } from '../../api/api';
import { toast } from 'sonner@2.0.3';

export function useRoomImageManager(room: Room, onUpdate: () => void) {
  const [newImageUrl, setNewImageUrl] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  const handleAddImage = async () => {
    if (!newImageUrl.trim()) {
      toast.error('Please enter an image URL');
      return;
    }

    // Validate URL format
    try {
      new URL(newImageUrl);
    } catch {
      toast.error('Please enter a valid URL');
      return;
    }

    setIsAdding(true);

    try {
      const success = await adminApi.addRoomImage(room.id, newImageUrl.trim());
      
      if (success) {
        toast.success('Image added successfully');
        setNewImageUrl('');
        onUpdate(); // Refresh room data
      } else {
        toast.error('Failed to add image');
      }
    } catch (error) {
      console.error('Error adding image:', error);
      toast.error('Failed to add image');
    } finally {
      setIsAdding(false);
    }
  };

  const handleDeleteImage = async (imageUrl: string) => {
    if (!confirm('Are you sure you want to delete this image?')) {
      return;
    }

    try {
      const success = await adminApi.deleteRoomImage(room.id, imageUrl);
      
      if (success) {
        toast.success('Image deleted successfully');
        onUpdate(); // Refresh room data
      } else {
        toast.error('Failed to delete image');
      }
    } catch (error) {
      console.error('Error deleting image:', error);
      toast.error('Failed to delete image');
    }
  };

  return {
    newImageUrl,
    setNewImageUrl,
    isAdding,
    handleAddImage,
    handleDeleteImage,
  };
}
