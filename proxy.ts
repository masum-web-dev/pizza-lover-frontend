import { NextRequest, NextResponse } from "next/server";

const ROLE_DASHBOARD_MAP: Record<string, string> = {
  admin: "/dashboard/admin",
  vendor: "/dashboard/vendor",
  user: "/dashboard/user",
  customer: "/dashboard/user",
};

function hasSessionCookie(req: NextRequest): boolean {
  return req.cookies.getAll().some((cookie) => {
    const name = cookie.name.toLowerCase();
    return (
      name.includes("better-auth") ||
      name.includes("session_token") ||
      name.includes("session")
    );
  });
}

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (!pathname.startsWith("/dashboard")) {
    return NextResponse.next();
  }

  if (!hasSessionCookie(req)) {
    return NextResponse.redirect(new URL("/sign-in", req.url));
  }

  const authUrl = process.env.BETTER_AUTH_URL || req.nextUrl.origin;

  try {
    const sessionRes = await fetch(`${authUrl}/api/auth/get-session`, {
      method: "GET",
      headers: {
        cookie: req.headers.get("cookie") || "",
      },
      cache: "no-store",
    });

    if (!sessionRes.ok) {
      return NextResponse.redirect(new URL("/sign-in", req.url));
    }

    const sessionData = await sessionRes.json();
    const rawRole = sessionData?.user?.role ?? sessionData?.data?.user?.role;

    if (!rawRole) {
      return NextResponse.redirect(new URL("/sign-in", req.url));
    }

    const role = String(rawRole).toLowerCase();
    const allowedDashboard = ROLE_DASHBOARD_MAP[role] || "/dashboard/user";

    if (pathname === "/dashboard" || pathname === "/dashboard/") {
      return NextResponse.redirect(new URL(allowedDashboard, req.url));
    }

    if (!pathname.startsWith(allowedDashboard)) {
      return NextResponse.redirect(new URL(allowedDashboard, req.url));
    }

    return NextResponse.next();
  } catch {
    return NextResponse.redirect(new URL("/sign-in", req.url));
  }
}

export const config = {
  matcher: ["/dashboard/:path*"],
};