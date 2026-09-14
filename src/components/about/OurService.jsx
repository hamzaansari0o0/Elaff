import { Boxes, Warehouse, FileCheck, Truck, Zap, Link2, MessageCircle, Tag } from 'lucide-react';
import RevealText from '@/components/ui/RevealText';

const SERVICES = [
  { icon: Boxes, label: 'Customized Cross-Border Procurement' },
  { icon: Warehouse, label: 'International Logistics & Warehousing' },
  { icon: FileCheck, label: 'Customs Clearance Agency Services' },
  { icon: Truck, label: 'Delivery Solutions' },
];

const SOLUTIONS = [
  {
    tag: 'Import Solutions — Global FMCG',
    title: 'Source Global Products Without Leaving Your Office',
    points: [
      'Data-driven selection: trend-informed recommendations across the EU/US, Japan/Korea, and Southeast Asia.',
      'Procurement execution: end-to-end service — brand authorization, bulk ordering, and factory quality audits.',
      'Compliance assurance: proper labeling, certifications, and bonded warehouse-to-end-user delivery.',
    ],
  },
  {
    tag: 'Export Solutions — Chinese FMCG',
    title: 'Bringing "Made in China" to Global Shelves',
    points: [
      'Curated product portfolio: time-honored foods, emerging beverages, and viral snacks.',
      'Export customization: packaging redesigned for the target market, with Halal/HACCP certification support.',
      'Door-to-door logistics: flexible LCL/FCL options with overseas warehouse integration.',
    ],
  },
];

const ADVANTAGES = [
  {
    icon: Zap,
    title: 'Agile Supply Chain',
    description: '7-day express delivery by air freight, MOQ as low as one pallet, and priority handling for urgent orders.',
  },
  {
    icon: Link2,
    title: 'Reliable Channels',
    description: 'Direct partnerships with vetted manufacturers and suppliers, keeping costs and risk to a minimum.',
  },
  {
    icon: MessageCircle,
    title: 'Responsive Communication',
    description: 'A dedicated sales team for rapid query resolution and hands-on support when it matters.',
  },
  {
    icon: Tag,
    title: 'Competitive Pricing',
    description: 'Cost optimization through bulk procurement and a streamlined supply chain.',
  },
];

export default function OurService() {
  return (
    <section className="bg-slate-50 py-16 md:py-24 px-4">
      <div className="max-w-4xl mx-auto text-center mb-10 md:mb-14">
        <span className="inline-block text-[11px] font-bold text-brand-cta uppercase tracking-widest mb-3">
          Our Service
        </span>
        <RevealText as="h2" className="font-fraunces text-2xl md:text-4xl font-black text-gray-900 mb-5 block">
          What We Can Do For You
        </RevealText>
        <p className="font-bricolage text-sm md:text-base text-gray-600 leading-relaxed max-w-3xl mx-auto">
          We specialize in the trade of leading FMCG products — sourcing premium goods worldwide for
          international buyers, and exporting Chinese FMCG brands to the world. If a brand or product
          isn&apos;t already in our catalog, reach out to our team and we&apos;ll put together a
          solution.
        </p>
      </div>

      <div className="max-w-5xl mx-auto flex flex-wrap items-center justify-center gap-3 mb-4">
        {SERVICES.map(({ icon: Icon, label }) => (
          <div
            key={label}
            className="flex items-center gap-2 bg-white rounded-full border border-gray-200 pl-3 pr-4 py-2"
          >
            <span className="w-7 h-7 rounded-full bg-brand-navy/5 text-brand-navy flex items-center justify-center shrink-0">
              <Icon className="w-3.5 h-3.5" />
            </span>
            <span className="font-bricolage text-xs font-semibold text-gray-800">{label}</span>
          </div>
        ))}
      </div>
      <p className="text-center font-bricolage text-xs text-gray-500 max-w-2xl mx-auto mb-14 md:mb-16">
        Warehousing, labeling in your language, international logistics, and customs clearance — on
        EXW, FOB, or CNF terms.
      </p>

      <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-5 mb-14 md:mb-20">
        {SOLUTIONS.map(({ tag, title, points }) => (
          <div key={tag} className="bg-white rounded-2xl border border-gray-200 p-6 md:p-8">
            <span className="inline-block text-[10px] font-bold text-brand-cta uppercase tracking-widest mb-2">
              {tag}
            </span>
            <h3 className="font-fraunces text-lg font-bold text-gray-900 mb-4">{title}</h3>
            <ul className="space-y-2.5">
              {points.map((point) => (
                <li key={point} className="font-bricolage text-xs text-gray-600 leading-relaxed pl-4 relative">
                  <span className="absolute left-0 top-1.5 w-1.5 h-1.5 rounded-full bg-brand-cta" />
                  {point}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="max-w-4xl mx-auto text-center mb-10">
        <RevealText as="h3" className="font-fraunces text-xl md:text-2xl font-black text-gray-900 mb-2 block">
          Core Advantages
        </RevealText>
        <p className="font-bricolage text-sm text-gray-600">
          We value quality, keep our promises, and put ourselves in our customers&apos; shoes.
        </p>
      </div>
      <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {ADVANTAGES.map(({ icon: Icon, title, description }) => (
          <div key={title} className="bg-white rounded-2xl border border-gray-200 p-6">
            <div className="w-10 h-10 rounded-full bg-brand-navy/5 text-brand-navy flex items-center justify-center mb-4">
              <Icon className="w-5 h-5" />
            </div>
            <h4 className="font-fraunces text-sm font-bold text-gray-900 mb-1.5">{title}</h4>
            <p className="font-bricolage text-xs text-gray-500 leading-relaxed">{description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
