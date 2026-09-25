import { ImageStreamHero } from '@/components/ui/image-stream-hero';
import RevealText from '@/components/ui/RevealText';

export default function AboutHero({ images }) {
  return (
    <ImageStreamHero images={images} className="h-[70vh] min-h-[480px] w-full">
      {/* Scrim — keeps the white text readable against a moving photo
          corridor without resorting to a text-shadow. */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/55 via-black/35 to-black/55" />

      <div className="relative z-10 flex h-full flex-col items-center justify-center gap-5 px-6 text-center">
        <RevealText
          as="h1"
          trigger="load"
          className="font-fraunces text-4xl sm:text-5xl md:text-6xl 2xl:text-7xl 3xl:text-8xl font-black text-white leading-[1.05] tracking-tight"
        >
          Trade Built
          <br />
          On Trust.
        </RevealText>
        <p className="max-w-xl font-bricolage text-sm md:text-base text-white/85 leading-relaxed">
          Elaff Trade Co. is the B2B name businesses already know — sourcing and delivering grocery,
          agricultural, frozen, and confectionery products to partners and international
          brands worldwide.
        </p>
      </div>
    </ImageStreamHero>
  );
}
