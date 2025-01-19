import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(req: NextRequest) {
  const url = req.nextUrl.clone();
  const { pathname } = url;

  const supabase = createMiddlewareClient({ req, res: NextResponse.next() });

  // Verify the user session with Supabase
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  // Allow requests to root without restriction
  if (pathname === "/") {
    return NextResponse.next();
  }

  if (error || !user) {
    url.pathname = "/";
    return NextResponse.redirect(url);
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  // If we're on the account page, allow access regardless
  if (pathname.startsWith("/account")) {
    return NextResponse.next();
  }

  // For all other pages, redirect to /account if there's no valid profile
  if (profileError || !profile) {
    url.pathname = "/account";
    return NextResponse.redirect(url);
  }

  if (pathname.startsWith("/merch")) {
    const merchId = pathname.split("/")[2]; // Extract shopId from URL
    const { data: merch } = await supabase
      .from("merchandises")
      .select("ready")
      .eq("id", merchId)
      .single();
    console.log(merch);
    if (!merch?.ready) {
      url.pathname = "/";
      return NextResponse.redirect(url);
    }
  }

  // Check for admin pages
  if (pathname.startsWith("/admin")) {
    const { data: admin } = await supabase
      .from("admins")
      .select("id")
      .eq("id", user.id)
      .single();

    if (!admin) {
      url.pathname = "/";
      return NextResponse.redirect(url);
    }
  }

  // Check for manage-shop/[shopId] pages
  if (pathname.startsWith("/manage-shop")) {
    const shopId = pathname.split("/")[2]; // Extract shopId from URL

    const { data: officer } = await supabase
      .from("officers")
      .select("*")
      .eq("user_id", user.id)
      .eq("shop_id", shopId)
      .single();

    if (!officer) {
      url.pathname = "/";
      return NextResponse.redirect(url);
    }
  }

  // Allow the request if all checks pass
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/",
    "/admin/:path*",
    "/manage-shop/:path*",
    "/cart/:path*",
    "/account/:path*",
    "/merch/:path*",
    "/search/:path*",
    "/shop/:path*",
  ],
};
