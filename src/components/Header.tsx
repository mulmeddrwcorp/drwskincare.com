import { SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import Link from "next/link";

export default function Header() {
  return (
    <header className="sticky top-0 z-50 py-4">
      <div className="container">
        <div className="glass flex items-center justify-between px-6 py-3">
          <Link href="/" className="flex items-center">
            <picture>
              <source srcSet="/drwskincare-square-logo.png" media="(max-width: 640px)" />
              <img src="/drwskincare-logo.png" alt="DRW Skincare Logo" className="h-12 w-auto" />
            </picture>
          </Link>
          <nav className="flex items-center gap-3">
            <Link href="/produk" className="text-brand-700 hover:text-brand-800 font-medium px-3 py-2">Produk</Link>
            <Link href="/reseller" className="text-brand-700 hover:text-brand-800 font-medium px-3 py-2">Reseller</Link>
            <SignedOut>
              <Link href="/sign-in" className="btn-secondary">Login</Link>
              <Link href="/sign-up" className="btn-primary">Daftar</Link>
            </SignedOut>
            <SignedIn>
              <Link href="/admin/sync" className="text-brand-700 hover:text-brand-800 font-medium px-3 py-2">Sync</Link>
              <Link href="/admin/database" className="text-brand-700 hover:text-brand-800 font-medium px-3 py-2">Database</Link>
              <Link href="/user-profile" className="text-brand-700 hover:text-brand-800 font-medium px-3 py-2">Profil</Link>
              <UserButton appearance={{ elements: { avatarBox: "w-9 h-9 border-2 border-white/60" } }} />
            </SignedIn>
          </nav>
        </div>
      </div>
    </header>
  );
}
