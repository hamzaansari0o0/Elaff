import Link from 'next/link';
import { ChevronRight } from 'lucide-react';

export default function SectionHeader({ title, link = "/shop" }) {
  return (
    <div className="flex items-center justify-between border-b border-gray-200 pb-3 mb-8">
      <h2 className="font-fraunces text-lg md:text-xl font-extrabold text-gray-900 tracking-wider uppercase border-b-2 border-[#6B0018] -mb-[14px] pb-3">
        {title}
      </h2>
      <Link
        href={link}
        className="font-bricolage text-xs font-bold text-gray-500 hover:text-[#6B0018] flex items-center gap-1 tracking-wider uppercase transition-colors"
      >
        <span>Browse All</span>
        <ChevronRight className="w-4 h-4" />
      </Link>
    </div>
  );
}