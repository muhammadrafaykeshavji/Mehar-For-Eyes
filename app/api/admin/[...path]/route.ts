import { type NextRequest, NextResponse } from "next/server";

const apiOrigin = (
  process.env.API_URL ??
  process.env.NEXT_PUBLIC_API_URL ??
  "http://localhost:8080"
).replace(/\/$/, "");

function extractTokenFromSetCookie(setCookieHeader: string | null): string | null {
  if (!setCookieHeader) return null;
  const match = setCookieHeader.match(/admin_session=([^;,\s]+)/);
  return match?.[1] ? match[1] : null;
}

async function handleAdminProxy(
  request: NextRequest,
  context: { params: Promise<{ path: string[] }> },
) {
  const { path } = await context.params;
  const subPath = path.join("/");
  const targetUrl = `${apiOrigin}/api/admin/${subPath}${request.nextUrl.search}`;

  const headers = new Headers();
  const contentType = request.headers.get("content-type");
  if (contentType) {
    headers.set("content-type", contentType);
  }

  // Always forward the canonical origin expected by the Go backend CSRF check
  headers.set("origin", "http://localhost:3000");

  // Support both standard HTTP-only cookies and IDE built-in browser token header
  const cookieSingle = request.cookies.get("admin_session")?.value;
  const headerToken = request.headers.get("x-admin-session")?.trim();
  const activeToken = cookieSingle || headerToken;

  if (activeToken) {
    headers.set("cookie", `admin_session=${activeToken}`);
  } else {
    const rawCookie = request.headers.get("cookie");
    if (rawCookie) {
      headers.set("cookie", rawCookie);
    }
  }

  const method = request.method.toUpperCase();
  const hasBody = method !== "GET" && method !== "HEAD";
  const bodyBuffer = hasBody ? await request.arrayBuffer() : undefined;

  try {
    const upstreamRes = await fetch(targetUrl, {
      method,
      headers,
      body: bodyBuffer,
      cache: "no-store",
    });

    const responseText = await upstreamRes.text();
    const setCookie = upstreamRes.headers.get("set-cookie");

    // On login success, also return the session token in JSON so IDE webview iframes work
    if (subPath === "login" && upstreamRes.ok) {
      const token = extractTokenFromSetCookie(setCookie);
      const res = NextResponse.json(
        { status: "ok", token: token ?? "" },
        { status: upstreamRes.status },
      );
      if (setCookie) {
        res.headers.set("set-cookie", setCookie);
      }
      return res;
    }

    const res = new NextResponse(responseText, {
      status: upstreamRes.status,
      headers: {
        "content-type":
          upstreamRes.headers.get("content-type") ?? "application/json",
      },
    });
    if (setCookie) {
      res.headers.set("set-cookie", setCookie);
    }
    return res;
  } catch {
    return NextResponse.json(
      { error: "Backend server is unreachable on port 8080." },
      { status: 502 },
    );
  }
}

export const GET = handleAdminProxy;
export const POST = handleAdminProxy;
export const PUT = handleAdminProxy;
export const PATCH = handleAdminProxy;
export const DELETE = handleAdminProxy;

