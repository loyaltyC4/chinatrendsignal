import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

/**
 * Refreshes the Supabase session cookie on every matched request and bounces
 * signed-out visitors away from the app pages.
 *
 * Marketing routes (/, /pricing, /login) stay public — they are the acquisition
 * surface. Everything behind the product is gated.
 */
const PROTECTED = ["/dashboard", "/radar", "/analysis", "/reports", "/ask", "/tracker", "/settings"];

export async function middleware(req: NextRequest) {
  let res = NextResponse.next({ request: req });

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  // Without Supabase configured we cannot evaluate a session. Fail open so the
  // marketing site keeps working rather than locking everyone out.
  if (!url || !anon) return res;

  const supabase = createServerClient(url, anon, {
    cookies: {
      getAll() {
        return req.cookies.getAll();
      },
      setAll(list) {
        list.forEach(({ name, value }) => req.cookies.set(name, value));
        res = NextResponse.next({ request: req });
        list.forEach(({ name, value, options }) => res.cookies.set(name, value, options));
      },
    },
  });

  // Revalidates the token and rotates the cookie. Must not be removed.
  const { data } = await supabase.auth.getUser();

  const path = req.nextUrl.pathname;
  const needsAuth = PROTECTED.some((p) => path === p || path.startsWith(`${p}/`));

  if (needsAuth && !data?.user) {
    const to = req.nextUrl.clone();
    to.pathname = "/login";
    to.searchParams.set("next", path);
    return NextResponse.redirect(to);
  }

  // Signed-in users have no reason to see the login form.
  if (path === "/login" && data?.user) {
    const to = req.nextUrl.clone();
    to.pathname = "/dashboard";
    to.search = "";
    return NextResponse.redirect(to);
  }

  return res;
}

export const config = {
  matcher: [
    // Everything except static assets and image files.
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:png|jpg|jpeg|gif|svg|webp|ico)$).*)",
  ],
};
