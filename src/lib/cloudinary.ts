import "server-only";
import { v2 as cloudinary } from "cloudinary";
import { CLOUDINARY_CLOUD_NAME } from "./cloudinary-url";

// The CLOUDINARY_URL env var (cloudinary://api_key:api_secret@cloud_name)
// is auto-detected by the SDK on import. No explicit config() needed.
//
// This module imports the cloudinary Node SDK, which uses fs/path and
// therefore cannot be loaded in the browser. The `server-only` import
// above turns any client-side import into a build-time error so we
// can't accidentally regress.

function requireServerCreds(): { apiKey: string; apiSecret: string } {
  const config = cloudinary.config();
  if (!config.api_key || !config.api_secret) {
    throw new Error(
      "Cloudinary credentials missing. Set CLOUDINARY_URL in your environment.",
    );
  }
  return { apiKey: config.api_key, apiSecret: config.api_secret };
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
