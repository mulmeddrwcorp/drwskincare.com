export default function Footer() {
  return (
    <footer className="bg-gray-800 text-white">
      <div className="max-w-7xl mx-auto py-8 px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div>
            <h3 className="text-lg font-semibold mb-4">Produk Kami</h3>
            <ul className="space-y-2 text-sm text-gray-300">
              <li><a href="/products/cleansers" className="hover:text-white transition-colors">Pembersih Wajah</a></li>
              <li><a href="/products/moisturizers" className="hover:text-white transition-colors">Pelembab</a></li>
              <li><a href="/products/serums" className="hover:text-white transition-colors">Serum</a></li>
              <li><a href="/products/sunscreen" className="hover:text-white transition-colors">Tabir Surya</a></li>
              <li><a href="/products/toner" className="hover:text-white transition-colors">Toner</a></li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4">Tentang DRW</h3>
            <ul className="space-y-2 text-sm text-gray-300">
              <li><a href="/about" className="hover:text-white transition-colors">Tentang Kami</a></li>
              <li><a href="/vision-mission" className="hover:text-white transition-colors">Visi & Misi</a></li>
              <li><a href="/careers" className="hover:text-white transition-colors">Karir</a></li>
              <li><a href="/sustainability" className="hover:text-white transition-colors">Keberlanjutan</a></li>
              <li><a href="/blog" className="hover:text-white transition-colors">Blog</a></li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4">Bantuan</h3>
            <ul className="space-y-2 text-sm text-gray-300">
              <li><a href="/contact" className="hover:text-white transition-colors">Hubungi Kami</a></li>
              <li><a href="/faq" className="hover:text-white transition-colors">FAQ</a></li>
              <li><a href="/shipping" className="hover:text-white transition-colors">Pengiriman</a></li>
              <li><a href="/returns" className="hover:text-white transition-colors">Retur & Pengembalian</a></li>
              <li><a href="/size-guide" className="hover:text-white transition-colors">Panduan Ukuran</a></li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4">Ikuti Kami</h3>
            <ul className="space-y-2 text-sm text-gray-300">
              <li><a href="#" className="hover:text-white transition-colors">Instagram</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Facebook</a></li>
              <li><a href="#" className="hover:text-white transition-colors">TikTok</a></li>
              <li><a href="#" className="hover:text-white transition-colors">YouTube</a></li>
              <li><a href="/newsletter" className="hover:text-white transition-colors">Newsletter</a></li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-gray-700 mt-8 pt-6 text-center">
          <p className="text-sm text-gray-300">
            © 2025 DRW Skincare. All Rights Reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
