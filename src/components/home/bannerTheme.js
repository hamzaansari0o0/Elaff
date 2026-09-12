// Per-category accent color used by both banner variants (BannerPanels for
// tablet/desktop, MobileBannerCarousel for phones) so the same product
// category always reads the same color, and heading + subtitle always match.
export const CATEGORY_THEME = {
  grocery: { text: 'text-green-900', divider: 'bg-green-900/50' },
  agricultural: { text: 'text-black', divider: 'bg-black/50' },
  frozen: { text: 'text-brand-navy', divider: 'bg-brand-navy/50' },
  confectionery: { text: 'text-red-900', divider: 'bg-red-900/50' },
};

export const DEFAULT_THEME = { text: 'text-sky-300', divider: 'bg-sky-300/50' };
