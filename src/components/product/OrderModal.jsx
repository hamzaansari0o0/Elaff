'use client';

import { useState } from 'react';
import { X } from 'lucide-react';

export default function OrderModal({ isOpen, onClose, productName }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    quantity: '',
    message: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Modal close hone par return null
  if (!isOpen) return null;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // API ya Webhook logic yahan aayega (e.g. n8n workflow / email notification)
    
    // Demo ke liye timeout lagaya hai
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSuccess(true);
      
      // 3 seconds baad modal auto-close ho jayega
      setTimeout(() => {
        setIsSuccess(false);
        setFormData({ name: '', email: '', phone: '', quantity: '', message: '' }); // Form reset
        onClose();
      }, 3000);
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Dark Blur Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Form Container */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden z-10">
        
        {/* Header */}
        <div className="bg-[#6B0018] p-5 flex items-center justify-between text-white">
          <h3 className="text-lg font-black uppercase tracking-wide">
            Request Quote / Order
          </h3>
          <button onClick={onClose} className="p-1 hover:bg-white/20 rounded-full transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 md:p-8">
          {isSuccess ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h4 className="text-xl font-bold text-gray-900 mb-2">Request Sent Successfully!</h4>
              <p className="text-sm text-gray-500">
                Our team will review your inquiry for <strong className="text-gray-800">{productName}</strong> and contact you shortly.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4 font-sans">
              
              {/* Product Info Indicator */}
              <div className="bg-slate-50 p-3 rounded-lg border border-gray-200 mb-6">
                <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1">Product</p>
                <p className="text-sm font-extrabold text-[#6B0018]">{productName}</p>
              </div>

              {/* Inputs */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-gray-700 uppercase tracking-wide mb-1">Full Name *</label>
                  <input 
                    type="text" 
                    name="name"
                    value={formData.name}
                    required
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-[#6B0018] focus:ring-1 focus:ring-[#6B0018]"
                    placeholder="John Doe"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-gray-700 uppercase tracking-wide mb-1">Email Address *</label>
                  <input 
                    type="email" 
                    name="email"
                    value={formData.email}
                    required
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-[#6B0018] focus:ring-1 focus:ring-[#6B0018]"
                    placeholder="john@company.com"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-gray-700 uppercase tracking-wide mb-1">Phone Number</label>
                  <input 
                    type="tel" 
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-[#6B0018] focus:ring-1 focus:ring-[#6B0018]"
                    placeholder="+1 (555) 000-0000"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-gray-700 uppercase tracking-wide mb-1">Order Quantity *</label>
                  <input 
                    type="text" 
                    name="quantity"
                    value={formData.quantity}
                    required
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-[#6B0018] focus:ring-1 focus:ring-[#6B0018]"
                    placeholder="e.g. 500 kg / 10 Pallets"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-gray-700 uppercase tracking-wide mb-1">Additional Details</label>
                <textarea 
                  name="message"
                  rows="3"
                  value={formData.message}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-[#6B0018] focus:ring-1 focus:ring-[#6B0018] resize-none"
                  placeholder="Tell us about your shipping requirements or any specific questions..."
                ></textarea>
              </div>

              {/* Submit Button */}
              <button 
                type="submit" 
                disabled={isSubmitting}
                className="w-full bg-[#D9822B] hover:bg-[#c27223] text-white font-extrabold text-sm py-3.5 rounded-lg uppercase tracking-widest transition-colors mt-2 disabled:opacity-70 flex justify-center items-center"
              >
                {isSubmitting ? 'Submitting...' : 'Submit Inquiry'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}