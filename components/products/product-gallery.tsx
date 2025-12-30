"use client";

import { useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import Lightbox from "yet-another-react-lightbox";
import "yet-another-react-lightbox/styles.css";

interface ProductGalleryProps {
  images: string[];
  productName: string;
}

export function ProductGallery({ images, productName }: ProductGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const displayImages = images.length > 0 ? images : [];

  const openLightbox = (index: number) => {
    setLightboxIndex(index);
    setLightboxOpen(true);
  };

  if (displayImages.length === 0) {
    return (
      <div className="aspect-square bg-muted rounded-xl flex items-center justify-center">
        <p className="text-muted-foreground">Brak zdjęcia</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Main image */}
      <button
        onClick={() => openLightbox(selectedIndex)}
        className="relative aspect-square bg-white rounded-xl overflow-hidden p-6 w-full cursor-zoom-in"
      >
        <Image
          src={displayImages[selectedIndex]}
          alt={`${productName} - zdjęcie ${selectedIndex + 1}`}
          fill
          className="object-contain p-4"
          priority
        />
      </button>

      {/* Lightbox */}
      <Lightbox
        open={lightboxOpen}
        close={() => setLightboxOpen(false)}
        slides={displayImages.map((src) => ({ src }))}
        index={lightboxIndex}
        on={{
          view: ({ index }) => setLightboxIndex(index),
        }}
      />

      {/* Thumbnails */}
      {displayImages.length > 1 && (
        <div
          className="grid auto-cols-[calc((100%-1.75rem)/8)] grid-flow-col gap-1 overflow-x-auto py-1 px-1 scrollbar-hide"
        >
          {displayImages.map((image, index) => (
            <button
              key={index}
              onClick={() => setSelectedIndex(index)}
              className={cn(
                "relative aspect-square rounded-lg overflow-hidden border-2 transition-all bg-white",
                selectedIndex === index
                  ? "border-primary ring-2 ring-primary/20"
                  : "border-transparent hover:border-muted-foreground/30"
              )}
            >
              <Image
                src={image}
                alt={`${productName} - miniatura ${index + 1}`}
                fill
                className="object-contain p-1.5"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
