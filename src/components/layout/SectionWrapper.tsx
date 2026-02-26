"use client";

import { useEffect, useRef } from "react";
import { Container } from "@/components/ui/Container";

interface SectionWrapperProps {
  id: string;
  title?: string;
  subtitle?: string;
  className?: string;
  children: React.ReactNode;
  dark?: boolean;
}

export function SectionWrapper({
  id,
  title,
  subtitle,
  className = "",
  children,
  dark = false,
}: SectionWrapperProps) {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.querySelectorAll(".animate-on-scroll").forEach((child) => {
              child.classList.add("is-visible");
            });
          }
        });
      },
      { threshold: 0.1 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <section
      ref={sectionRef}
      id={id}
      className={`py-20 md:py-28 ${dark ? "bg-charcoal text-white" : ""} ${className}`}
    >
      <Container>
        {(title || subtitle) && (
          <div className="mb-12 text-center animate-on-scroll md:mb-16">
            {title && (
              <h2 className="font-serif text-3xl font-bold md:text-4xl lg:text-5xl">
                {title}
              </h2>
            )}
            {subtitle && (
              <p className={`mt-4 text-lg ${dark ? "text-white/70" : "text-warm-gray"}`}>
                {subtitle}
              </p>
            )}
            <div className="mx-auto mt-6 h-px w-16 bg-gold" />
          </div>
        )}
        {children}
      </Container>
    </section>
  );
}
