import PartnersHero from '@/components/partners/PartnersHero';
import PartnersLogoGrid from '@/components/partners/PartnersLogoGrid';
import { getPartnerLogos } from '@/lib/partnersLogos';

export const metadata = {
  title: 'Our Partners | Elaff Trade Co.',
  description:
    'Elaff Trade Co. works directly with FMCG brands across grocery, personal care, confectionery, and beverages, sourcing and distributing their products worldwide.',
};

export default function PartnersPage() {
  const logos = getPartnerLogos();

  return (
    <main className="bg-white">
      <PartnersHero />
      <PartnersLogoGrid logos={logos} />
    </main>
  );
}
