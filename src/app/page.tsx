import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Hero } from "@/components/sections/Hero";
import { OurStory } from "@/components/sections/OurStory";
import { EventDetails } from "@/components/sections/EventDetails";
import { RsvpForm } from "@/components/sections/RsvpForm";
import { PhotoGallery, type GalleryPhoto } from "@/components/sections/PhotoGallery";
import { Registry } from "@/components/sections/Registry";
import { Faq } from "@/components/sections/Faq";
import { Accommodation } from "@/components/sections/Accommodation";
import { createAdminClient } from "@/lib/supabase/admin";
import { cloudinaryUrl } from "@/lib/cloudinary-url";

// Cache the page output for a minute. Photo uploads are infrequent and
// guests reload often during the wedding week — caching keeps Supabase
// load low while still picking up new uploads within ~60s.
export const revalidate = 60;

const HOMEPAGE_PHOTO_LIMIT = 6;

async function fetchHomepagePhotos(): Promise<GalleryPhoto[]> {
  const supabase = createAdminClient();

  // Pull the most recent photos from any published album. Random would
  // also work but "recent" gives a sensible preview as the admin uploads
  // more content over time. Falls back to [] (PhotoGallery uses its
  // hardcoded set) if no albums are published yet.
  const { data, error } = await supabase
    .from("jiejoy_photos")
    .select("id, cloudinary_public_id, caption, jiejoy_albums!inner(is_published)")
    .eq("jiejoy_albums.is_published", true)
    .order("created_at", { ascending: false })
    .limit(HOMEPAGE_PHOTO_LIMIT);

  if (error || !data) return [];

  return data.map((row) => ({
    key: row.id,
    src: cloudinaryUrl(row.cloudinary_public_id, "thumb"),
    fullSrc: cloudinaryUrl(row.cloudinary_public_id, "lightbox"),
    alt: row.caption ?? "",
    isCloudinary: true,
  }));
}

export default async function HomePage() {
  const photos = await fetchHomepagePhotos();

  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <OurStory />
        <EventDetails />
        <RsvpForm />
        <PhotoGallery photos={photos} />
        <Registry />
        <Faq />
        <Accommodation />
      </main>
      <Footer />
    </>
  );
}
