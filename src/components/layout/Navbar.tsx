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
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-surface/95 backdrop-blur-sm shadow-sm"
          : "bg-transparent"
      }`}
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
        {/* Logo */}
        <a
          href="#"
          className={`font-serif text-2xl font-bold transition-colors ${
            scrolled ? "text-charcoal" : "text-white"
          }`}
        >
          {WEDDING.couple.partner1} & {WEDDING.couple.partner2}
        </a>

        {/* Desktop nav */}
        <ul className="hidden items-center gap-8 md:flex">
          {NAV_LINKS.map((link) => (
            <li key={link.href}>
              <a
                href={link.href}
                className={`text-sm font-semibold tracking-wide uppercase transition-colors hover:text-sage ${
                  scrolled ? "text-charcoal" : "text-white"
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
              {dark ? <Sun size={18} /> : <Moon size={18} />}
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
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="fixed inset-0 top-0 z-40 bg-surface md:hidden">
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
    </nav>
  );
}
