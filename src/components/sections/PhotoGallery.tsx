"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { X, ChevronLeft, ChevronRight, ArrowRight } from "lucide-react";
import { SectionWrapper } from "@/components/layout/SectionWrapper";

export type GalleryPhoto = {
  key: string;
  src: string;        // grid thumbnail
  fullSrc: string;    // lightbox image
  alt: string;
  isCloudinary?: boolean;
};

// Fallback set used when no Cloudinary photos have been uploaded yet,
// so the section never renders empty.
const FALLBACK_PHOTOS: GalleryPhoto[] = [
  { key: "wedding",    src: "/images/wedding.jpg",    fullSrc: "/images/wedding.jpg",    alt: "Wedding day" },
  { key: "proposal",   src: "/images/proposal.jpg",   fullSrc: "/images/proposal.jpg",   alt: "The proposal" },
  { key: "date-night", src: "/images/date-night.jpg", fullSrc: "/images/date-night.jpg", alt: "Date night" },
  { key: "road-trip",  src: "/images/road-trip.jpg",  fullSrc: "/images/road-trip.jpg", alt: "Laughing by the roadside on a motorbike adventure" },
];

type Props = {
  photos?: GalleryPhoto[];
};

export function PhotoGallery({ photos }: Props = {}) {
  const displayPhotos = photos && photos.length > 0 ? photos : FALLBACK_PHOTOS;
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const openLightbox = (index: number) => setLightboxIndex(index);
  const closeLightbox = () => setLightboxIndex(null);

  const goNext = useCallback(() => {
    setLightboxIndex((curr) => (curr === null ? null : (curr + 1) % displayPhotos.length));
  }, [displayPhotos.length]);

  const goPrev = useCallback(() => {
    setLightboxIndex((curr) =>
      curr === null ? null : (curr - 1 + displayPhotos.length) % displayPhotos.length,
    );
  }, [displayPhotos.length]);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (lightboxIndex === null) return;
      if (e.key === "Escape") closeLightbox();
      if (e.key === "ArrowRight") goNext();
      if (e.key === "ArrowLeft") goPrev();
    },
    [lightboxIndex, goNext, goPrev],
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
        {displayPhotos.map((photo, index) => (
          <div
            key={photo.key}
            className="mb-4 break-inside-avoid animate-on-scroll cursor-pointer overflow-hidden rounded-2xl"
            onClick={() => openLightbox(index)}
          >
            {photo.isCloudinary ? (
              // Cloudinary URLs already include f_auto/q_auto/w_* transforms,
              // so next/image would just be redundant optimization on top.
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={photo.src}
                alt={photo.alt}
                className="w-full object-cover transition-transform duration-500 hover:scale-105"
                loading="lazy"
              />
            ) : (
              <Image
                src={photo.src}
                alt={photo.alt}
                width={600}
                height={index % 2 === 0 ? 400 : 500}
                className="w-full object-cover transition-transform duration-500 hover:scale-105"
                loading="lazy"
              />
            )}
          </div>
        ))}
      </div>

      {/* Link to full archival gallery */}
      <div className="mt-10 flex justify-center">
        <Link
          href="/gallery"
          className="group inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-wider transition-colors"
          style={{ color: "var(--color-charcoal, #2C2C2C)" }}
        >
          Browse all our photos
          <ArrowRight
            size={16}
            className="transition-transform duration-300 group-hover:translate-x-1"
          />
        </Link>
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
            {displayPhotos[lightboxIndex].isCloudinary ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={displayPhotos[lightboxIndex].fullSrc}
                alt={displayPhotos[lightboxIndex].alt}
                className="max-h-[85vh] w-auto rounded-lg object-contain"
              />
            ) : (
              <Image
                src={displayPhotos[lightboxIndex].fullSrc}
                alt={displayPhotos[lightboxIndex].alt}
                width={1200}
                height={800}
                className="max-h-[85vh] w-auto rounded-lg object-contain"
                priority
              />
            )}
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
            {lightboxIndex + 1} / {displayPhotos.length}
          </p>
        </div>
      )}
    </SectionWrapper>
  );
}
