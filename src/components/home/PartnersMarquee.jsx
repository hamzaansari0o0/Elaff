'use client';

import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, EffectCoverflow } from 'swiper/modules';
import RevealText from '@/components/ui/RevealText';

import 'swiper/css';
import 'swiper/css/effect-coverflow';

const DEFAULT_PARTNERS = [
  { name: 'Storck', src: '/partners/1.PNG' },
  { name: 'Haribo', src: '/partners/2.PNG' },
  { name: 'nimm2', src: '/partners/3.PNG' },
  { name: 'Nutella', src: '/partners/4.PNG' },
  { name: 'Kinder Bueno', src: '/partners/5.PNG' },
  { name: 'Lotus', src: '/partners/7.PNG' },
  { name: "Fox's", src: '/partners/8.PNG' },
  { name: 'KitKat', src: '/partners/9.PNG' },
  { name: 'Mondelez International', src: '/partners/10.PNG' },
  { name: 'Loacker', src: '/partners/11.PNG' },
  { name: 'Mars', src: '/partners/13.PNG' },
  { name: 'Knoppers', src: '/partners/14.PNG' },
  { name: "Lay's", src: '/partners/15.PNG' },
  { name: 'Ferrero Rocher', src: '/partners/16.PNG' },
  { name: 'Lindt', src: '/partners/17.PNG' },
  { name: 'Mars', src: '/partners/18.PNG' },
  { name: 'Ritter Sport', src: '/partners/19.PNG' },
  { name: 'Maltesers', src: '/partners/20.PNG' },
  { name: 'Godiva Chocolatier', src: '/partners/21.PNG' },
  { name: 'Toblerone', src: '/partners/23.PNG' },
  { name: 'Cadbury', src: '/partners/25.PNG' },
  { name: 'Milka', src: '/partners/26.PNG' },
  { name: 'Chocolat Mathez', src: '/partners/28.PNG' },
  { name: 'Quality Street', src: '/partners/29.PNG' },
  { name: 'merci', src: '/partners/30.PNG' },
];

// Repeats the partner list so the loop always has enough slides to read as a
// continuous flow, regardless of whether there are 4 logos or 12.
const MIN_SLIDES = 14;
function buildSlides(partners) {
  if (!partners || partners.length === 0) return [];
  const repeated = [];
  while (repeated.length < MIN_SLIDES) repeated.push(...partners);
  return repeated.map((p, i) => ({ ...p, key: `${p.name}-${i}` }));
}

export default function PartnersMarquee({ partners = DEFAULT_PARTNERS }) {
  const slides = buildSlides(partners);
  if (slides.length === 0) return null;

  return (
    <section className="max-w-7xl mx-auto px-4 py-10 md:py-14">
      <div className="text-center mb-8 md:mb-10">
        <span className="text-brand-cyan text-xs font-extrabold uppercase tracking-widest">Trusted By</span>
        <RevealText as="h2" className="font-fraunces text-2xl md:text-3xl font-black text-gray-900 uppercase mt-1 block">
          Our Partners
        </RevealText>
      </div>

      {/* Constant-velocity marquee: autoplay's delay is effectively zero, so one
          slide transition begins the instant the last one ends, and the linear
          timing function (below) keeps that handoff from reading as a stutter. */}
      <Swiper
        modules={[Autoplay, EffectCoverflow]}
        effect="coverflow"
        centeredSlides
        loop
        slidesPerView="auto"
        speed={5000}
        allowTouchMove={false}
        autoplay={{ delay: 1, disableOnInteraction: false, pauseOnMouseEnter: true }}
        coverflowEffect={{ rotate: 12, stretch: 0, depth: 90, modifier: 1, slideShadows: false }}
        className="partners-swiper"
      >
        {slides.map((p) => (
          <SwiperSlide key={p.key} style={{ width: 176 }}>
            <div className="h-20 md:h-24 w-44 flex items-center justify-center bg-white rounded-xl border border-gray-100 shadow-sm px-3">
              {p.src ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={p.src} alt={p.name} className="h-16 md:h-20 w-full object-contain" />
              ) : (
                <span className="text-sm font-black text-gray-400 uppercase tracking-wide">{p.name}</span>
              )}
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </section>
  );
}
