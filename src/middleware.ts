import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Better Auth session cookie names (standard or secure in production)
  const sessionToken =
    request.cookies.get("better-auth.session_token")?.value ||
    request.cookies.get("__Secure-better-auth.session_token")?.value;

  const isAuthRoute = pathname.startsWith("/sign-in") || pathname.startsWith("/sign-up");
  const isProtectedRoute = pathname.startsWith("/dashboard") || pathname.startsWith("/payment");

  // If user is unauthenticated and visits protected routes -> redirect to /sign-in
  if (isProtectedRoute && !sessionToken) {
    const signInUrl = new URL("/sign-in", request.url);
    signInUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(signInUrl);
  }

  // If user is already authenticated and visits sign-in / sign-up -> redirect to dashboard
  if (isAuthRoute && sessionToken) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/payment/:path*",
    "/sign-in",
    "/sign-up",
  ],
};
