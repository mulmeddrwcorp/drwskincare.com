import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

/*
Middleware "Penjaga Gerbang":
- Menggunakan Clerk middleware pattern (`clerkMiddleware`) untuk memaksa pengguna yang sudah terautentikasi
  namun belum memilih `role` di public metadata agar diarahkan ke `/pilih-peran`.
- Untuk resellers yang sudah linked, izinkan akses langsung ke dashboard dan area terlindung lainnya.

Behavior:
1. Definisikan `publicRoutes` yang boleh diakses tanpa pemilihan peran (mis. homepage, katalog, storefront public).
2. Untuk request yang bukan public route:
   a. Jika user sudah login dan memiliki role yang valid, izinkan akses
   b. Jika user sudah login tapi tidak memiliki role, dan tidak sedang di pilih-peran/API, redirect ke pilih-peran
3. Mendukung kedua bentuk public metadata: `public_metadata` (snake_case) dan `publicMetadata` (camelCase).
*/

const publicRoutes = createRouteMatcher([
  '/',
  '/produk(.*)',
  '/reseller(.*)',
  '/toko/(.*)',
  // Debug routes for troubleshooting
  '/debug',
  '/debug/(.*)', 
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
    
    if (!isLoggedIn) {
      // Not logged in, let Clerk handle auth redirect
      return;
    }

    const sessionClaimsAny: any = authObj?.sessionClaims;

    // Support both snake_case and camelCase variants of public metadata
    const role =
      sessionClaimsAny?.public_metadata?.role ?? sessionClaimsAny?.publicMetadata?.role ?? null;
    
    const profileComplete = 
      sessionClaimsAny?.public_metadata?.profileComplete ?? sessionClaimsAny?.publicMetadata?.profileComplete ?? false;    // Debug logging for dashboard routes
    if (pathname.includes('/dashboard') || pathname.includes('/profil')) {
      console.log('[middleware] Dashboard/Profile Access Check:', {
        pathname,
        isLoggedIn,
        role,
        profileComplete,
        userId: authObj?.userId,
        rawMetadata: sessionClaimsAny?.public_metadata || sessionClaimsAny?.publicMetadata,
        hasValidAccess: (role && ['user', 'reseller'].includes(role)) || profileComplete
      });
    }

    const isTryingToChooseRole = pathname.startsWith('/pilih-peran');
    const isApiRoute = pathname.startsWith('/api');

    // Allow access if:
    // 1. User has a valid role (user or reseller)
    // 2. OR profile is marked as complete (for legacy/compatibility)
    const hasValidAccess = (role && ['user', 'reseller'].includes(role)) || profileComplete;

    // If user doesn't have valid access and is not on pilih-peran or API routes, redirect
    if (!hasValidAccess && !isTryingToChooseRole && !isApiRoute) {
      const dest = new URL('/pilih-peran', req.url);
      console.log('[middleware] Redirecting to pilih-peran:', { 
        pathname, 
        role, 
        profileComplete, 
        userId: authObj?.userId 
      });
      return NextResponse.redirect(dest);
    }

    // If user is trying to access pilih-peran but already has valid access, redirect to dashboard
    if (isTryingToChooseRole && hasValidAccess) {
      const dest = new URL('/dashboard', req.url);
      console.log('[middleware] User has valid access, redirecting from pilih-peran to dashboard:', { 
        role, 
        profileComplete, 
        userId: authObj?.userId 
      });
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
