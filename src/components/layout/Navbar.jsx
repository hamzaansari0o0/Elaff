'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Menu, X, Search, ChevronDown, Phone, MapPin, ShoppingCart } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import CartDrawer from '@/components/cart/CartDrawer';

export default function Navbar({ collections = [] }) {
  const router = useRouter();
  const { items } = useCart();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const categories = collections.map((c) => ({
    name: c.title,
    href: `/collection/${c.slug}`,
  }));

  function handleSearchSubmit(e) {
    e.preventDefault();
    const query = searchQuery.trim();
    if (!query) return;
    router.push(`/shop?search=${encodeURIComponent(query)}`);
    setIsSearchOpen(false);
  }

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

            {/* Product Category Dropdown */}
            <div className="relative group py-2 cursor-pointer">
              <div className="flex items-center gap-1.5 hover:text-brand-navy transition-colors uppercase">
                <span>PRODUCT CATEGORY</span>
                <ChevronDown className="w-4 h-4 transition-transform group-hover:rotate-180 shrink-0" />
              </div>

              {/* Mega Dropdown Menu */}
              <div className="absolute top-full left-0 w-64 bg-white border border-gray-200 rounded-xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 p-3 z-50">
                {categories.map((cat, idx) => (
                  <Link
                    key={idx}
                    href={cat.href}
                    className="block px-4 py-2.5 text-xs font-semibold text-gray-700 hover:bg-slate-50 hover:text-brand-navy rounded-lg transition-colors"
                  >
                    {cat.name}
                  </Link>
                ))}
              </div>
            </div>

            <Link href="/shop" className="hover:text-brand-navy transition-colors uppercase">
              SHOP ALL
            </Link>
            <Link href="/collections" className="hover:text-brand-navy transition-colors uppercase">
              COLLECTIONS
            </Link>
            <Link href="/shipping-terms" className="hover:text-brand-navy transition-colors uppercase">
              SHIPPING TERMS
            </Link>
            <Link href="/about" className="hover:text-brand-navy transition-colors uppercase">
              ABOUT US
            </Link>
            <Link href="/contact" className="hover:text-brand-navy transition-colors uppercase">
              CONTACT US
            </Link>
          </nav>

          {/* Search Component */}
          <div className="flex items-center shrink-0">
            <form
              onSubmit={handleSearchSubmit}
              className="flex items-center border border-gray-300 rounded-full bg-slate-50 overflow-hidden p-1 w-56 2xl:w-72 focus-within:border-brand-navy transition-colors"
            >
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search products..."
                className="w-full bg-transparent text-xs px-3 text-gray-800 outline-none placeholder-gray-400 font-medium"
              />
              <button type="submit" className="pr-3 text-gray-500 hover:text-brand-navy transition-colors" aria-label="Search">
                <Search className="w-4 h-4" />
              </button>
            </form>
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
            <form
              onSubmit={handleSearchSubmit}
              className="flex items-center border border-gray-300 rounded-full bg-slate-50 overflow-hidden p-1"
            >
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search products..."
                className="w-full bg-transparent text-xs px-3 text-gray-800 outline-none placeholder-gray-400 font-medium"
              />
              <button type="submit" className="pr-3 text-brand-navy" aria-label="Submit Search">
                <Search className="w-4 h-4" />
              </button>
            </form>
          </div>
        )}

      </div>

      {/* ------------------------------------------------------------- */}
      {/* 📱 SLIDE-OVER DRAWER (Left to Right transition for Mobile/Tablet) */}
      {/* ------------------------------------------------------------- */}
      
      {/* Backdrop Blur Overlay */}
      <div 
        className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-50 xl:hidden transition-opacity duration-300 ${
          isMobileMenuOpen ? 'opacity-100 visible' : 'opacity-0 invisible'
        }`}
        onClick={() => setIsMobileMenuOpen(false)}
      />

      {/* Sliding Drawer Container */}
      <aside 
        className={`fixed top-0 left-0 bottom-0 w-[82%] max-w-sm bg-white z-50 xl:hidden shadow-2xl flex flex-col justify-between transform transition-transform duration-300 ease-in-out ${
          isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
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

            {/* Accordion: Product Category */}
            <div className="border-y border-gray-100 my-1 py-1">
              <button 
                onClick={() => setIsCategoryOpen(!isCategoryOpen)}
                className="w-full flex items-center justify-between px-4 py-3 text-xs font-extrabold text-gray-800 hover:text-brand-navy hover:bg-slate-50 rounded-lg uppercase tracking-wider transition-colors"
              >
                <span>Product Category</span>
                <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${isCategoryOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Sub-categories */}
              {isCategoryOpen && (
                <div className="pl-6 pr-2 py-1 space-y-1 bg-slate-50/70 rounded-lg my-1">
                  {categories.map((cat, idx) => (
                    <Link
                      key={idx}
                      href={cat.href}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="block px-3 py-2 text-xs font-semibold text-gray-600 hover:text-brand-navy transition-colors"
                    >
                      • {cat.name}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            <Link 
              href="/shop" 
              onClick={() => setIsMobileMenuOpen(false)}
              className="block px-4 py-3 text-xs font-extrabold text-gray-800 hover:text-brand-navy hover:bg-slate-50 rounded-lg uppercase tracking-wider transition-colors"
            >
              Shop All
            </Link>

            <Link
              href="/collections"
              onClick={() => setIsMobileMenuOpen(false)}
              className="block px-4 py-3 text-xs font-extrabold text-gray-800 hover:text-brand-navy hover:bg-slate-50 rounded-lg uppercase tracking-wider transition-colors"
            >
              Collections
            </Link>

            <Link
              href="/shipping-terms"
              onClick={() => setIsMobileMenuOpen(false)}
              className="block px-4 py-3 text-xs font-extrabold text-gray-800 hover:text-brand-navy hover:bg-slate-50 rounded-lg uppercase tracking-wider transition-colors"
            >
              Shipping Terms
            </Link>

            <Link 
              href="/about" 
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
            <a href="tel:+18078088990" className="hover:underline">+1(807) 808-8990</a>
          </div>
          <div className="flex items-start gap-2 text-gray-500 leading-tight">
            <MapPin className="w-4 h-4 text-brand-navy shrink-0 mt-0.5" />
            <span>4653 BD DES GRANDES-PRAIRIES, QC H1R 1A5, CANADA</span>
          </div>
        </div>

      </aside>

      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />

    </header>
  );
}