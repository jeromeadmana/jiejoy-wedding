"use client";

import { useState, useEffect } from "react";
import { Menu, X, Sun, Moon } from "lucide-react";
import { NAV_LINKS, WEDDING } from "@/lib/constants";

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dark, setDark] = useState(false);

  useEffect(() => {
    setDark(document.documentElement.classList.contains("dark"));
  }, []);

  const toggleDark = () => {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("theme", next ? "dark" : "light");
  };

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
  }, [mobileOpen]);

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 flex justify-center transition-all duration-500">
        <div
          className={`flex items-center justify-between transition-all duration-500 ${
            scrolled
              ? "mt-3 mx-2 sm:mx-4 w-full max-w-4xl rounded-2xl sm:rounded-full px-6 py-2.5 bg-surface/70 glass-pill shadow-lg shadow-black/5 border border-white/10"
              : "w-full max-w-6xl px-4 py-4 sm:px-6 bg-transparent"
          }`}
        >
          {/* Logo */}
          <a
            href="#"
            className={`font-serif font-bold transition-all duration-500 ${
              scrolled
                ? "text-lg text-charcoal"
                : "text-2xl text-white"
            }`}
          >
            {WEDDING.couple.partner1} & {WEDDING.couple.partner2}
          </a>

          {/* Desktop nav */}
          <ul className="hidden items-center gap-6 md:flex">
            {NAV_LINKS.map((link) => (
              <li key={link.href}>
                <a
                  href={link.href}
                  className={`font-semibold tracking-wide uppercase transition-all duration-300 hover:text-gold ${
                    scrolled
                      ? "text-xs text-charcoal"
                      : "text-sm text-white"
                  }`}
                >
                  {link.label}
                </a>
              </li>
            ))}
            <li>
              <button
                onClick={toggleDark}
                className={`transition-colors cursor-pointer ${
                  scrolled ? "text-charcoal" : "text-white"
                }`}
                aria-label="Toggle dark mode"
              >
                {dark ? <Sun size={16} /> : <Moon size={16} />}
              </button>
            </li>
          </ul>

          {/* Mobile buttons */}
          <div className="flex items-center gap-3 md:hidden">
            <button
              onClick={toggleDark}
              className={`transition-colors cursor-pointer ${
                scrolled ? "text-charcoal" : "text-white"
              }`}
              aria-label="Toggle dark mode"
            >
              {dark ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className={`transition-colors cursor-pointer ${
                scrolled ? "text-charcoal" : "text-white"
              }`}
              aria-label={mobileOpen ? "Close menu" : "Open menu"}
              aria-expanded={mobileOpen}
            >
              {mobileOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile menu — outside nav so it's an independent full-screen overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 bg-surface md:hidden">
          <div className="flex items-center justify-between px-4 py-4 sm:px-6">
            <span className="font-serif text-2xl font-bold text-charcoal">
              {WEDDING.couple.partner1} & {WEDDING.couple.partner2}
            </span>
            <button
              onClick={() => setMobileOpen(false)}
              className="text-charcoal cursor-pointer"
              aria-label="Close menu"
            >
              <X size={24} />
            </button>
          </div>
          <ul className="flex flex-col items-center gap-8 pt-16">
            {NAV_LINKS.map((link) => (
              <li key={link.href}>
                <a
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className="text-lg font-semibold tracking-wide uppercase text-charcoal transition-colors hover:text-sage"
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}
    </>
  );
}
