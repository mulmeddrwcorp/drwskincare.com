export default function Footer() {
  return (
    <footer className="mt-16 pb-10">
      <div className="container">
        <div className="glass px-8 py-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-10">
            <div>
              <h3 className="text-lg font-semibold mb-4 text-brand-700">Produk Kami</h3>
              <ul className="space-y-2 text-sm text-brand-800/80">
                <li><a href="/products/cleansers" className="hover:text-brand-600 transition">Pembersih Wajah</a></li>
                <li><a href="/products/moisturizers" className="hover:text-brand-600 transition">Pelembab</a></li>
                <li><a href="/products/serums" className="hover:text-brand-600 transition">Serum</a></li>
                <li><a href="/products/sunscreen" className="hover:text-brand-600 transition">Tabir Surya</a></li>
                <li><a href="/products/toner" className="hover:text-brand-600 transition">Toner</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4 text-brand-700">Tentang DRW</h3>
              <ul className="space-y-2 text-sm text-brand-800/80">
                <li><a href="/about" className="hover:text-brand-600 transition">Tentang Kami</a></li>
                <li><a href="/vision-mission" className="hover:text-brand-600 transition">Visi & Misi</a></li>
                <li><a href="/careers" className="hover:text-brand-600 transition">Karir</a></li>
                <li><a href="/sustainability" className="hover:text-brand-600 transition">Keberlanjutan</a></li>
                <li><a href="/blog" className="hover:text-brand-600 transition">Blog</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4 text-brand-700">Bantuan</h3>
              <ul className="space-y-2 text-sm text-brand-800/80">
                <li><a href="/contact" className="hover:text-brand-600 transition">Hubungi Kami</a></li>
                <li><a href="/faq" className="hover:text-brand-600 transition">FAQ</a></li>
                <li><a href="/shipping" className="hover:text-brand-600 transition">Pengiriman</a></li>
                <li><a href="/returns" className="hover:text-brand-600 transition">Retur & Pengembalian</a></li>
                <li><a href="/size-guide" className="hover:text-brand-600 transition">Panduan Ukuran</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4 text-brand-700">Ikuti Kami</h3>
              <ul className="space-y-2 text-sm text-brand-800/80">
                <li><a href="#" className="hover:text-brand-600 transition">Instagram</a></li>
                <li><a href="#" className="hover:text-brand-600 transition">Facebook</a></li>
                <li><a href="#" className="hover:text-brand-600 transition">TikTok</a></li>
                <li><a href="#" className="hover:text-brand-600 transition">YouTube</a></li>
                <li><a href="/newsletter" className="hover:text-brand-600 transition">Newsletter</a></li>
              </ul>
            </div>
          </div>
          <div className="mt-12 pt-6 border-t border-white/50 text-center">
            <p className="text-sm text-brand-800/70">© 2025 DRW Skincare. All Rights Reserved.</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
