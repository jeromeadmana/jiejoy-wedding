import Image from "next/image";
import { WEDDING } from "@/lib/constants";
import { Button } from "@/components/ui/Button";
import { ChevronDown } from "lucide-react";

export function Hero() {
  return (
    <section id="hero" className="relative flex min-h-screen items-center justify-center overflow-hidden bg-black">
      {/* Background image */}
      <Image
        src="/images/wedding.jpg"
        alt="Wedding"
        fill
        className="object-contain"
        priority
        quality={85}
      />

      {/* Dark overlay */}
      <div className="absolute inset-0 bg-black/40" />

      {/* Content */}
      <div className="relative z-10 text-center text-white px-4">
        <p className="mb-4 text-sm font-semibold tracking-[0.3em] uppercase animate-fade-in-up">
          {WEDDING.tagline}
        </p>
        <h1 className="font-serif text-5xl font-bold leading-tight md:text-7xl lg:text-8xl animate-fade-in-up">
          {WEDDING.couple.partner1}{" "}
          <span className="text-gold">&</span>{" "}
          {WEDDING.couple.partner2}
        </h1>
        <p className="mt-6 text-lg tracking-widest text-white/80 md:text-xl animate-fade-in-up delay-100">
          {WEDDING.date}
        </p>
        <div className="mt-10 animate-fade-in-up delay-200">
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
        className="absolute bottom-8 left-1/2 -translate-x-1/2 text-white/60 hover:text-white transition-colors animate-bounce"
        aria-label="Scroll down"
      >
        <ChevronDown size={32} />
      </a>
    </section>
  );
}
