// Browser-safe Cloudinary URL helpers. Must NOT import the `cloudinary`
// Node SDK — that pulls fs/path into client bundles and breaks Turbopack
// builds. All server-only operations (signing, deletion) live in
// `./cloudinary.ts` which is marked `server-only`.

export const CLOUDINARY_FOLDER_ROOT = "jiejoy-wedding/albums";
export const CLOUDINARY_CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME!;

export type ImageVariant = "thumb" | "lightbox" | "hero" | "card";

const TRANSFORMS: Record<ImageVariant, string> = {
  thumb:    "f_auto,q_auto,c_fill,w_600,h_600,g_auto",
  card:     "f_auto,q_auto,c_fill,w_800,h_500,g_auto",
  lightbox: "f_auto,q_auto,w_1600",
  hero:     "f_auto,q_auto,c_fill,w_2400,h_1200,g_auto",
};

/**
 * Returns a Cloudinary delivery URL for the given public_id and variant.
 * We never serve originals — every URL goes through f_auto/q_auto so
 * the free-tier 25 GB/mo bandwidth budget stays survivable.
 */
export function cloudinaryUrl(publicId: string, variant: ImageVariant = "lightbox"): string {
  return `https://res.cloudinary.com/${CLOUDINARY_CLOUD_NAME}/image/upload/${TRANSFORMS[variant]}/${publicId}`;
}

/**
 * Builds the folder path for a given album slug.
 */
export function albumFolder(slug: string): string {
  return `${CLOUDINARY_FOLDER_ROOT}/${slug}`;
}
