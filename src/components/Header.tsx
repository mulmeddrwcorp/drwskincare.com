import { SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import Link from "next/link";

export default function Header() {
  return (
    <header className="sticky top-0 z-50 py-4">
      <div className="container">
        <div className="glass flex items-center justify-between px-6 py-3">
          <Link href="/" className="flex items-center gap-3">
            <span className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-brand-500 to-brand-400 text-white font-bold shadow">
              D
            </span>
            <span className="text-2xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-brand-600 to-brand-400">
              DRW Skincare
            </span>
          </Link>
          <nav className="flex items-center gap-3">
            <SignedOut>
              <Link href="/sign-in" className="btn-secondary">Login</Link>
              <Link href="/sign-up" className="btn-primary">Daftar</Link>
            </SignedOut>
            <SignedIn>
              <Link href="/user-profile" className="text-brand-700 hover:text-brand-800 font-medium px-3 py-2">Profil</Link>
              <UserButton appearance={{ elements: { avatarBox: "w-9 h-9 border-2 border-white/60" } }} />
            </SignedIn>
          </nav>
        </div>
      </div>
    </header>
  );
}
