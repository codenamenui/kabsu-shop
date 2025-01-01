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
  console.log(user);
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
