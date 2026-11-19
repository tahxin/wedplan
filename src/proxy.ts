import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

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

  // If user is already authenticated and visits sign-in / sign-up without an explicit callbackUrl -> redirect to dashboard
  if (isAuthRoute && sessionToken && !request.nextUrl.searchParams.has("callbackUrl")) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const middleware = proxy;

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/payment/:path*",
    "/sign-in",
    "/sign-up",
  ],
};
