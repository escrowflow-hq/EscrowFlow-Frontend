import { NextRequest, NextResponse } from "next/server";

const LOGGED_OUT_ONLY_ROUTES = ["/app/login", "/app/signup", "/app/register"];
const PUBLIC_APP_ROUTES = [...LOGGED_OUT_ONLY_ROUTES, "/app/onboarding", "/app/forgot-password"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isAuthenticated = Boolean(request.cookies.get("token")?.value);

  if (isAuthenticated && LOGGED_OUT_ONLY_ROUTES.includes(pathname)) {
    return NextResponse.redirect(new URL("/app", request.url));
  }

  if (!isAuthenticated && !PUBLIC_APP_ROUTES.includes(pathname)) {
    return NextResponse.redirect(new URL("/app/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/app/:path*"],
};
