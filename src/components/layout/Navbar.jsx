'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Menu, X, Search, ChevronDown, Phone, MapPin, ShoppingBag } from 'lucide-react';

export default function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const categories = [
    { name: 'Frozen Food', href: '/collection/frozen-food' },
    { name: 'Confectionery', href: '/collection/confectionery' },
    { name: 'Beverages & Beer', href: '/collection/beverages' },
    { name: 'Agricultural Products', href: '/collection/agricultural' },
    { name: 'Cooking Oil', href: '/collection/cooking-oil' },
    { name: 'Tea & Coffee', href: '/collection/tea-coffee' },
  ];

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-40 shadow-sm">
      
      {/* MAIN NAVBAR CONTAINER */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-3.5">
        
        {/* 📱 MOBILE & TABLET NAVBAR (Below 'lg') */}
        <div className="flex lg:hidden items-center justify-between">
          
          {/* Left: Hamburger Button */}
          <button
            onClick={() => setIsMobileMenuOpen(true)}
            className="p-2 -ml-2 text-gray-800 hover:text-[#6B0018] focus:outline-none transition-colors"
            aria-label="Open Mobile Menu"
          >
            <Menu className="w-6 h-6" />
          </button>

          {/* Center: Logo */}
          <Link href="/" className="flex flex-col items-center leading-none">
            <span className="font-fraunces text-xl font-black tracking-tight text-[#6B0018]">
              KONAVA
            </span>
            <span className="font-bricolage text-[11px] font-extrabold tracking-[0.2em] text-[#D9822B]">
              TRADE INC.
            </span>
          </Link>

          {/* Right: Search Toggle Button */}
          <button
            onClick={() => setIsSearchOpen(!isSearchOpen)}
            className="p-2 -mr-2 text-gray-800 hover:text-[#6B0018] focus:outline-none transition-colors"
            aria-label="Toggle Search"
          >
            {isSearchOpen ? <X className="w-6 h-6 text-[#6B0018]" /> : <Search className="w-6 h-6" />}
          </button>
        </div>

        {/* 💻 DESKTOP NAVBAR ('lg' and above) */}
        <div className="hidden lg:flex items-center justify-between gap-8">
          
          {/* Logo */}
          <Link href="/" className="flex flex-col leading-none shrink-0 group">
            <span className="font-fraunces text-2xl font-black tracking-tight text-[#6B0018] group-hover:opacity-90">
              KONAVA
            </span>
            <span className="font-bricolage text-xs font-bold tracking-[0.25em] text-[#D9822B]">
              TRADE INC.
            </span>
          </Link>

          {/* Navigation Links */}
          <nav className="flex items-center gap-7 font-bricolage text-xs font-extrabold text-gray-800 tracking-wider">
            <Link href="/" className="hover:text-[#6B0018] transition-colors uppercase">
              HOME
            </Link>
            
            {/* Product Category Dropdown */}
            <div className="relative group py-2 cursor-pointer">
              <div className="flex items-center gap-1.5 hover:text-[#6B0018] transition-colors uppercase">
                <span>PRODUCT CATEGORY</span>
                <ChevronDown className="w-4 h-4 transition-transform group-hover:rotate-180" />
              </div>

              {/* Mega Dropdown Menu */}
              <div className="absolute top-full left-0 w-64 bg-white border border-gray-200 rounded-xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 p-3 z-50">
                {categories.map((cat, idx) => (
                  <Link
                    key={idx}
                    href={cat.href}
                    className="block px-4 py-2.5 text-xs font-semibold text-gray-700 hover:bg-slate-50 hover:text-[#6B0018] rounded-lg transition-colors"
                  >
                    {cat.name}
                  </Link>
                ))}
              </div>
            </div>

            <Link href="/shop" className="hover:text-[#6B0018] transition-colors uppercase">
              SHOP ALL
            </Link>
            <Link href="/shipping-terms" className="hover:text-[#6B0018] transition-colors uppercase">
              SHIPPING TERMS
            </Link>
            <Link href="/about" className="hover:text-[#6B0018] transition-colors uppercase">
              ABOUT US
            </Link>
            <Link href="/contact" className="hover:text-[#6B0018] transition-colors uppercase">
              CONTACT US
            </Link>
          </nav>

          {/* Search Component */}
          <div className="flex items-center">
            <div className="flex items-center border border-gray-300 rounded-full bg-slate-50 overflow-hidden p-1 w-72 focus-within:border-[#6B0018] transition-colors">
              <select className="bg-transparent text-[11px] text-gray-600 font-semibold px-3 py-1 outline-none border-r border-gray-200 cursor-pointer">
                <option value="all">All</option>
                <option value="frozen">Frozen</option>
                <option value="grocery">Grocery</option>
              </select>
              <input 
                type="text" 
                placeholder="Search products..." 
                className="w-full bg-transparent text-xs px-3 text-gray-800 outline-none placeholder-gray-400 font-medium"
              />
              <button className="pr-3 text-gray-500 hover:text-[#6B0018] transition-colors" aria-label="Search">
                <Search className="w-4 h-4" />
              </button>
            </div>
          </div>

        </div>

        {/* 🔍 EXPANDABLE MOBILE SEARCH BAR */}
        {isSearchOpen && (
          <div className="lg:hidden mt-3 pt-3 border-t border-gray-100 animate-fadeIn">
            <div className="flex items-center border border-gray-300 rounded-full bg-slate-50 overflow-hidden p-1">
              <select className="bg-transparent text-[11px] text-gray-600 font-semibold px-2 py-1 outline-none border-r border-gray-200">
                <option value="all">All</option>
                <option value="frozen">Frozen</option>
                <option value="grocery">Grocery</option>
              </select>
              <input 
                type="text" 
                placeholder="Search products..." 
                className="w-full bg-transparent text-xs px-3 text-gray-800 outline-none placeholder-gray-400 font-medium"
              />
              <button className="pr-3 text-[#6B0018]" aria-label="Submit Search">
                <Search className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

      </div>

      {/* ------------------------------------------------------------- */}
      {/* 📱 SLIDE-OVER DRAWER (Left to Right transition for Mobile/Tablet) */}
      {/* ------------------------------------------------------------- */}
      
      {/* Backdrop Blur Overlay */}
      <div 
        className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-50 lg:hidden transition-opacity duration-300 ${
          isMobileMenuOpen ? 'opacity-100 visible' : 'opacity-0 invisible'
        }`}
        onClick={() => setIsMobileMenuOpen(false)}
      />

      {/* Sliding Drawer Container */}
      <aside 
        className={`fixed top-0 left-0 bottom-0 w-[82%] max-w-sm bg-white z-50 lg:hidden shadow-2xl flex flex-col justify-between transform transition-transform duration-300 ease-in-out ${
          isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Drawer Header */}
        <div>
          <div className="flex items-center justify-between p-5 bg-[#6B0018] text-white">
            <div className="flex flex-col leading-none">
              <span className="font-fraunces text-lg font-black tracking-tight">KONAVA</span>
              <span className="font-bricolage text-[10px] font-bold tracking-[0.2em] text-amber-400">TRADE INC.</span>
            </div>
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
              className="block px-4 py-3 text-xs font-extrabold text-gray-800 hover:text-[#6B0018] hover:bg-slate-50 rounded-lg uppercase tracking-wider transition-colors"
            >
              Home
            </Link>

            {/* Accordion: Product Category */}
            <div className="border-y border-gray-100 my-1 py-1">
              <button 
                onClick={() => setIsCategoryOpen(!isCategoryOpen)}
                className="w-full flex items-center justify-between px-4 py-3 text-xs font-extrabold text-gray-800 hover:text-[#6B0018] hover:bg-slate-50 rounded-lg uppercase tracking-wider transition-colors"
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
                      className="block px-3 py-2 text-xs font-semibold text-gray-600 hover:text-[#6B0018] transition-colors"
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
              className="block px-4 py-3 text-xs font-extrabold text-gray-800 hover:text-[#6B0018] hover:bg-slate-50 rounded-lg uppercase tracking-wider transition-colors"
            >
              Shop All
            </Link>

            <Link 
              href="/shipping-terms" 
              onClick={() => setIsMobileMenuOpen(false)}
              className="block px-4 py-3 text-xs font-extrabold text-gray-800 hover:text-[#6B0018] hover:bg-slate-50 rounded-lg uppercase tracking-wider transition-colors"
            >
              Shipping Terms
            </Link>

            <Link 
              href="/about" 
              onClick={() => setIsMobileMenuOpen(false)}
              className="block px-4 py-3 text-xs font-extrabold text-gray-800 hover:text-[#6B0018] hover:bg-slate-50 rounded-lg uppercase tracking-wider transition-colors"
            >
              About Us
            </Link>

            <Link 
              href="/contact" 
              onClick={() => setIsMobileMenuOpen(false)}
              className="block px-4 py-3 text-xs font-extrabold text-gray-800 hover:text-[#6B0018] hover:bg-slate-50 rounded-lg uppercase tracking-wider transition-colors"
            >
              Contact Us
            </Link>
          </nav>
        </div>

        {/* Drawer Bottom Info */}
        <div className="p-5 border-t border-gray-100 bg-slate-50 text-[11px] font-bricolage space-y-3">
          <div className="flex items-center gap-2 text-gray-700 font-semibold">
            <Phone className="w-4 h-4 text-[#6B0018]" />
            <a href="tel:+18078088990" className="hover:underline">+1(807) 808-8990</a>
          </div>
          <div className="flex items-start gap-2 text-gray-500 leading-tight">
            <MapPin className="w-4 h-4 text-[#6B0018] shrink-0 mt-0.5" />
            <span>4653 BD DES GRANDES-PRAIRIES, QC H1R 1A5, CANADA</span>
          </div>
        </div>

      </aside>

    </header>
  );
}