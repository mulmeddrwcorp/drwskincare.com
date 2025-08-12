import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { Inter } from "next/font/google";
import Header from "../components/Header";
import Footer from "../components/Footer";
import "../globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "DRW Skincare",
  description: "DRW Skincare - Produk perawatan kulit premium untuk rutinitas harian Anda",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider localization={{ locale: "id-ID" }}>
      <html lang="id">
        <body className={`${inter.className} min-h-screen flex flex-col`}>
          <Header />
          <main className="flex-1">
            {children}
          </main>
          <Footer />
        </body>
      </html>
    </ClerkProvider>
  );
}
