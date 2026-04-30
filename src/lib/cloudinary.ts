import { v2 as cloudinary } from "cloudinary";

// The CLOUDINARY_URL env var (cloudinary://api_key:api_secret@cloud_name)
// is auto-detected by the SDK on import. No explicit config() needed.

export const CLOUDINARY_FOLDER_ROOT = "jiejoy-wedding/albums";
export const CLOUDINARY_CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME!;

function requireServerCreds(): { apiKey: string; apiSecret: string } {
  const config = cloudinary.config();
  if (!config.api_key || !config.api_secret) {
    throw new Error(
      "Cloudinary credentials missing. Set CLOUDINARY_URL in your environment.",
    );
  }
  return { apiKey: config.api_key, apiSecret: config.api_secret };
}

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

export type UploadSignature = {
  signature: string;
  timestamp: number;
  apiKey: string;
  cloudName: string;
  folder: string;
};

/**
 * Mints a short-lived signature so the browser can POST a file directly
 * to Cloudinary without our API secret leaving the server.
 *
 * Whatever fields end up in `paramsToSign` here MUST match the fields
 * the browser sends to Cloudinary; otherwise Cloudinary rejects the
 * upload with "Invalid signature".
 */
export function signUpload(folder: string): UploadSignature {
  const { apiKey, apiSecret } = requireServerCreds();
  const timestamp = Math.round(Date.now() / 1000);
  const signature = cloudinary.utils.api_sign_request(
    { timestamp, folder },
    apiSecret,
  );

  return {
    signature,
    timestamp,
    apiKey,
    cloudName: CLOUDINARY_CLOUD_NAME,
    folder,
  };
}

/**
 * Server-side delete — used when admin removes a photo and we want
 * to free Cloudinary storage too (not just the DB row).
 */
export async function deleteFromCloudinary(publicId: string): Promise<void> {
  await cloudinary.uploader.destroy(publicId, { invalidate: true });
}

export { cloudinary };
