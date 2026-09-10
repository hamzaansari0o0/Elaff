// Same trust metrics shown on the homepage banner (verified status, export
// reach, response time) — kept consistent site-wide instead of the generic
// "Loved by our Customers, 5000+ Reviews" retail claim this replaced.
function buildFeatures(companySettings) {
  const exportCount = companySettings?.exportMarkets?.length || 0;

  return [
    {
      icon: (
        <svg className="w-4 h-4 text-brand-amber shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
          />
        </svg>
      ),
      content: (
        <>
          <strong className="font-extrabold text-gray-800 uppercase tracking-widest">FMCG</strong> — Fast Moving
          Consumer Goods
        </>
      ),
    },
    {
      icon: (
        <svg className="w-4 h-4 text-brand-amber shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
        </svg>
      ),
      content: (
        <>
          <strong className="font-extrabold text-gray-800 uppercase tracking-widest">
            {companySettings?.verified ? companySettings.verifiedLabel || 'Verified Supplier' : 'Verified Supplier'}
          </strong>
        </>
      ),
    },
    {
      icon: (
        <svg className="w-4 h-4 text-brand-amber shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      ),
      content: (
        <>
          {exportCount > 0 ? (
            <>
              <strong className="font-extrabold text-gray-800 uppercase tracking-widest">Exporting</strong> to{' '}
              {exportCount}+ Countries
            </>
          ) : (
            <strong className="font-extrabold text-gray-800 uppercase tracking-widest">Global Export Network</strong>
          )}
        </>
      ),
    },
    {
      icon: (
        <svg className="w-4 h-4 text-brand-amber shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      ),
      content: companySettings?.responseTime ? (
        <>
          <strong className="font-extrabold text-gray-800 uppercase tracking-widest">
            {companySettings.responseTime}
          </strong>{' '}
          Quote Response
        </>
      ) : (
        <strong className="font-extrabold text-gray-800 uppercase tracking-widest">Fast Quote Turnaround</strong>
      ),
    },
  ];
}

export default function FeatureBar({ companySettings }) {
  const FEATURES = buildFeatures(companySettings);

  return (
    <section className="bg-slate-50 border-b border-gray-200 py-3 md:px-8">
      {/* 💻 DESKTOP (md and above): one row, divided columns, no motion */}
      <div className="hidden md:flex max-w-7xl mx-auto justify-between items-center divide-x divide-gray-200 text-center">
        {FEATURES.map((feature, idx) => (
          <div
            key={idx}
            className="w-1/4 py-1 flex items-center justify-center gap-2.5 text-xs text-gray-600 font-bricolage tracking-wide"
          >
            {feature.icon}
            <span>{feature.content}</span>
          </div>
        ))}
      </div>

      {/* 📱 MOBILE & TABLET (below md): single line, continuous right-to-left marquee */}
      <style>{`
        @keyframes feature-marquee-rtl {
          0% { transform: translateX(0%); }
          100% { transform: translateX(-50%); }
        }
        .animate-feature-marquee {
          display: flex;
          width: max-content;
          animation: feature-marquee-rtl 18s linear infinite;
        }
        .animate-feature-marquee:hover {
          animation-play-state: paused;
        }
      `}</style>
      <div className="md:hidden overflow-hidden whitespace-nowrap select-none px-4">
        <div className="animate-feature-marquee items-center gap-10">
          {[0, 1].map((copy) => (
            <div key={copy} className="flex items-center gap-10 shrink-0" aria-hidden={copy === 1}>
              {FEATURES.map((feature, idx) => (
                <span key={idx} className="flex items-center gap-2 text-[11px] text-gray-600 font-bricolage tracking-wide">
                  {feature.icon}
                  {feature.content}
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
