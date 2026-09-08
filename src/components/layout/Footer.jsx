import Link from 'next/link';
import { Phone, Mail, MapPin } from 'lucide-react';
import RevealText from '@/components/ui/RevealText';

export default function Footer() {
  return (
    <footer className="bg-brand-navy text-white pt-12 pb-6 mt-16">
      <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-8 mb-12 text-xs">

        <div>
          <img src="/logo-white.png" alt="Elaff Trade Co." className="h-9 w-auto object-contain mb-4" />
          <RevealText as="h3" className="font-fraunces text-sm font-black uppercase tracking-widest mb-4 pb-2 border-b border-white/20 block">
            About Elaff Trade Co.
          </RevealText>
          <p className="font-bricolage text-gray-200 leading-relaxed">
            We supply Cooking Oil, Snacks & Grocery, Mineral Water, Soft Drinks, Office Supplies, Whiskey. We can deliver to all locations with compliance to local laws. We ship our orders within 24 to 72 hours.
          </p>
        </div>

        <div>
          <RevealText as="h3" className="font-fraunces text-sm font-black uppercase tracking-widest mb-4 pb-2 border-b border-white/20 block">
            Quick Navigation
          </RevealText>
          <ul className="font-bricolage space-y-2.5 font-semibold text-gray-200">
            <li><Link href="/shipping-terms" prefetch={false} className="hover:underline">SHIPPING TERMS</Link></li>
            <li><Link href="/about" prefetch={false} className="hover:underline">ABOUT US</Link></li>
            <li><Link href="/contact" className="hover:underline">CONTACT US</Link></li>
            <li><Link href="/privacy-policy" prefetch={false} className="hover:underline">PRIVACY POLICY</Link></li>
            <li><Link href="/" className="hover:underline">HOMEPAGE</Link></li>
          </ul>
        </div>

        <div>
          <RevealText as="h3" className="font-fraunces text-sm font-black uppercase tracking-widest mb-4 pb-2 border-b border-white/20 block">
            Shop Easy
          </RevealText>
          <ul className="font-bricolage space-y-2.5 font-semibold text-gray-200">
            <li><Link href="/collection/confectionery" className="hover:underline">Confectioneries</Link></li>
            <li><Link href="/collection/agricultural" className="hover:underline">Agricultural Products</Link></li>
            <li><Link href="/collection/beverages" className="hover:underline">Beverages &amp; Beer</Link></li>
            <li><Link href="/collection/tea-coffee" className="hover:underline">Tea and Coffee</Link></li>
            <li><Link href="/collections" className="hover:underline">All Collections</Link></li>
          </ul>
        </div>

        <div>
          <RevealText as="h3" className="font-fraunces text-sm font-black uppercase tracking-widest mb-4 pb-2 border-b border-white/20 block">
            Contact Info
          </RevealText>
          <div className="font-bricolage space-y-3 text-gray-200">
            <p>Please contact us if you have any questions about our shop. We generally reply within an hour.</p>
            <div className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-amber-400" />
              <span><strong>TEL:</strong> +92 308 4888399</span>
            </div>
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-amber-400" />
              <span><strong>WHATSAPP:</strong> +92 308 4888399</span>
            </div>
            <div className="flex items-start gap-2">
              <MapPin className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <span><strong>OFFICE LOCATION:</strong> QUSAIS INDUSTRIAL AREA 1, NEAR MASTER GLOBAL CARGO, GATE # 7, WAREHOUSE # B20, BIN SOUT WAREHOUSE, DUBAI</span>
            </div>
          </div>
        </div>

      </div>

      <div className="max-w-7xl mx-auto px-4 pt-6 border-t border-white/10 text-center text-[11px] text-gray-300 font-medium flex flex-col sm:flex-row items-center justify-between gap-2">
        <p>© Copyright 2026 ELAFF TRADE CO. All rights reserved.</p>
        <div className="flex items-center gap-4">
          <Link href="/privacy-policy" prefetch={false} className="hover:underline">Privacy Policy</Link>
          <span>•</span>
          <Link href="/terms" prefetch={false} className="hover:underline">Terms of Service</Link>
        </div>
      </div>
    </footer>
  );
}