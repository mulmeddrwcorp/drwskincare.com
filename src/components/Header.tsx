import { SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import Link from "next/link";

export default function Header() {
  return (
    <header className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto flex justify-between items-center p-4">
        <Link href="/" className="text-xl font-bold text-gray-800 hover:text-blue-600 transition-colors">
          DRW Skincare
        </Link>
        <div className="flex items-center gap-4">
          <SignedOut>
            <Link 
              href="/sign-in" 
              className="px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
            >
              Login
            </Link>
            <Link 
              href="/sign-up" 
              className="px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-md transition-colors"
            >
              Daftar
            </Link>
          </SignedOut>
          <SignedIn>
            <Link 
              href="/user-profile" 
              className="px-3 py-2 text-gray-600 hover:text-blue-600 transition-colors"
            >
              Profil
            </Link>
            <UserButton 
              appearance={{
                elements: {
                  avatarBox: "w-8 h-8"
                }
              }}
            />
          </SignedIn>
        </div>
      </div>
    </header>
  );
}
