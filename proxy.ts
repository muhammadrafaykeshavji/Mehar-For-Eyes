import { NextRequest, NextResponse } from "next/server";

const apiOrigin = (
  process.env.API_URL ??
  process.env.NEXT_PUBLIC_API_URL ??
  "http://localhost:8080"
).replace(/\/$/, "");

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (!pathname.startsWith("/admin")) {
    return NextResponse.next();
  }

  const isLoginPage = pathname === "/admin/login";
  const sessionCookie = request.cookies.get("admin_session")?.value;

  // When running inside VS Code / Antigravity's built-in browser iframe,
  // Chromium blocks third-party HTTP cookies. Let AdminShell verify the session
  // on the client via /api/admin/me using the X-Admin-Session header fallback.
  if (!sessionCookie) {
    return NextResponse.next();
  }

  try {
    const res = await fetch(`${apiOrigin}/api/admin/me`, {
      method: "GET",
      headers: {
        cookie: `admin_session=${sessionCookie}`,
      },
      cache: "no-store",
    });

    if (res.ok) {
      if (isLoginPage) {
        return NextResponse.redirect(new URL("/admin", request.url));
      }
      return NextResponse.next();
    }
  } catch {
    // Fall through if backend session probe fails.
  }

  if (isLoginPage) {
    return NextResponse.next();
  }

  const response = NextResponse.redirect(new URL("/admin/login", request.url));
  response.cookies.delete("admin_session");
  return response;
}

export const config = {
  matcher: ["/admin/:path*"],
};
