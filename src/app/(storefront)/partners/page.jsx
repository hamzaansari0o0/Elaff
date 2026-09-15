import {
  ContainerAnimated,
  ContainerStagger,
} from '@/components/ui/animated-gallery';
import PartnerLogoGroup from '@/components/partners/PartnerLogoGroup';
import StellarCardGallery from '@/components/ui/3d-image-gallery';
import { getPartnerLogos } from '@/lib/partnersLogos';

export const metadata = {
  title: 'Our Partners | Elaff Trade Co.',
  description:
    'Elaff Trade Co. works directly with FMCG brands across grocery, personal care, confectionery, and beverages, sourcing and distributing their products worldwide.',
};

const GROUP_SIZE = 12; // 3 columns x 4 rows, matches the layout each group renders
const BATCH_NUMBER = 8; // only this batch (1-indexed) is shown, the rest are dropped
const GALAXY_COUNT = 24; // separate slice from the batch below, so no logo repeats between sections

export default function PartnersPage() {
  const logos = getPartnerLogos();
  const start = (BATCH_NUMBER - 1) * GROUP_SIZE;
  const batch = logos.slice(start, start + GROUP_SIZE);
  const galaxyCards = logos.slice(0, GALAXY_COUNT).map((logo) => ({
    id: logo.src,
    imageUrl: logo.src,
    alt: logo.alt,
    title: logo.alt,
  }));

  return (
    <main className="bg-white">
      <StellarCardGallery cards={galaxyCards} title="Explore Our Partners" />

      <ContainerStagger className="relative z-10 place-self-center px-6 pt-16 pb-8 md:pt-24 text-center">
        <ContainerAnimated>
          <span className="inline-block text-[11px] font-bold text-brand-cta uppercase tracking-widest mb-3">
            Our Partners
          </span>
        </ContainerAnimated>
        <ContainerAnimated>
          <h2 className="font-fraunces text-3xl md:text-5xl font-black text-gray-900 leading-tight">
            Global Brands,
            <br />
            One Trading Partner.
          </h2>
        </ContainerAnimated>
        <ContainerAnimated className="mt-4">
          <p className="font-bricolage text-sm md:text-base text-gray-600 max-w-xl mx-auto leading-relaxed">
            We work directly with FMCG brands across grocery, personal care, confectionery, and
            beverages — sourcing, distributing, and delivering their products to businesses
            worldwide.
          </p>
        </ContainerAnimated>
      </ContainerStagger>

      <PartnerLogoGroup logos={batch} tilt />
    </main>
  );
}
