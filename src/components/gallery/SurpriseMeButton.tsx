"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Shuffle } from "lucide-react";

export function SurpriseMeButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleClick = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/gallery/random");
      const { photo } = await res.json();
      if (photo?.album_slug) {
        router.push(`/gallery/${photo.album_slug}`);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className="inline-flex items-center gap-2 rounded-full px-6 py-3 text-base font-semibold transition-all cursor-pointer disabled:opacity-50"
      style={{
        backgroundColor: "var(--color-surface, #FFFFFF)",
        color: "var(--color-charcoal, #2C2C2C)",
        border: "1px solid color-mix(in srgb, var(--color-warm-gray, #6B6B6B) 20%, transparent)",
      }}
    >
      <Shuffle size={16} />
      {loading ? "Picking..." : "Surprise me"}
    </button>
  );
}
