import Link from 'next/link';
import { Phone, Mail, MapPin } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-[#6B0018] text-white pt-12 pb-6 mt-16">
      <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-8 mb-12 text-xs">
        
        <div>
          <h3 className="font-fraunces text-sm font-black uppercase tracking-widest mb-4 pb-2 border-b border-white/20">
            About OMX Trader Stock
          </h3>
          <p className="font-bricolage text-gray-200 leading-relaxed">
            We supply Cooking Oil, Snacks & Grocery, Mineral Water, Soft Drinks, Office Supplies, Whiskey. We can deliver to all locations with compliance to local laws. We ship our orders within 24 to 72 hours.
          </p>
        </div>

        <div>
          <h3 className="font-fraunces text-sm font-black uppercase tracking-widest mb-4 pb-2 border-b border-white/20">
            Quick Navigation
          </h3>
          <ul className="font-bricolage space-y-2.5 font-semibold text-gray-200">
            <li><Link href="/shipping-terms" className="hover:underline">SHIPPING TERMS</Link></li>
            <li><Link href="/about" className="hover:underline">ABOUT US</Link></li>
            <li><Link href="/contact" className="hover:underline">CONTACT US</Link></li>
            <li><Link href="/privacy-policy" className="hover:underline">PRIVACY POLICY</Link></li>
            <li><Link href="/" className="hover:underline">HOMEPAGE</Link></li>
          </ul>
        </div>

        <div>
          <h3 className="font-fraunces text-sm font-black uppercase tracking-widest mb-4 pb-2 border-b border-white/20">
            Shop Easy
          </h3>
          <ul className="font-bricolage space-y-2.5 font-semibold text-gray-200">
            <li><Link href="/category/confectioneries" className="hover:underline">Confectioneries</Link></li>
            <li><Link href="/category/agricultural" className="hover:underline">Agricultural Products</Link></li>
            <li><Link href="/category/poultry" className="hover:underline">Poultry Feedstock</Link></li>
            <li><Link href="/category/tea-coffee" className="hover:underline">Tea and Coffee</Link></li>
            <li><Link href="/shop" className="hover:underline">Shop All Category</Link></li>
          </ul>
        </div>

        <div>
          <h3 className="font-fraunces text-sm font-black uppercase tracking-widest mb-4 pb-2 border-b border-white/20">
            Contact Info
          </h3>
          <div className="font-bricolage space-y-3 text-gray-200">
            <p>Please contact us if you have any questions about our shop. We generally reply within an hour.</p>
            <div className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-amber-400" />
              <span><strong>TEL:</strong> +1(807) 808-8990</span>
            </div>
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-amber-400" />
              <span><strong>WHATSAPP:</strong> +1(807) 329-7478</span>
            </div>
            <div className="flex items-start gap-2">
              <MapPin className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <span><strong>OFFICE LOCATION:</strong> 4653 BD DES GRANDES-PRAIRIES, SAINT-LÉONARD, QC H1R 1A5, CANADA</span>
            </div>
          </div>
        </div>

      </div>

      <div className="max-w-7xl mx-auto px-4 pt-6 border-t border-white/10 text-center text-[11px] text-gray-300 font-medium flex flex-col sm:flex-row items-center justify-between gap-2">
        <p>© Copyright 2026 KONAVA TRADE INC. All rights reserved.</p>
        <div className="flex items-center gap-4">
          <Link href="/privacy-policy" className="hover:underline">Privacy Policy</Link>
          <span>•</span>
          <Link href="/terms" className="hover:underline">Terms of Service</Link>
        </div>
      </div>
    </footer>
  );
}