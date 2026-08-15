'use client';

import { useState } from 'react';

export default function Newsletter() {
  const [email, setEmail] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (email) {
      alert(`Subscribed successfully with: ${email}`);
      setEmail('');
    }
  };

  return (
    <section className="relative bg-slate-900 py-16 px-4 my-12 overflow-hidden">
      <img
        src="https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?q=80&w=1600&auto=format&fit=crop"
        alt="Newsletter background"
        className="absolute inset-0 w-full h-full object-cover opacity-25"
      />
      <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/75 to-black/90"></div>

      <div className="relative z-10 max-w-3xl mx-auto text-center text-white">
        <h2 className="font-fraunces text-2xl md:text-4xl font-black uppercase tracking-wider mb-2">
          Signup For Newsletter
        </h2>
        <p className="font-bricolage text-xs md:text-sm text-gray-300 mb-8 tracking-wide">
          Don't Miss A Sale! Enter Your Email And Get The Very Latest Coupon Codes & Deals.
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row items-center justify-center gap-3 max-w-md mx-auto">
          <input
            type="email"
            placeholder="Your Email Address..."
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full bg-white/10 backdrop-blur-md border border-white/30 text-white placeholder-gray-400 px-4 py-3 rounded-lg text-sm outline-none focus:border-amber-400 transition-colors"
          />
          <button
            type="submit"
            className="w-full sm:w-auto bg-[#6B0018] hover:bg-[#80001d] text-white text-xs font-bold px-8 py-3.5 rounded-lg uppercase tracking-wider transition-all shadow-lg active:scale-95"
          >
            Signup
          </button>
        </form>
      </div>
    </section>
  );
}