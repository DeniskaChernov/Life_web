import { auth } from "@/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const isAuthed = !!req.auth;

  if (pathname.startsWith("/login") || pathname.startsWith("/register")) {
    if (isAuthed) return NextResponse.redirect(new URL("/life", req.url));
    return NextResponse.next();
  }

  if (
    pathname.startsWith("/life") ||
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/financial") ||
    pathname.startsWith("/onboarding") ||
    pathname.startsWith("/settings")
  ) {
    if (!isAuthed) return NextResponse.redirect(new URL("/login", req.url));
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/life",
    "/life/:path*",
    "/dashboard",
    "/dashboard/:path*",
    "/financial",
    "/financial/:path*",
    "/onboarding",
    "/settings",
    "/settings/:path*",
    "/login",
    "/register",
  ],
};
