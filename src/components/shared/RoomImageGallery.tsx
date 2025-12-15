import { useState } from 'react';
import { Dialog, DialogContent, DialogTitle } from '../ui/dialog';
import { Button } from '../ui/button';
import { ChevronLeft, ChevronRight, X, Image as ImageIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface RoomImageGalleryProps {
  images?: string[];
  roomName: string;
  compact?: boolean; // Chế độ hiển thị compact (grid nhỏ)
}

export function RoomImageGallery({ images, roomName, compact = false }: RoomImageGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  // Nếu không có ảnh, hiển thị placeholder
  if (!images || images.length === 0) {
    return (
      <div className="flex items-center justify-center bg-gray-100 rounded-lg p-8 text-gray-400">
        <div className="text-center">
          <ImageIcon className="h-12 w-12 mx-auto mb-2 opacity-50" />
          <p className="text-sm">No images available</p>
        </div>
      </div>
    );
  }

  const handlePrevious = () => {
    if (selectedIndex !== null) {
      setSelectedIndex(selectedIndex === 0 ? images.length - 1 : selectedIndex - 1);
    }
  };

  const handleNext = () => {
    if (selectedIndex !== null) {
      setSelectedIndex(selectedIndex === images.length - 1 ? 0 : selectedIndex + 1);
    }
  };

  if (compact) {
    // Chế độ compact: hiển thị grid nhỏ
    return (
      <>
        <div className="grid grid-cols-3 gap-2">
          {images.slice(0, 3).map((img, idx) => (
            <button
              key={idx}
              onClick={() => setSelectedIndex(idx)}
              className="aspect-video rounded-lg overflow-hidden hover:opacity-80 transition-opacity"
            >
              <img
                src={img}
                alt={`${roomName} - Photo ${idx + 1}`}
                className="w-full h-full object-cover"
              />
            </button>
          ))}
          {images.length > 3 && (
            <button
              onClick={() => setSelectedIndex(3)}
              className="aspect-video rounded-lg bg-gray-900/80 flex items-center justify-center text-white hover:bg-gray-900 transition-colors"
            >
              <span className="text-sm">+{images.length - 3} more</span>
            </button>
          )}
        </div>

        {/* Lightbox Dialog */}
        <Dialog open={selectedIndex !== null} onOpenChange={() => setSelectedIndex(null)}>
          <DialogContent className="max-w-4xl p-0">
            <DialogTitle className="sr-only">{roomName} - Gallery</DialogTitle>
            <div className="relative">
              <AnimatePresence mode="wait">
                {selectedIndex !== null && (
                  <motion.img
                    key={selectedIndex}
                    src={images[selectedIndex]}
                    alt={`${roomName} - Photo ${selectedIndex + 1}`}
                    className="w-full h-[70vh] object-contain bg-black"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  />
                )}
              </AnimatePresence>

              {/* Navigation Buttons */}
              {images.length > 1 && (
                <>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white"
                    onClick={handlePrevious}
                  >
                    <ChevronLeft className="h-6 w-6" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white"
                    onClick={handleNext}
                  >
                    <ChevronRight className="h-6 w-6" />
                  </Button>
                </>
              )}

              {/* Counter */}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/70 text-white px-3 py-1 rounded-full text-sm">
                {selectedIndex !== null && `${selectedIndex + 1} / ${images.length}`}
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </>
    );
  }

  // Chế độ full: hiển thị carousel lớn
  return (
    <div className="space-y-4">
      {/* Main Image */}
      <div className="relative">
        <div className="aspect-video rounded-lg overflow-hidden bg-gray-100">
          <img
            src={images[0]}
            alt={`${roomName} - Main photo`}
            className="w-full h-full object-cover cursor-pointer hover:opacity-90 transition-opacity"
            onClick={() => setSelectedIndex(0)}
          />
        </div>
        {images.length > 1 && (
          <div className="absolute top-4 right-4 bg-black/70 text-white px-3 py-1 rounded-full text-sm">
            {images.length} photos
          </div>
        )}
      </div>

      {/* Thumbnail Grid */}
      {images.length > 1 && (
        <div className="grid grid-cols-4 gap-2">
          {images.slice(1, 5).map((img, idx) => (
            <button
              key={idx + 1}
              onClick={() => setSelectedIndex(idx + 1)}
              className="aspect-video rounded-lg overflow-hidden hover:opacity-80 transition-opacity"
            >
              <img
                src={img}
                alt={`${roomName} - Photo ${idx + 2}`}
                className="w-full h-full object-cover"
              />
            </button>
          ))}
          {images.length > 5 && (
            <button
              onClick={() => setSelectedIndex(5)}
              className="aspect-video rounded-lg bg-gray-900/80 flex items-center justify-center text-white hover:bg-gray-900 transition-colors"
            >
              <span className="text-sm">+{images.length - 5} more</span>
            </button>
          )}
        </div>
      )}

      {/* Lightbox Dialog */}
      <Dialog open={selectedIndex !== null} onOpenChange={() => setSelectedIndex(null)}>
        <DialogContent className="max-w-4xl p-0">
          <DialogTitle className="sr-only">{roomName} - Gallery</DialogTitle>
          <div className="relative">
            <AnimatePresence mode="wait">
              {selectedIndex !== null && (
                <motion.img
                  key={selectedIndex}
                  src={images[selectedIndex]}
                  alt={`${roomName} - Photo ${selectedIndex + 1}`}
                  className="w-full h-[70vh] object-contain bg-black"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                />
              )}
            </AnimatePresence>

            {/* Navigation Buttons */}
            {images.length > 1 && (
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white"
                  onClick={handlePrevious}
                >
                  <ChevronLeft className="h-6 w-6" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white"
                  onClick={handleNext}
                >
                  <ChevronRight className="h-6 w-6" />
                </Button>
              </>
            )}

            {/* Counter */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/70 text-white px-3 py-1 rounded-full text-sm">
              {selectedIndex !== null && `${selectedIndex + 1} / ${images.length}`}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
