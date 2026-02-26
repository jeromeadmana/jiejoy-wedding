import { WEDDING } from "@/lib/constants";

export function Footer() {
  return (
    <footer
      className="py-12 text-center text-white"
      style={{ backgroundColor: "var(--color-dark-bg, #2C2C2C)" }}
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <p className="font-serif text-2xl font-bold">
          {WEDDING.couple.partner1} & {WEDDING.couple.partner2}
        </p>
        <p className="mt-2 text-sm text-white/70">{WEDDING.date}</p>
        <p className="mt-4 text-gold font-semibold">{WEDDING.hashtag}</p>
        <div className="mx-auto mt-6 h-px w-16 bg-white/30" />
        <p className="mt-6 text-xs text-white/50">
          Made with love
        </p>
      </div>
    </footer>
  );
}
