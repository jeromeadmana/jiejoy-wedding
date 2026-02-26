import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Hero } from "@/components/sections/Hero";
import { OurStory } from "@/components/sections/OurStory";
import { EventDetails } from "@/components/sections/EventDetails";
import { RsvpForm } from "@/components/sections/RsvpForm";
import { PhotoGallery } from "@/components/sections/PhotoGallery";
import { Registry } from "@/components/sections/Registry";
import { Faq } from "@/components/sections/Faq";
import { Accommodation } from "@/components/sections/Accommodation";

export default function HomePage() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <OurStory />
        <EventDetails />
        <RsvpForm />
        <PhotoGallery />
        <Registry />
        <Faq />
        <Accommodation />
      </main>
      <Footer />
    </>
  );
}
