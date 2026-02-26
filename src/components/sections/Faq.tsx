"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { WEDDING } from "@/lib/constants";
import { SectionWrapper } from "@/components/layout/SectionWrapper";

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="border-b border-warm-gray/10 animate-on-scroll">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between py-5 text-left cursor-pointer"
        aria-expanded={open}
      >
        <span className="font-semibold text-charcoal pr-4">{q}</span>
        <ChevronDown
          size={20}
          className={`shrink-0 text-sage transition-transform duration-300 ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>
      <div
        className={`overflow-hidden transition-all duration-300 ${
          open ? "max-h-96 pb-5" : "max-h-0"
        }`}
      >
        <p className="leading-relaxed text-warm-gray">{a}</p>
      </div>
    </div>
  );
}

export function Faq() {
  return (
    <SectionWrapper
      id="faq"
      title="Questions & Answers"
      subtitle="Everything you might want to know"
    >
      <div className="mx-auto max-w-3xl">
        {WEDDING.faq.map((item) => (
          <FaqItem key={item.q} q={item.q} a={item.a} />
        ))}
      </div>
    </SectionWrapper>
  );
}
