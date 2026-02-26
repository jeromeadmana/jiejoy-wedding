import { Gift, ExternalLink } from "lucide-react";
import { WEDDING } from "@/lib/constants";
import { SectionWrapper } from "@/components/layout/SectionWrapper";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

export function Registry() {
  return (
    <SectionWrapper
      id="registry"
      title="Gift Registry"
      subtitle="Your presence is the greatest gift of all"
    >
      <p className="mx-auto mb-10 max-w-2xl text-center text-warm-gray animate-on-scroll">
        We are so grateful to have you celebrate with us. If you wish to honor
        us with a gift, we have registered at the following stores.
      </p>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {WEDDING.registry.map((item) => (
          <Card key={item.store} hover className="animate-on-scroll text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-sage/10">
              <Gift size={28} className="text-sage" />
            </div>
            <h3 className="mt-4 font-serif text-xl font-bold">{item.store}</h3>
            <a href={item.url} target="_blank" rel="noopener noreferrer" className="mt-4 inline-block">
              <Button variant="secondary" size="sm">
                View Registry <ExternalLink size={14} className="ml-1" />
              </Button>
            </a>
          </Card>
        ))}
      </div>
    </SectionWrapper>
  );
}
