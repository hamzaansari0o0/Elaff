export default function FeatureBar() {
  return (
    <section className="bg-slate-50 border-b border-gray-200 py-3 px-4 md:px-8">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center divide-y md:divide-y-0 md:divide-x divide-gray-200 text-center">
        
        {/* Item 1 */}
        <div className="w-full md:w-1/3 py-2.5 md:py-1 flex items-center justify-center gap-2.5 text-[11px] md:text-xs text-gray-600 font-bricolage tracking-wide">
          <svg className="w-4 h-4 text-brand-amber shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
          </svg>
          <span>
            <strong className="font-extrabold text-gray-800 uppercase tracking-widest">Fast Delivery</strong> World Wide*
            <a href="#" className="ml-1 text-brand-navy hover:text-brand-amber hover:underline transition-colors font-bold">Learn more</a>
          </span>
        </div>

        {/* Item 2 */}
        <div className="w-full md:w-1/3 py-2.5 md:py-1 flex items-center justify-center gap-2.5 text-[11px] md:text-xs text-gray-600 font-bricolage tracking-wide">
          <svg className="w-4 h-4 text-brand-amber shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
          <span>
            Loved by our Customers. <strong className="font-extrabold text-gray-800 uppercase tracking-widest">5000+ Reviews</strong>
          </span>
        </div>

        {/* Item 3 */}
        <div className="w-full md:w-1/3 py-2.5 md:py-1 flex items-center justify-center gap-2.5 text-[11px] md:text-xs text-gray-600 font-bricolage tracking-wide">
          <svg className="w-4 h-4 text-brand-amber shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
          <span>
            <strong className="font-extrabold text-gray-800 uppercase tracking-widest">24/7 Phone</strong> and <strong className="font-extrabold text-gray-800 uppercase tracking-widest">Email Support</strong>
          </span>
        </div>

      </div>
    </section>
  );
}