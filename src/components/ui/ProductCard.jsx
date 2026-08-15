import Link from 'next/link';
import { ShoppingBag, Heart, Eye } from 'lucide-react';

export default function ProductCard({ product }) {
  return (
    <Link
      href={`/product/${product.slug}`}
      className="group bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between relative"
    >
      {/* Badge */}
      {product.badge && (
        <span className="absolute top-3 left-3 bg-[#6B0018] text-white text-[10px] font-extrabold px-2.5 py-1 rounded-full z-10 uppercase tracking-wider">
          {product.badge}
        </span>
      )}

      {/* Action Overlay */}
      <div className="absolute top-3 right-3 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10">
        <button className="p-2 bg-white text-gray-700 hover:text-[#6B0018] rounded-full shadow-md hover:scale-110 transition-transform">
          <Heart className="w-4 h-4" />
        </button>
        <button className="p-2 bg-white text-gray-700 hover:text-[#6B0018] rounded-full shadow-md hover:scale-110 transition-transform">
          <Eye className="w-4 h-4" />
        </button>
      </div>

      {/* Image */}
      <div className="relative w-full h-56 bg-gray-50 overflow-hidden flex items-center justify-center p-4">
        <img
          src={product.image}
          alt={product.title}
          className="max-h-full object-contain group-hover:scale-105 transition-transform duration-500"
        />
      </div>

      {/* Content */}
      <div className="p-5 flex flex-col flex-grow justify-between text-center">
        <div>
          <span className="font-bricolage text-[11px] font-bold text-gray-400 uppercase tracking-widest block mb-1">
            {product.category}
          </span>
          <h3 className="font-fraunces text-sm font-bold text-gray-800 line-clamp-2 hover:text-[#6B0018] cursor-pointer transition-colors mb-2">
            {product.title}
          </h3>
        </div>

        {/* Price & CTA */}
        <div className="mt-3">
          <div className="flex items-center justify-center gap-2 mb-3">
            <span className="font-bricolage text-base font-extrabold text-gray-900">{product.price}</span>
            {product.oldPrice && (
              <span className="font-bricolage text-xs text-gray-400 line-through">{product.oldPrice}</span>
            )}
          </div>

          <span className="w-full bg-[#6B0018] group-hover:bg-[#80001d] text-white text-xs font-bold py-2.5 px-4 rounded-lg uppercase tracking-wider transition-all duration-200 flex items-center justify-center gap-2 shadow-md group-hover:shadow-lg">
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>Place Order</span>
          </span>
        </div>
      </div>
    </Link>
  );
}