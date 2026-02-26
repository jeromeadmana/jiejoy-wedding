import { WEDDING } from "@/lib/constants";

export function Footer() {
  return (
    <footer className="bg-dark-bg py-12 text-center text-white">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <p className="font-serif text-2xl font-bold">
          {WEDDING.couple.partner1} & {WEDDING.couple.partner2}
        </p>
        <p className="mt-2 text-sm text-white/60">{WEDDING.date}</p>
        <p className="mt-4 text-gold font-semibold">{WEDDING.hashtag}</p>
        <div className="mx-auto mt-6 h-px w-16 bg-white/20" />
        <p className="mt-6 text-xs text-white/40">
          Made with love
        </p>
      </div>
    </footer>
  );
}
