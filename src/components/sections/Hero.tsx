"use client";

import { useRef, useState, useEffect } from "react";
import Image from "next/image";
import { WEDDING } from "@/lib/constants";
import { Button } from "@/components/ui/Button";
import { ChevronDown } from "lucide-react";
import { useParallax } from "@/hooks/useParallax";

const WEDDING_DATE = new Date("2026-09-26T09:00:00+08:00");

function getTimeLeft() {
  const diff = WEDDING_DATE.getTime() - Date.now();
  if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0, done: true };
  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((diff / (1000 * 60)) % 60),
    seconds: Math.floor((diff / 1000) % 60),
    done: false,
  };
}

export function Hero() {
  const bgRef = useRef<HTMLDivElement>(null);
  const fgRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [timeLeft, setTimeLeft] = useState(getTimeLeft);

  useParallax([
    { ref: bgRef, speed: 0.15 },
    { ref: fgRef, speed: 0.3 },
    { ref: contentRef, speed: 0.4, opacityFade: true },
  ]);

  useEffect(() => {
    const timer = setInterval(() => setTimeLeft(getTimeLeft()), 1000);
    return () => clearInterval(timer);
  }, []);

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

        {/* Countdown timer */}
        <div className="mt-8 animate-scale-fade-in" style={{ animationDelay: "1s" }}>
          {timeLeft.done ? (
            <p className="text-lg tracking-widest" style={{ color: "#C9A96E" }}>
              The celebration has begun!
            </p>
          ) : (
            <div className="flex items-center justify-center gap-2 sm:gap-3">
              {([
                ["days", timeLeft.days],
                ["hours", timeLeft.hours],
                ["minutes", timeLeft.minutes],
                ["seconds", timeLeft.seconds],
              ] as const).map(([label, value], i) => (
                <div key={label} className="flex items-center gap-2 sm:gap-3">
                  {i > 0 && (
                    <span className="text-xl font-light sm:text-2xl" style={{ color: "#C9A96E" }}>:</span>
                  )}
                  <div
                    className="flex flex-col items-center rounded-lg px-3 py-2 sm:px-4 sm:py-3 min-w-[56px] sm:min-w-[68px]"
                    style={{ backgroundColor: "rgba(255,255,255,0.1)", backdropFilter: "blur(8px)" }}
                  >
                    <span className="font-serif text-2xl font-bold tabular-nums sm:text-3xl">
                      {String(value).padStart(2, "0")}
                    </span>
                    <span
                      className="text-[9px] font-semibold tracking-[0.2em] uppercase sm:text-[10px]"
                      style={{ color: "#C9A96E" }}
                    >
                      {label}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="mt-8 animate-scale-fade-in" style={{ animationDelay: "1.3s" }}>
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
