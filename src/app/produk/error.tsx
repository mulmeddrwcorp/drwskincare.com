"use client";

import { useEffect } from "react";

export default function ErrorProduk({ error, reset }: { error: Error; reset: () => void }) {
  useEffect(() => {
    // Log error ke monitoring service jika perlu
    console.error("Produk page error:", error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[300px] p-8">
      <div className="text-red-600 text-xl font-bold mb-2">Terjadi kesalahan saat memuat produk</div>
      <div className="text-gray-600 mb-4">{error.message}</div>
      <button
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        onClick={() => reset()}
      >
        Coba Lagi
      </button>
    </div>
  );
}
