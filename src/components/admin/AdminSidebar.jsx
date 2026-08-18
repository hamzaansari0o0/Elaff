'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { LayoutDashboard, Package, FolderTree, Mail, AtSign, LogOut, Menu, X } from 'lucide-react';

const NAV_ITEMS = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard, exact: true },
  { href: '/admin/products', label: 'Products', icon: Package },
  { href: '/admin/collections', label: 'Collections', icon: FolderTree },
  { href: '/admin/inquiries', label: 'Inquiries', icon: Mail },
  { href: '/admin/subscribers', label: 'Subscribers', icon: AtSign },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);

  // Close the drawer automatically whenever the route changes.
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/admin/login');
    router.refresh();
  }

  return (
    <>
      {/* Mobile top bar */}
      <div className="lg:hidden flex items-center justify-between bg-white border-b border-gray-200 px-4 py-3 sticky top-0 z-30">
        <div className="flex flex-col leading-none">
          <span className="font-fraunces text-base font-black text-brand-navy">KONAVA</span>
          <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Admin Panel</span>
        </div>
        <button
          onClick={() => setIsOpen(true)}
          className="p-2 text-gray-700 hover:text-brand-navy transition-colors"
          aria-label="Open menu"
        >
          <Menu className="w-6 h-6" />
        </button>
      </div>

      {/* Backdrop (mobile drawer only) */}
      <div
        className={`fixed inset-0 bg-black/50 z-40 lg:hidden transition-opacity duration-200 ${
          isOpen ? 'opacity-100 visible' : 'opacity-0 invisible'
        }`}
        onClick={() => setIsOpen(false)}
      />

      {/* Sidebar: off-canvas drawer on mobile, static column on desktop */}
      <aside
        className={`fixed lg:sticky top-0 left-0 h-screen w-64 lg:w-60 shrink-0 bg-white border-r border-gray-200 z-50 flex flex-col justify-between transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div>
          <div className="flex items-center justify-between p-5 border-b border-gray-200">
            <div>
              <h1 className="font-fraunces text-lg font-black text-brand-navy">KONAVA</h1>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Admin Panel</p>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="lg:hidden p-1 text-gray-500 hover:text-brand-navy transition-colors"
              aria-label="Close menu"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <nav className="p-3 space-y-1">
            {NAV_ITEMS.map((item) => {
              const isActive = item.exact ? pathname === item.href : pathname.startsWith(item.href);
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-semibold transition-colors ${
                    isActive
                      ? 'bg-brand-navy text-white'
                      : 'text-gray-600 hover:bg-slate-50 hover:text-brand-navy'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="p-3 border-t border-gray-200">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-semibold text-gray-600 hover:bg-red-50 hover:text-red-600 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>
      </aside>
    </>
  );
}
