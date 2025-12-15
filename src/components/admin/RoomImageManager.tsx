import { Room } from '../../api/api';
import { useRoomImageManager } from './useRoomImageManager';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Card } from '../ui/card';
import { Plus, Trash2, Image as ImageIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface RoomImageManagerProps {
  room: Room;
  onUpdate: () => void; // Callback khi cập nhật thành công
}

export function RoomImageManager({ room, onUpdate }: RoomImageManagerProps) {
  const {
    newImageUrl,
    setNewImageUrl,
    isAdding,
    handleAddImage,
    handleDeleteImage,
  } = useRoomImageManager(room, onUpdate);

  const images = room.images || [];

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <ImageIcon className="h-5 w-5 text-gray-600" />
        <h4 className="font-medium">Room Images</h4>
        <span className="text-sm text-gray-500">({images.length} photos)</span>
      </div>

      {/* Add Image Form */}
      <Card className="p-4">
        <div className="flex gap-2">
          <Input
            placeholder="Enter image URL (or use Unsplash)"
            value={newImageUrl}
            onChange={(e) => setNewImageUrl(e.target.value)}
            disabled={isAdding}
          />
          <Button
            onClick={handleAddImage}
            disabled={isAdding || !newImageUrl.trim()}
            className="bg-orange-500 hover:bg-orange-600 shrink-0"
          >
            <Plus className="h-4 w-4 mr-2" />
            {isAdding ? 'Adding...' : 'Add'}
          </Button>
        </div>
        <p className="text-xs text-gray-500 mt-2">
          Paste an image URL or use images from Unsplash, Pexels, etc.
        </p>
      </Card>

      {/* Image Grid */}
      {images.length === 0 ? (
        <div className="flex items-center justify-center bg-gray-50 rounded-lg p-12 text-gray-400">
          <div className="text-center">
            <ImageIcon className="h-16 w-16 mx-auto mb-3 opacity-50" />
            <p>No images yet</p>
            <p className="text-sm mt-1">Add images using the form above</p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          <AnimatePresence>
            {images.map((img, idx) => (
              <motion.div
                key={img}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.2 }}
                className="relative group"
              >
                <div className="aspect-video rounded-lg overflow-hidden bg-gray-100">
                  <img
                    src={img}
                    alt={`${room.name} - Photo ${idx + 1}`}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDeleteImage(img)}
                    className="bg-red-500 hover:bg-red-600"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </Button>
                </div>
                {idx === 0 && (
                  <div className="absolute top-2 left-2 bg-orange-500 text-white text-xs px-2 py-1 rounded">
                    Main
                  </div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      <p className="text-xs text-gray-500 italic">
        * The first image will be used as the main preview image
      </p>
    </div>
  );
}
