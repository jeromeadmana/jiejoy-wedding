"use client";

import { useEffect, useRef, useCallback } from "react";

interface ParallaxLayer {
  ref: React.RefObject<HTMLElement | null>;
  speed: number;
  opacityFade?: boolean;
}

export function useParallax(layers: ParallaxLayer[]) {
  const ticking = useRef(false);

  const update = useCallback(() => {
    const scrollY = window.scrollY;
    const viewportH = window.innerHeight;

    for (const layer of layers) {
      const el = layer.ref.current;
      if (!el) continue;

      const yOffset = scrollY * layer.speed;
      el.style.transform = `translate3d(0, ${yOffset}px, 0)`;

      if (layer.opacityFade) {
        const opacity = Math.max(0, 1 - scrollY / (viewportH * 0.6));
        el.style.opacity = String(opacity);
      }
    }
    ticking.current = false;
  }, [layers]);

  useEffect(() => {
    const prefersReduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    const isMobile = window.innerWidth < 768;
    if (prefersReduced || isMobile) return;

    const onScroll = () => {
      if (!ticking.current) {
        ticking.current = true;
        requestAnimationFrame(update);
      }
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [update]);
}
