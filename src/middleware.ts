import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

/*
Middleware "Penjaga Gerbang":
- Menggunakan Clerk middleware pattern (`clerkMiddleware`) untuk memaksa pengguna yang sudah terautentikasi
  namun belum memilih `role` di public metadata agar diarahkan ke `/pilih-peran`.

Behavior:
1. Definisikan `publicRoutes` yang boleh diakses tanpa pemilihan peran (mis. homepage, katalog, storefront public).
2. Untuk request yang bukan public route, jika user sudah login tetapi `publicMetadata.role` belum diisi,
   dan user tidak sedang membuka `/pilih-peran` atau API, maka redirect ke `/pilih-peran`.
3. Mendukung kedua bentuk public metadata: `public_metadata` (snake_case) dan `publicMetadata` (camelCase).
*/

const publicRoutes = createRouteMatcher([
  '/',
  '/produk(.*)',
  '/reseller(.*)',
  '/toko/(.*)',
  // Onboarding and profile completion routes should be public so users can complete setup
  '/pilih-peran',
  '/lengkapi-profil',
  '/lengkapi-profil-bc'
]);
export default clerkMiddleware(async (auth, req) => {
  try {
    const pathname = req.nextUrl.pathname;

    // Public routes are accessible without redirect
    if (publicRoutes(req)) return;

    // auth is a function; call it to get the auth object
    const authObj = await auth();

    const isLoggedIn = !!authObj?.userId;
    const sessionClaimsAny: any = authObj?.sessionClaims;

    // Support both snake_case and camelCase variants of public metadata
    const role =
      sessionClaimsAny?.public_metadata?.role ?? sessionClaimsAny?.publicMetadata?.role ?? null;

    const isTryingToChooseRole = pathname.startsWith('/pilih-peran');
    const isApiRoute = pathname.startsWith('/api');

    if (isLoggedIn && !role && !isTryingToChooseRole && !isApiRoute) {
      const dest = new URL('/pilih-peran', req.url);
      return NextResponse.redirect(dest);
    }
  } catch (e) {
    console.error('middleware afterAuth-like error:', e);
  }
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
  "\/(api|trpc)(.*)",
  ],
};
