"use client";

import { useState, useCallback } from "react";
import { Shuffle } from "lucide-react";
import { RowsPhotoAlbum } from "react-photo-album";
import "react-photo-album/rows.css";
import Lightbox from "yet-another-react-lightbox";
import Captions from "yet-another-react-lightbox/plugins/captions";
import "yet-another-react-lightbox/styles.css";
import "yet-another-react-lightbox/plugins/captions.css";
import { cloudinaryUrl } from "@/lib/cloudinary-url";
import type { Photo } from "@/lib/types/gallery";

type Props = {
  photos: Photo[];
};

export function AlbumViewer({ photos }: Props) {
  const [index, setIndex] = useState(-1);

  const slides = photos.map((p) => ({
    src: cloudinaryUrl(p.cloudinary_public_id, "lightbox"),
    width: p.width,
    height: p.height,
    alt: p.caption ?? "",
    title: p.caption ?? undefined,
  }));

  const gridPhotos = photos.map((p) => ({
    src: cloudinaryUrl(p.cloudinary_public_id, "thumb"),
    width: p.width,
    height: p.height,
    alt: p.caption ?? "",
    key: p.id,
  }));

  const surpriseMe = useCallback(() => {
    if (photos.length === 0) return;
    setIndex(Math.floor(Math.random() * photos.length));
  }, [photos.length]);

  return (
    <>
      <div className="mb-6 flex justify-end">
        <button
          onClick={surpriseMe}
          className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition-colors cursor-pointer"
          style={{
            backgroundColor: "var(--color-surface, #FFFFFF)",
            color: "var(--color-charcoal, #2C2C2C)",
            border: "1px solid color-mix(in srgb, var(--color-warm-gray, #6B6B6B) 20%, transparent)",
          }}
        >
          <Shuffle size={14} />
          Surprise me
        </button>
      </div>

      <RowsPhotoAlbum
        photos={gridPhotos}
        targetRowHeight={(containerWidth) =>
          containerWidth < 640 ? 200 : containerWidth < 1024 ? 260 : 320
        }
        spacing={12}
        onClick={({ index: i }) => setIndex(i)}
      />

      <Lightbox
        open={index >= 0}
        index={index}
        close={() => setIndex(-1)}
        slides={slides}
        plugins={[Captions]}
        captions={{ descriptionTextAlign: "center", showToggle: false }}
        carousel={{ finite: false, padding: "5%" }}
        controller={{ closeOnBackdropClick: true }}
        styles={{
          container: { backgroundColor: "rgba(20, 15, 12, 0.95)", backdropFilter: "blur(4px)" },
          captionsTitle: { color: "rgba(255, 255, 255, 0.9)", fontFamily: "serif" },
        }}
      />
    </>
  );
}
