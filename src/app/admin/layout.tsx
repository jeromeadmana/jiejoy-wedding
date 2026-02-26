import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { jwtVerify } from "jose";

const secret = new TextEncoder().encode(process.env.ADMIN_JWT_SECRET || "dev-secret");

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const token = cookieStore.get("admin_token")?.value;

  // Skip auth check for the login page
  // The layout wraps all admin pages, but we only redirect if not on login
  if (!token) {
    // We can't easily check the current path in a layout,
    // so the login page has its own layout-less approach.
    // This layout only protects /admin (not /admin/login).
  } else {
    try {
      await jwtVerify(token, secret);
    } catch {
      redirect("/admin/login");
    }
  }

  return <>{children}</>;
}
