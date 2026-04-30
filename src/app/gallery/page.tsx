import Link from "next/link";
import { createAdminClient } from "@/lib/supabase/admin";
import { cloudinaryUrl } from "@/lib/cloudinary";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { SurpriseMeButton } from "@/components/gallery/SurpriseMeButton";
import { WEDDING } from "@/lib/constants";
import type { Album } from "@/lib/types/gallery";

export const dynamic = "force-dynamic";

type AlbumCard = Album & { photo_count: number };

async function fetchHeroAndAlbums(): Promise<{
  heroPublicId: string | null;
  albums: AlbumCard[];
}> {
  const supabase = createAdminClient();

  // Pull all published albums with a count, plus pick a random photo for the hero.
  const [albumsRes, heroRes] = await Promise.all([
    supabase
      .from("jiejoy_albums")
      .select("*, jiejoy_photos(count)")
      .eq("is_published", true)
      .order("sort_order", { ascending: true }),
    pickRandomHero(supabase),
  ]);

  const albums: AlbumCard[] = (albumsRes.data ?? [])
    .map((a) => ({
      ...a,
      photo_count: a.jiejoy_photos?.[0]?.count ?? 0,
      jiejoy_photos: undefined,
    }))
    .filter((a) => a.photo_count > 0);

  return { heroPublicId: heroRes, albums };
}

async function pickRandomHero(
  supabase: ReturnType<typeof createAdminClient>,
): Promise<string | null> {
  const { count } = await supabase
    .from("jiejoy_photos")
    .select("id, jiejoy_albums!inner(is_published)", { count: "exact", head: true })
    .eq("jiejoy_albums.is_published", true);

  if (!count) return null;

  const offset = Math.floor(Math.random() * count);
  const { data } = await supabase
    .from("jiejoy_photos")
    .select("cloudinary_public_id, jiejoy_albums!inner(is_published)")
    .eq("jiejoy_albums.is_published", true)
    .range(offset, offset);

  return data?.[0]?.cloudinary_public_id ?? null;
}

export default async function GalleryLanding() {
  const { heroPublicId, albums } = await fetchHeroAndAlbums();

  return (
    <>
      <Navbar />
      <main style={{ backgroundColor: "var(--color-cream, #FDF8F8)" }}>
        {/* Hero */}
        <section className="relative h-[70vh] min-h-[500px] w-full overflow-hidden">
          {heroPublicId ? (
            <>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={cloudinaryUrl(heroPublicId, "hero")}
                alt=""
                className="h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
            </>
          ) : (
            <div
              className="h-full w-full"
              style={{ backgroundColor: "color-mix(in srgb, var(--color-sage, #D4849A) 25%, var(--color-cream, #FDF8F8))" }}
            />
          )}

          <div className="absolute inset-0 flex flex-col items-center justify-end px-4 pb-12 sm:pb-16">
            <p className="font-serif text-sm uppercase tracking-[0.3em] text-white/80">
              {WEDDING.couple.partner1} &amp; {WEDDING.couple.partner2}
            </p>
            <h1 className="mt-2 text-center font-serif text-4xl font-bold text-white sm:text-6xl">
              The Gallery
            </h1>
            <p className="mt-3 max-w-xl text-center text-base text-white/85 sm:text-lg">
              Photographs from the day &mdash; and the chapters before it.
            </p>
            {albums.length > 0 && (
              <div className="mt-6">
                <SurpriseMeButton />
              </div>
            )}
          </div>
        </section>

        {/* Albums */}
        <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20">
          <h2
            className="mb-10 text-center font-serif text-3xl font-bold sm:text-4xl"
            style={{ color: "var(--color-charcoal, #2C2C2C)" }}
          >
            Albums
          </h2>

          {albums.length === 0 ? (
            <p
              className="text-center"
              style={{ color: "var(--color-warm-gray, #6B6B6B)" }}
            >
              Photos coming soon.
            </p>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {albums.map((album) => (
                <Link
                  key={album.id}
                  href={`/gallery/${album.slug}`}
                  className="group block overflow-hidden rounded-2xl shadow-sm transition-shadow hover:shadow-lg"
                  style={{ backgroundColor: "var(--color-surface, #FFFFFF)" }}
                >
                  <div
                    className="aspect-[4/3] overflow-hidden"
                    style={{
                      backgroundColor: "color-mix(in srgb, var(--color-warm-gray, #6B6B6B) 8%, transparent)",
                    }}
                  >
                    {album.cover_public_id && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={cloudinaryUrl(album.cover_public_id, "card")}
                        alt={album.title}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    )}
                  </div>
                  <div className="p-5">
                    <h3
                      className="font-serif text-xl font-bold"
                      style={{ color: "var(--color-charcoal, #2C2C2C)" }}
                    >
                      {album.title}
                    </h3>
                    {album.description && (
                      <p
                        className="mt-1 line-clamp-2 text-sm"
                        style={{ color: "var(--color-warm-gray, #6B6B6B)" }}
                      >
                        {album.description}
                      </p>
                    )}
                    <p
                      className="mt-3 text-xs uppercase tracking-wider"
                      style={{ color: "var(--color-warm-gray, #6B6B6B)" }}
                    >
                      {album.photo_count} {album.photo_count === 1 ? "photo" : "photos"}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>
      </main>
      <Footer />
    </>
  );
}
