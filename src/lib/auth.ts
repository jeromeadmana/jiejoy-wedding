import { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const secret = new TextEncoder().encode(process.env.ADMIN_JWT_SECRET || "dev-secret");

export async function verifyAdmin(req: NextRequest): Promise<boolean> {
  // Check Authorization header first
  const auth = req.headers.get("authorization");
  if (auth?.startsWith("Bearer ")) {
    try {
      await jwtVerify(auth.slice(7), secret);
      return true;
    } catch {
      // Fall through to cookie check
    }
  }

  // Check httpOnly cookie
  const cookie = req.cookies.get("admin_token")?.value;
  if (cookie) {
    try {
      await jwtVerify(cookie, secret);
      return true;
    } catch {
      return false;
    }
  }

  return false;
}
