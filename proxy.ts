import { NextRequest, NextResponse } from "next/server";

export function proxy(request: NextRequest) {
  const token = request.cookies.get("fotball-token")?.value;
  const nextAuthToken = request.cookies.get("authjs.session-token")?.value || 
                        request.cookies.get("__Secure-authjs.session-token")?.value;
  
  const isAuthenticated = !!token || !!nextAuthToken;
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/dashboard") && !isAuthenticated) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if ((pathname === "/login" || pathname === "/registrer") && isAuthenticated) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/login", "/registrer"],
};
