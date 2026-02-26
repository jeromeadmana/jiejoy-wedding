import Image from "next/image";
import { WEDDING } from "@/lib/constants";
import { SectionWrapper } from "@/components/layout/SectionWrapper";

export function OurStory() {
  return (
    <SectionWrapper
      id="our-story"
      title="Our Story"
      subtitle="The journey that brought us together"
    >
      <div className="relative">
        {/* Vertical timeline line - desktop only */}
        <div className="absolute left-1/2 top-0 bottom-0 hidden w-px -translate-x-1/2 bg-gold/30 md:block" />

        <div className="space-y-12 md:space-y-20">
          {WEDDING.story.map((milestone, index) => (
            <div
              key={milestone.title}
              className="animate-on-scroll relative md:flex md:items-center md:gap-12"
            >
              {/* Timeline dot - desktop only */}
              <div className="absolute left-1/2 top-8 hidden h-4 w-4 -translate-x-1/2 rounded-full border-2 border-gold bg-cream md:block" />

              {/* Content - alternating sides */}
              <div
                className={`md:w-1/2 ${
                  index % 2 === 0 ? "md:text-right md:pr-12" : "md:ml-auto md:pl-12"
                }`}
              >
                <span className="text-sm font-semibold tracking-wider uppercase text-gold">
                  {milestone.date}
                </span>
                <h3 className="mt-2 font-serif text-2xl font-bold md:text-3xl">
                  {milestone.title}
                </h3>
                <p className="mt-3 leading-relaxed text-warm-gray">
                  {milestone.text}
                </p>

                {/* Image */}
                <div className="mt-6 overflow-hidden rounded-2xl">
                  <Image
                    src={milestone.image}
                    alt={milestone.title}
                    width={600}
                    height={400}
                    className="h-64 w-full object-cover transition-transform duration-500 hover:scale-105"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </SectionWrapper>
  );
}
