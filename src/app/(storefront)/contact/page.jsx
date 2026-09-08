import { MapPin, MessageCircle, Clock, Phone, Mail } from 'lucide-react';
import ContactForm from '@/components/contact/ContactForm';
import RevealText from '@/components/ui/RevealText';
import { getCompanySettings } from '@/lib/settings';

export const metadata = {
  title: 'Contact Us | Elaff Trade Co.',
  description: 'Get in touch with Elaff Trade Co. for product inquiries, wholesale orders, and support.',
};

// Without this, Next.js statically renders the page once at build time and
// admin edits to CompanySettings never show up until the next full deploy.
export const revalidate = 60;

const DEFAULT_ADDRESS =
  'Qusais Industrial Area 1, Near Master Global Cargo, Gate # 7, Warehouse # B20, Bin Sout Warehouse, Dubai';
const DEFAULT_INTRO =
  "Have a question about an order, a product, or our wholesale terms? Send us a message and our team will get back to you.";
const DEFAULT_HOURS = 'Monday - Saturday: 9:00 AM - 6:00 PM';

export default async function ContactPage() {
  const settings = await getCompanySettings();

  const address = settings.address || DEFAULT_ADDRESS;
  const intro = settings.contactIntro || DEFAULT_INTRO;
  const hours = settings.supportHours || DEFAULT_HOURS;
  const responseTime = settings.responseTime || '24 hours';

  return (
    <main className="min-h-screen bg-slate-50">
      <section className="max-w-7xl mx-auto px-4 py-10 md:py-16">
        <div className="text-center max-w-2xl mx-auto mb-10 md:mb-14">
          <span className="inline-block text-[11px] font-bold text-brand-cta uppercase tracking-widest mb-2">
            Get In Touch
          </span>
          <RevealText
            as="h1"
            trigger="load"
            className="font-fraunces text-3xl md:text-4xl font-black text-gray-900 uppercase tracking-tight block"
          >
            Contact Us
          </RevealText>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1.4fr_1fr] gap-6 md:gap-8 items-start">
          <ContactForm />

          {/* Right side — dynamic company info, editable from Admin > Company Settings > Contact Page */}
          <div className="space-y-5">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-full bg-brand-navy/5 text-brand-navy flex items-center justify-center shrink-0">
                  <MapPin className="w-4.5 h-4.5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-gray-900 mb-1">Correspondence Address</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">{address}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-full bg-brand-navy/5 text-brand-navy flex items-center justify-center shrink-0">
                  <MessageCircle className="w-4.5 h-4.5" />
                </div>
                <div className="min-w-0">
                  <h3 className="text-sm font-bold text-gray-900 mb-1">Get In Touch</h3>
                  <p className="text-sm text-gray-500 leading-relaxed mb-2">{intro}</p>
                  <div className="space-y-1">
                    {settings.email && (
                      <a
                        href={`mailto:${settings.email}`}
                        className="flex items-center gap-1.5 text-xs font-semibold text-brand-navy hover:underline"
                      >
                        <Mail className="w-3.5 h-3.5" /> {settings.email}
                      </a>
                    )}
                    {settings.phone && (
                      <a
                        href={`tel:${settings.phone}`}
                        className="flex items-center gap-1.5 text-xs font-semibold text-brand-navy hover:underline"
                      >
                        <Phone className="w-3.5 h-3.5" /> {settings.phone}
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-full bg-brand-navy/5 text-brand-navy flex items-center justify-center shrink-0">
                  <Clock className="w-4.5 h-4.5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-gray-900 mb-1">Support &amp; Availability</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">{hours}</p>
                  <p className="text-sm text-gray-500 leading-relaxed mt-1">
                    Our team ensures a response to all your inquiries within {responseTime}.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
