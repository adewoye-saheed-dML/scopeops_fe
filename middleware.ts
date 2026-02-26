import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

const PROTECTED_ROUTES = ["/dashboard", "/projects", "/analytics", "/settings"];
const AUTH_ROUTES = ["/login", "/signup"];
const ACCESS_TOKEN_KEY = "access_token";

function isProtectedRoute(pathname: string) {
  return PROTECTED_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`),
  );
}

function isAuthRoute(pathname: string) {
  return AUTH_ROUTES.some((route) => pathname === route);
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get(ACCESS_TOKEN_KEY)?.value;
  const isAuthenticated = Boolean(token);

  if (isProtectedRoute(pathname) && !isAuthenticated) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (isAuthRoute(pathname) && isAuthenticated) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/projects/:path*", "/analytics/:path*", "/settings/:path*", "/login", "/signup"],
};
