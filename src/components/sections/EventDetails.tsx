import { MapPin, Clock, Calendar, Shirt } from "lucide-react";
import { WEDDING } from "@/lib/constants";
import { SectionWrapper } from "@/components/layout/SectionWrapper";
import { Card } from "@/components/ui/Card";

interface EventCardProps {
  title: string;
  venue: string;
  address: string;
  time: string;
  mapUrl: string;
}

function EventCard({ title, venue, address, time, mapUrl }: EventCardProps) {
  return (
    <Card hover className="animate-on-scroll text-center">
      <h3 className="font-serif text-2xl font-bold text-charcoal">{title}</h3>
      <div className="mx-auto mt-4 h-px w-12 bg-gold" />

      <div className="mt-6 space-y-4">
        <div className="flex items-center justify-center gap-2 text-warm-gray">
          <Calendar size={18} className="text-sage" />
          <span>{WEDDING.date}</span>
        </div>
        <div className="flex items-center justify-center gap-2 text-warm-gray">
          <Clock size={18} className="text-sage" />
          <span>{time}</span>
        </div>
        <div className="flex items-start justify-center gap-2 text-warm-gray">
          <MapPin size={18} className="mt-0.5 shrink-0 text-sage" />
          <div>
            <p className="font-semibold text-charcoal">{venue}</p>
            <p className="text-sm">{address}</p>
          </div>
        </div>
      </div>

      <a
        href={mapUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-6 inline-flex items-center gap-1 text-sm font-semibold text-sage hover:text-sage-dark transition-colors"
      >
        <MapPin size={14} />
        View on Map
      </a>
    </Card>
  );
}

export function EventDetails() {
  return (
    <SectionWrapper
      id="details"
      title="Wedding Details"
      subtitle="Everything you need to know about the big day"
    >
      <div className="grid gap-8 md:grid-cols-2">
        <EventCard
          title="Ceremony"
          venue={WEDDING.ceremony.name}
          address={WEDDING.ceremony.address}
          time={WEDDING.ceremony.time}
          mapUrl={WEDDING.ceremony.mapUrl}
        />
        <EventCard
          title="Reception"
          venue={WEDDING.reception.name}
          address={WEDDING.reception.address}
          time={WEDDING.reception.time}
          mapUrl={WEDDING.reception.mapUrl}
        />
      </div>

      {/* Dress code note */}
      <div className="mt-12 text-center animate-on-scroll">
        <Card className="inline-flex items-center gap-3 px-8 py-4">
          <Shirt size={20} className="text-gold" />
          <p className="text-warm-gray">
            <span className="font-semibold text-charcoal">Dress Code:</span>{" "}
            {WEDDING.dressCode}
          </p>
        </Card>
      </div>
    </SectionWrapper>
  );
}
