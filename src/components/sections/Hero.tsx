"use client";

import { useRef } from "react";
import Image from "next/image";
import { WEDDING } from "@/lib/constants";
import { Button } from "@/components/ui/Button";
import { ChevronDown } from "lucide-react";
import { useParallax } from "@/hooks/useParallax";

export function Hero() {
  const bgRef = useRef<HTMLDivElement>(null);
  const fgRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useParallax([
    { ref: bgRef, speed: 0.15 },
    { ref: fgRef, speed: 0.3 },
    { ref: contentRef, speed: 0.4, opacityFade: true },
  ]);

  return (
    <section id="hero" className="relative flex min-h-screen items-center justify-center overflow-hidden bg-black">
      {/* Blurred background fill */}
      <div ref={bgRef} className="absolute inset-0 z-0 overflow-hidden will-change-transform">
        <Image
          src="/images/wedding.jpg"
          alt=""
          fill
          className="object-cover object-center scale-125 blur-3xl"
          priority
          quality={20}
          aria-hidden="true"
        />
      </div>
      {/* Sharp foreground image */}
      <div ref={fgRef} className="absolute inset-0 z-[1] will-change-transform">
        <Image
          src="/images/wedding.jpg"
          alt="Wedding"
          fill
          className="object-contain"
          priority
          quality={85}
        />
      </div>

      {/* Dark overlay */}
      <div className="absolute inset-0 z-[2] bg-black/40" />

      {/* Content — cinematic staggered text reveal */}
      <div ref={contentRef} className="relative z-10 text-center text-white px-4 will-change-transform">
        <div className="text-reveal-mask reveal-delay-0">
          <span className="mb-4 text-sm font-semibold tracking-[0.3em] uppercase block">
            {WEDDING.tagline}
          </span>
        </div>

        <h1 className="font-serif text-5xl font-bold leading-tight md:text-7xl lg:text-8xl">
          <span className="text-reveal-mask reveal-delay-1">
            <span>{WEDDING.couple.partner1}</span>
          </span>{" "}
          <span className="text-reveal-mask reveal-delay-2">
            <span className="text-gold animate-gold-shimmer">&</span>
          </span>{" "}
          <span className="text-reveal-mask reveal-delay-3">
            <span>{WEDDING.couple.partner2}</span>
          </span>
        </h1>

        <div className="text-reveal-mask reveal-delay-4 mt-6">
          <span className="text-lg tracking-widest text-white/80 md:text-xl block">
            {WEDDING.date}
          </span>
        </div>

        <div className="mt-10 animate-scale-fade-in" style={{ animationDelay: "1.1s" }}>
          <a href="#rsvp">
            <Button variant="accent" size="lg">
              RSVP Now
            </Button>
          </a>
        </div>
      </div>

      {/* Scroll indicator */}
      <a
        href="#our-story"
        className="absolute bottom-8 left-1/2 z-10 -translate-x-1/2 text-white/60 hover:text-white transition-colors animate-gentle-float"
        aria-label="Scroll down"
      >
        <ChevronDown size={32} />
      </a>
    </section>
  );
}
