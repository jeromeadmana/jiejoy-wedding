import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import bcrypt from "bcryptjs";
import { SignJWT } from "jose";

// Dummy hash to compare against when user is not found (prevents timing attacks)
const DUMMY_HASH = "$2b$10$abcdefghijklmnopqrstuuABCDEFGHIJKLMNOPQRSTUVWXYZ012";
const secret = new TextEncoder().encode(process.env.ADMIN_JWT_SECRET);

export async function POST(req: NextRequest) {
  try {
    const { username, password } = await req.json();

    if (!username || !password) {
      return NextResponse.json(
        { error: "Username and password required" },
        { status: 400 }
      );
    }

    const supabase = createAdminClient();
    const { data: admin } = await supabase
      .from("jiejoy_admin_users")
      .select("*")
      .eq("username", username)
      .single();

    // Always run bcrypt.compare to prevent timing attacks
    const passwordValid = await bcrypt.compare(
      password,
      admin?.password_hash || DUMMY_HASH
    );

    if (!admin || !passwordValid) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    // Sign JWT
    const token = await new SignJWT({ sub: admin.id, username: admin.username })
      .setProtectedHeader({ alg: "HS256" })
      .setExpirationTime("24h")
      .sign(secret);

    // Set httpOnly cookie
    const response = NextResponse.json({ success: true });
    response.cookies.set("admin_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24, // 24 hours
      path: "/",
    });

    return response;
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
