import Link from 'next/link';

export default function AnnouncementBar() {
  return (
    <div className="bg-[#6B0018] text-white py-2 px-4 md:px-8 border-b border-white/10 overflow-hidden relative z-50">
      {/* CSS Animation for Continuous Marquee */}
      <style>{`
        @keyframes marquee {
          0% { transform: translateX(0%); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee-smooth {
          display: flex;
          width: max-content;
          animation: marquee 22s linear infinite;
        }
        .animate-marquee-smooth:hover {
          animation-play-state: paused;
        }
      `}</style>

      {/* 💻 DESKTOP VIEW (md and above) */}
      <div className="hidden md:flex max-w-7xl mx-auto justify-between items-center text-[11px] font-medium tracking-wide">
        {/* Left Section: Address & Phone */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <svg className="w-3.5 h-3.5 text-amber-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span>4653 BD DES GRANDES-PRAIRIES, SAINT-LÉONARD, QC H1R 1A5, CANADA</span>
          </div>
          <span className="opacity-40">|</span>
          <div className="flex items-center gap-1.5">
            <svg className="w-3.5 h-3.5 text-amber-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
            </svg>
            <a href="tel:+18078088990" className="hover:text-amber-400 transition-colors">+1(807) 808-8990</a>
          </div>
        </div>

        {/* Right Section: Quick Links */}
        <div className="flex items-center gap-4 font-semibold tracking-wider">
          <Link href="/deals" className="hover:text-amber-400 uppercase transition-colors">Deals</Link>
          <span className="opacity-40">|</span>
          <Link href="/privacy-policy" className="hover:text-amber-400 uppercase transition-colors">Privacy Policy</Link>
          <span className="opacity-40">|</span>
          <Link href="/contact" className="hover:text-amber-400 uppercase transition-colors">Get In Touch</Link>
          <span className="opacity-40">|</span>
          <Link href="/account" className="hover:text-amber-400 uppercase transition-colors">My Account</Link>
        </div>
      </div>

      {/* 📱 MOBILE & TABLET VIEW (below md): Continuous Moving Marquee */}
      <div className="md:hidden flex overflow-hidden whitespace-nowrap select-none py-0.5">
        <div className="animate-marquee-smooth flex items-center gap-6 text-[10px] font-medium tracking-wide">
          
          {/* Block 1 */}
          <div className="flex items-center gap-5">
            <div className="flex items-center gap-1">
              <svg className="w-3 h-3 text-amber-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span>4653 BD DES GRANDES-PRAIRIES, QC H1R 1A5, CANADA</span>
            </div>
            <span className="text-amber-400 font-bold">•</span>
            <div className="flex items-center gap-1">
              <svg className="w-3 h-3 text-amber-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
              <a href="tel:+18078088990" className="hover:underline font-bold">+1(807) 808-8990</a>
            </div>
            <span className="text-amber-400 font-bold">•</span>
            <Link href="/deals" className="font-bold uppercase tracking-wider text-amber-300">🔥 HOT DEALS</Link>
            <span className="text-amber-400 font-bold">•</span>
            <Link href="/contact" className="uppercase font-semibold hover:text-amber-300">GET IN TOUCH</Link>
            <span className="text-amber-400 font-bold">•</span>
            <Link href="/account" className="uppercase font-semibold hover:text-amber-300">MY ACCOUNT</Link>
          </div>

          {/* Block 2 (Duplicated for Seamless Infinite Loop) */}
          <div className="flex items-center gap-5">
            <div className="flex items-center gap-1">
              <svg className="w-3 h-3 text-amber-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span>4653 BD DES GRANDES-PRAIRIES, QC H1R 1A5, CANADA</span>
            </div>
            <span className="text-amber-400 font-bold">•</span>
            <div className="flex items-center gap-1">
              <svg className="w-3 h-3 text-amber-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
              <a href="tel:+18078088990" className="hover:underline font-bold">+1(807) 808-8990</a>
            </div>
            <span className="text-amber-400 font-bold">•</span>
            <Link href="/deals" className="font-bold uppercase tracking-wider text-amber-300">🔥 HOT DEALS</Link>
            <span className="text-amber-400 font-bold">•</span>
            <Link href="/contact" className="uppercase font-semibold hover:text-amber-300">GET IN TOUCH</Link>
            <span className="text-amber-400 font-bold">•</span>
            <Link href="/account" className="uppercase font-semibold hover:text-amber-300">MY ACCOUNT</Link>
          </div>

        </div>
      </div>
    </div>
  );
}