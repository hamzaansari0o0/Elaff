import PartnersHero from '@/components/partners/PartnersHero';
import PartnersLogoGrid from '@/components/partners/PartnersLogoGrid';
import { getPartnerLogos } from '@/lib/partnersLogos';
import { pageMetadata } from '@/lib/seo';
import AnswerBlock from '@/components/seo/AnswerBlock';
import { partnersAnswer } from '@/lib/answerBlocks';

export const metadata = pageMetadata({
  title: 'Our Partners',
  description:
    'Elaff Trade Co. works directly with FMCG brands across grocery, personal care, confectionery, and beverages, sourcing and distributing their products worldwide.',
  path: '/partners',
});

export default function PartnersPage() {
  const logos = getPartnerLogos();

  return (
    <main className="bg-white">
      <PartnersHero />
      <AnswerBlock>{partnersAnswer()}</AnswerBlock>
      <PartnersLogoGrid logos={logos} />
    </main>
  );
}
