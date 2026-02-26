import { Hotel, MapPin, ExternalLink } from "lucide-react";
import { WEDDING } from "@/lib/constants";
import { SectionWrapper } from "@/components/layout/SectionWrapper";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

export function Accommodation() {
  return (
    <SectionWrapper
      id="accommodation"
      title="Where to Stay"
      subtitle="Recommended accommodations near the venue"
    >
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {WEDDING.hotels.map((hotel) => (
          <Card key={hotel.name} hover className="animate-on-scroll">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-dusty-rose/10">
              <Hotel size={24} className="text-dusty-rose" />
            </div>
            <h3 className="mt-4 font-serif text-xl font-bold">{hotel.name}</h3>
            <div className="mt-3 space-y-1.5">
              <p className="flex items-center gap-1.5 text-sm text-warm-gray">
                <MapPin size={14} className="text-sage" />
                {hotel.distance}
              </p>
              <p className="text-sm font-semibold text-sage">{hotel.price}</p>
            </div>
            {hotel.note && (
              <p className="mt-3 text-sm italic text-warm-gray">{hotel.note}</p>
            )}
            <a href={hotel.url} target="_blank" rel="noopener noreferrer" className="mt-4 inline-block">
              <Button variant="secondary" size="sm">
                Book Now <ExternalLink size={14} className="ml-1" />
              </Button>
            </a>
          </Card>
        ))}
      </div>
    </SectionWrapper>
  );
}
