'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Menu, X, Search, Phone, MapPin, ShoppingCart } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import CartDrawer from '@/components/cart/CartDrawer';
import SearchAutocomplete from './SearchAutocomplete';

export default function Navbar() {
  const { items } = useCart();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-40 shadow-sm">
      
      {/* MAIN NAVBAR CONTAINER */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-3.5">
        
        {/* 📱 MOBILE & TABLET NAVBAR (Below 'lg') */}
        <div className="flex xl:hidden items-center justify-between">
          
          {/* Left: Hamburger Button */}
          <button
            onClick={() => setIsMobileMenuOpen(true)}
            className="p-2 -ml-2 text-gray-800 hover:text-brand-navy focus:outline-none transition-colors"
            aria-label="Open Mobile Menu"
          >
            <Menu className="w-6 h-6" />
          </button>

          {/* Center: Logo */}
          <Link href="/" className="flex items-center">
            <img src="/logo.png" alt="Elaff Trade Co." className="h-9 w-auto object-contain" />
          </Link>

          {/* Right: Search + Cart */}
          <div className="flex items-center -mr-2">
            <button
              onClick={() => setIsSearchOpen(!isSearchOpen)}
              className="p-2 text-gray-800 hover:text-brand-navy focus:outline-none transition-colors"
              aria-label="Toggle Search"
            >
              {isSearchOpen ? <X className="w-6 h-6 text-brand-navy" /> : <Search className="w-6 h-6" />}
            </button>
            <button
              onClick={() => setIsCartOpen(true)}
              className="relative p-2 text-gray-800 hover:text-brand-navy focus:outline-none transition-colors"
              aria-label="Open cart"
            >
              <ShoppingCart className="w-6 h-6" />
              {items.length > 0 && (
                <span className="absolute top-0.5 right-0.5 flex items-center justify-center min-w-[16px] h-[16px] px-1 bg-brand-cta text-white text-[9px] font-bold rounded-full">
                  {items.length}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* 💻 DESKTOP NAVBAR ('lg' and above) */}
        <div className="hidden xl:flex items-center justify-between gap-6">
          
          {/* Logo */}
          <Link href="/" className="flex items-center shrink-0 group">
            <img
              src="/logo.png"
              alt="Elaff Trade Co."
              className="h-11 w-auto object-contain group-hover:opacity-90 transition-opacity"
            />
          </Link>

          {/* Navigation Links */}
          <nav className="flex items-center gap-5 font-bricolage text-xs font-extrabold text-gray-800 tracking-wider whitespace-nowrap">
            <Link href="/" className="hover:text-brand-navy transition-colors uppercase">
              HOME
            </Link>

            <Link href="/shop" className="hover:text-brand-navy transition-colors uppercase">
              SHOP ALL
            </Link>
            <Link href="/about" prefetch={false} className="hover:text-brand-navy transition-colors uppercase">
              ABOUT US
            </Link>
            <Link href="/contact" className="hover:text-brand-navy transition-colors uppercase">
              CONTACT US
            </Link>
          </nav>

          {/* Search Component */}
          <div className="flex items-center shrink-0 w-56 2xl:w-72">
            <SearchAutocomplete
              formClassName="flex items-center border border-gray-300 rounded-full bg-slate-50 overflow-hidden p-1 w-full focus-within:border-brand-navy transition-colors"
              inputClassName="w-full bg-transparent text-xs px-3 text-gray-800 outline-none placeholder-gray-400 font-medium"
              buttonClassName="pr-3 text-gray-500 hover:text-brand-navy transition-colors"
              placeholder="Search products..."
            />
          </div>

          {/* Cart Icon (desktop only — mobile/tablet uses the bottom cart bar) */}
          <button
            onClick={() => setIsCartOpen(true)}
            className="relative p-2 shrink-0 text-gray-700 hover:text-brand-navy transition-colors"
            aria-label="Open cart"
          >
            <ShoppingCart className="w-5 h-5" />
            {items.length > 0 && (
              <span className="absolute -top-0.5 -right-0.5 flex items-center justify-center min-w-[18px] h-[18px] px-1 bg-brand-cta text-white text-[10px] font-bold rounded-full">
                {items.length}
              </span>
            )}
          </button>

        </div>

        {/* 🔍 EXPANDABLE MOBILE SEARCH BAR */}
        {isSearchOpen && (
          <div className="xl:hidden mt-3 pt-3 border-t border-gray-100 animate-fadeIn">
            <SearchAutocomplete
              formClassName="flex items-center border border-gray-300 rounded-full bg-slate-50 overflow-hidden p-1"
              inputClassName="w-full bg-transparent text-xs px-3 text-gray-800 outline-none placeholder-gray-400 font-medium"
              buttonClassName="pr-3 text-brand-navy"
              placeholder="Search products..."
              onNavigate={() => setIsSearchOpen(false)}
            />
          </div>
        )}

      </div>

      {/* ------------------------------------------------------------- */}
      {/* 📱 SLIDE-OVER DRAWER (Left to Right transition for Mobile/Tablet) */}
      {/* ------------------------------------------------------------- */}
      
      {/* Backdrop Blur Overlay */}
      <div
        className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-50 xl:hidden transition-opacity duration-300 ${
          isMobileMenuOpen ? 'opacity-100 visible' : 'opacity-0 invisible pointer-events-none'
        }`}
        onClick={() => setIsMobileMenuOpen(false)}
      />

      {/* Sliding Drawer Container. Hiding is doubled up (transform + visibility)
          so a stuck/not-yet-applied transform can't leave this open and
          clickable on top of the page. */}
      <aside
        className={`fixed top-0 left-0 bottom-0 w-[82%] max-w-sm bg-white z-50 xl:hidden shadow-2xl flex flex-col justify-between transform transition-[transform,visibility] duration-300 ease-in-out ${
          isMobileMenuOpen ? 'translate-x-0 visible' : '-translate-x-full invisible pointer-events-none'
        }`}
        aria-hidden={!isMobileMenuOpen}
      >
        {/* Drawer Header */}
        <div>
          <div className="flex items-center justify-between p-5 bg-brand-navy text-white">
            <img src="/logo-white.png" alt="Elaff Trade Co." className="h-8 w-auto object-contain" />
            <button 
              onClick={() => setIsMobileMenuOpen(false)}
              className="p-1 rounded-full hover:bg-white/10 transition-colors"
              aria-label="Close menu"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Vertical Menu Links */}
          <nav className="p-4 font-bricolage space-y-1">
            <Link 
              href="/" 
              onClick={() => setIsMobileMenuOpen(false)}
              className="block px-4 py-3 text-xs font-extrabold text-gray-800 hover:text-brand-navy hover:bg-slate-50 rounded-lg uppercase tracking-wider transition-colors"
            >
              Home
            </Link>

            <Link
              href="/shop"
              onClick={() => setIsMobileMenuOpen(false)}
              className="block px-4 py-3 text-xs font-extrabold text-gray-800 hover:text-brand-navy hover:bg-slate-50 rounded-lg uppercase tracking-wider transition-colors"
            >
              Shop All
            </Link>

            <Link
              href="/about"
              prefetch={false}
              onClick={() => setIsMobileMenuOpen(false)}
              className="block px-4 py-3 text-xs font-extrabold text-gray-800 hover:text-brand-navy hover:bg-slate-50 rounded-lg uppercase tracking-wider transition-colors"
            >
              About Us
            </Link>

            <Link
              href="/contact"
              onClick={() => setIsMobileMenuOpen(false)}
              className="block px-4 py-3 text-xs font-extrabold text-gray-800 hover:text-brand-navy hover:bg-slate-50 rounded-lg uppercase tracking-wider transition-colors"
            >
              Contact Us
            </Link>
          </nav>
        </div>

        {/* Drawer Bottom Info */}
        <div className="p-5 border-t border-gray-100 bg-slate-50 text-[11px] font-bricolage space-y-3">
          <div className="flex items-center gap-2 text-gray-700 font-semibold">
            <Phone className="w-4 h-4 text-brand-navy" />
            <a href="tel:+923084888399" className="hover:underline">+92 308 4888399</a>
          </div>
          <div className="flex items-start gap-2 text-gray-500 leading-tight">
            <MapPin className="w-4 h-4 text-brand-navy shrink-0 mt-0.5" />
            <span>QUSAIS INDUSTRIAL AREA 1, NEAR MASTER GLOBAL CARGO, GATE # 7, WAREHOUSE # B20, BIN SOUT WAREHOUSE, DUBAI</span>
          </div>
        </div>

      </aside>

      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />

    </header>
  );
}