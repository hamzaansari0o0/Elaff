import { ChevronDown } from 'lucide-react';
import JsonLd from '@/components/seo/JsonLd';
import { faqLd } from '@/lib/seo';

// A visible Q&A list plus the matching FAQPage structured data, both built from
// the same `items` ([{ question, answer }], see lib/faqs.js) so the markup can
// never disagree with what visitors read. Uses native <details>, which works
// without JavaScript and keeps every answer in the page HTML for crawlers.
// Renders nothing when there are no items.
export default function FaqSection({ items, path, title = 'Frequently Asked Questions' }) {
  if (!items?.length) return null;

  return (
    <section className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 md:p-10">
      <JsonLd nodes={faqLd(items, path)} />
      <h2 className="font-fraunces text-xl md:text-2xl font-black text-gray-900 mb-2">{title}</h2>
      <div className="divide-y divide-gray-100">
        {items.map(({ question, answer }) => (
          <details key={question} className="group py-4">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-sm md:text-base font-bold text-gray-900 [&::-webkit-details-marker]:hidden">
              {question}
              <ChevronDown className="w-4 h-4 shrink-0 text-gray-400 transition-transform group-open:rotate-180" aria-hidden="true" />
            </summary>
            <p className="mt-3 text-sm md:text-base text-gray-600 leading-relaxed">{answer}</p>
          </details>
        ))}
      </div>
    </section>
  );
}
