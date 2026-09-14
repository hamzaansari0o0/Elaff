import RevealText from '@/components/ui/RevealText';

export default function OurProcess() {
  return (
    <section className="bg-white py-16 md:py-24 px-4">
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-14 items-center">
        <div className="order-2 lg:order-1">
          <span className="inline-block text-[11px] font-bold text-brand-cta uppercase tracking-widest mb-3">
            How It Works
          </span>
          <RevealText as="h2" className="font-fraunces text-2xl md:text-4xl font-black text-gray-900 mb-5 block">
            From Warehouse to Your Dock
          </RevealText>
          <div className="font-bricolage text-sm md:text-base text-gray-600 leading-relaxed space-y-4">
            <p>
              Every order is tracked from the moment it arrives at our overseas warehouse — packed,
              labeled, and checked against your packing list — through loading and full customs
              clearance, all the way to delivery at your dock.
            </p>
            <p>
              Certificates, commercial invoices, packing lists, certificates of origin, and customs
              forms are prepared and sent alongside every shipment, so nothing holds up your delivery
              once it reaches you.
            </p>
          </div>
        </div>

        <div className="order-1 lg:order-2">
          <div className="rounded-2xl overflow-hidden border border-gray-200 shadow-sm">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/about/fulfillment-process.jpeg"
              alt="Our fulfillment process: goods arrive at our overseas warehouse, get packed and labeled, are examined, loaded, and delivered to the dock with full customs clearance documents, from our domestic warehouse."
              className="w-full h-auto object-contain"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
