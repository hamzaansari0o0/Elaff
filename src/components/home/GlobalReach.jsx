import { WorldMap } from '@/components/ui/world-map';
import RevealText from '@/components/ui/RevealText';

// Every route starts from our sourcing hub in China, fanning out to the
// regions that matter most to our buyers — visualizing the "China to
// Worldwide" trade network the rest of the site's copy references.
const TRADE_ROUTES = [
  { start: { lat: 31.2304, lng: 121.4737 }, end: { lat: 25.2048, lng: 55.2708 } }, // Shanghai -> Dubai (Gulf)
  { start: { lat: 31.2304, lng: 121.4737 }, end: { lat: 51.5074, lng: -0.1278 } }, // Shanghai -> London (UK)
  { start: { lat: 31.2304, lng: 121.4737 }, end: { lat: 34.0522, lng: -118.2437 } }, // Shanghai -> Los Angeles (USA)
  { start: { lat: 31.2304, lng: 121.4737 }, end: { lat: -26.2041, lng: 28.0473 } }, // Shanghai -> Johannesburg (South Africa)
];

export default function GlobalReach() {
  return (
    // -mb-16 cancels the Footer's own mt-16 (shared across every storefront
    // page), so this section — unlike other pages ending in plain content —
    // sits flush against it with no gap.
    <section className="bg-black pt-16 md:pt-24 pb-0 -mb-16 px-4 overflow-hidden">
      <div className="max-w-2xl mx-auto text-center mb-8">
        <RevealText as="h2" className="font-fraunces text-2xl md:text-4xl font-black text-white mb-3 block">
          One Trusted Source, Worldwide Reach
        </RevealText>
        <p className="font-bricolage text-xs md:text-sm text-gray-400 max-w-xl mx-auto">
          From our sourcing hubs in China to wholesalers, distributors, and retailers across
          the Gulf, the UK, the USA, and South Africa — reliable B2B trade, wherever your
          business operates.
        </p>
      </div>
      <div className="max-w-5xl lg:max-w-6xl mx-auto">
        <WorldMap dots={TRADE_ROUTES} lineColor="#0ea5e9" />
      </div>
    </section>
  );
}
