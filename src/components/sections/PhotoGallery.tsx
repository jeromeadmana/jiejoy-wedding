"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import { SectionWrapper } from "@/components/layout/SectionWrapper";

const PHOTOS = [
  { src: "/images/wedding.jpg", alt: "Wedding day" },
  { src: "/images/proposal.jpg", alt: "The proposal" },
  { src: "/images/date-night.jpg", alt: "Date night" },
  { src: "/images/road-trip.jpg", alt: "Laughing by the roadside on a motorbike adventure" },
];

export function PhotoGallery() {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const openLightbox = (index: number) => setLightboxIndex(index);
  const closeLightbox = () => setLightboxIndex(null);

  const goNext = () => {
    if (lightboxIndex === null) return;
    setLightboxIndex((lightboxIndex + 1) % PHOTOS.length);
  };

  const goPrev = () => {
    if (lightboxIndex === null) return;
    setLightboxIndex((lightboxIndex - 1 + PHOTOS.length) % PHOTOS.length);
  };

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (lightboxIndex === null) return;
      if (e.key === "Escape") closeLightbox();
      if (e.key === "ArrowRight") goNext();
      if (e.key === "ArrowLeft") goPrev();
    },
    [lightboxIndex]
  );

  useEffect(() => {
    if (lightboxIndex !== null) {
      window.addEventListener("keydown", handleKeyDown);
      return () => window.removeEventListener("keydown", handleKeyDown);
    }
  }, [lightboxIndex, handleKeyDown]);

  return (
    <SectionWrapper
      id="gallery"
      title="Photo Gallery"
      subtitle="A glimpse into our journey together"
    >
      {/* Masonry grid */}
      <div className="columns-1 gap-4 sm:columns-2 lg:columns-3">
        {PHOTOS.map((photo, index) => (
          <div
            key={photo.src}
            className="mb-4 break-inside-avoid animate-on-scroll cursor-pointer overflow-hidden rounded-2xl"
            onClick={() => openLightbox(index)}
          >
            <Image
              src={photo.src}
              alt={photo.alt}
              width={600}
              height={index % 2 === 0 ? 400 : 500}
              className="w-full object-cover transition-transform duration-500 hover:scale-105"
              loading="lazy"
            />
          </div>
        ))}
      </div>

      {/* Lightbox */}
      {lightboxIndex !== null && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 p-4"
          onClick={closeLightbox}
        >
          {/* Close button */}
          <button
            onClick={closeLightbox}
            className="absolute top-4 right-4 text-white/70 hover:text-white transition-colors z-10 cursor-pointer"
            aria-label="Close lightbox"
          >
            <X size={32} />
          </button>

          {/* Previous */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              goPrev();
            }}
            className="absolute left-4 text-white/70 hover:text-white transition-colors z-10 cursor-pointer"
            aria-label="Previous photo"
          >
            <ChevronLeft size={40} />
          </button>

          {/* Image */}
          <div
            className="relative max-h-[85vh] max-w-[90vw]"
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={PHOTOS[lightboxIndex].src}
              alt={PHOTOS[lightboxIndex].alt}
              width={1200}
              height={800}
              className="max-h-[85vh] w-auto rounded-lg object-contain"
              priority
            />
          </div>

          {/* Next */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              goNext();
            }}
            className="absolute right-4 text-white/70 hover:text-white transition-colors z-10 cursor-pointer"
            aria-label="Next photo"
          >
            <ChevronRight size={40} />
          </button>

          {/* Counter */}
          <p className="absolute bottom-4 left-1/2 -translate-x-1/2 text-sm text-white/60">
            {lightboxIndex + 1} / {PHOTOS.length}
          </p>
        </div>
      )}
    </SectionWrapper>
  );
}
