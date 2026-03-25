import { NextRequest, NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  // Allow auth API and static assets through
  if (
    request.nextUrl.pathname.startsWith("/api/auth") ||
    request.nextUrl.pathname.startsWith("/_next") ||
    request.nextUrl.pathname === "/favicon.ico"
  ) {
    return NextResponse.next();
  }

  const authCookie = request.cookies.get("auth");
  const password = process.env.DASHBOARD_PASSWORD;

  if (!password || authCookie?.value === password) {
    return NextResponse.next();
  }

  // For API routes, return 401
  if (request.nextUrl.pathname.startsWith("/api/")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // For page requests, rewrite to login page
  return NextResponse.rewrite(new URL("/login", request.url));
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
