import { Users, BadgeCheck, Handshake, RefreshCw } from 'lucide-react';
import RevealText from '@/components/ui/RevealText';

// What we do (departments, services, advantages) lives in the Our Service
// section below — this grid stays to the values behind that work, so the
// two don't end up re-listing the same capabilities in different words.
const VALUES = [
  {
    icon: Users,
    title: 'Customer-First',
    description: 'Every sourcing decision starts with what the buyer on the other end actually needs.',
  },
  {
    icon: BadgeCheck,
    title: 'Accountable',
    description: 'We stand behind every shipment, from the first quote to the last mile of delivery.',
  },
  {
    icon: Handshake,
    title: 'Collaborative',
    description: 'Long-term relationships with manufacturers and buyers, built on follow-through.',
  },
  {
    icon: RefreshCw,
    title: 'Adaptable',
    description: 'Markets and regulations shift constantly — we adjust with them, not after them.',
  },
];

export default function CompanyProfile() {
  return (
    <section className="bg-white py-16 md:py-24 px-4">
      <div className="max-w-4xl mx-auto text-center mb-12 md:mb-16">
        <span className="inline-block text-[11px] font-bold text-brand-cta uppercase tracking-widest mb-3">
          Company Profile
        </span>
        <RevealText
          as="h2"
          className="font-fraunces text-2xl md:text-4xl font-black text-gray-900 mb-5 block"
        >
          Who We Are
        </RevealText>
        <div className="font-bricolage text-sm md:text-base text-gray-600 leading-relaxed space-y-4 max-w-3xl mx-auto text-left md:text-center">
          <p>
            Guided by consistency and trust, Elaff Trade Co. curates dependable product ranges from
            trusted manufacturers for distribution worldwide. We believe quality products should be
            accessible to every market — and we handle the sourcing, packaging, and logistics that
            make that possible.
          </p>
          <p>
            As a global B2B trading company, we handle import, export, wholesale, and
            distribution for wholesalers, distributors, and retailers across the globe. Our reach
            extends to international brands as well, bringing their products into new markets while
            holding to the standards those brands are built on.
          </p>
          <p>
            International trade is rarely simple — information gaps, complex processes, multiple
            countries involved, language barriers, and shifting regulations all add risk for buyers
            sourcing from abroad. Elaff exists to remove that friction, building trust-based
            relationships that reduce risk and keep every order moving efficiently from source to
            shelf. Our mission is simple: smooth, efficient delivery on every single order.
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {VALUES.map(({ icon: Icon, title, description }) => (
          <div key={title} className="bg-slate-50 rounded-2xl border border-gray-200 p-6">
            <div className="w-10 h-10 rounded-full bg-brand-navy/5 text-brand-navy flex items-center justify-center mb-4">
              <Icon className="w-5 h-5" />
            </div>
            <h3 className="font-fraunces text-sm font-bold text-gray-900 mb-1.5">{title}</h3>
            <p className="font-bricolage text-xs text-gray-500 leading-relaxed">{description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
