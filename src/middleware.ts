import { NextRequest, NextResponse } from "next/server";

const publicPaths = ["/", "/login", "/forgot-password", "/reset-password"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (publicPaths.includes(pathname)) {
    return NextResponse.next();
  }

  const token = request.cookies.get("lms_session")?.value || request.cookies.get("next-auth.session-token")?.value || request.cookies.get("__Secure-next-auth.session-token")?.value;
  if (!token) {
    const loginUrl = new URL("/login", request.url);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/patients/:path*",
    "/orders/:path*",
    "/samples/:path*",
    "/results/:path*",
    "/reports/:path*",
    "/inventory/:path*",
    "/audit/:path*",
    "/users/:path*",
    "/tests/:path*",
  ],
};
