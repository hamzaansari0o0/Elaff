export const COLLECTIONS = [
  {
    slug: "frozen-food",
    title: "Frozen Food",
    description: "Premium quality frozen food products sourced globally, kept at optimal temperature from warehouse to your door."
  },
  {
    slug: "confectionery",
    title: "Confectionery",
    description: "A wide range of chocolates, candies, and sweet treats from the world's most trusted brands."
  },
  {
    slug: "beverages",
    title: "Beverages & Beer",
    description: "Imported beers, spirits, and soft drinks available in bulk multipacks for wholesale distribution."
  },
  {
    slug: "agricultural",
    title: "Agricultural Products",
    description: "Bulk grains, feed, and raw agricultural commodities direct from farmers at competitive wholesale prices."
  },
  {
    slug: "cooking-oil",
    title: "Cooking Oil",
    description: "Refined and pure cooking oils packaged for both retail and bulk commercial use."
  },
  {
    slug: "tea-coffee",
    title: "Tea & Coffee",
    description: "Premium tea leaves and roasted coffee sourced from top growing regions around the world."
  }
];

// Single source of truth for every product. Homepage sections (Latest On Sale,
// Weekly Featured, Bestsellers) and category cards are all derived from this list
// so every product card and category link always resolves to a real page.
export const PRODUCTS = [
  {
    id: 1001,
    slug: "premium-corn-gluten-meal",
    sku: "CGM-8001-A",
    title: "Premium Corn Gluten Meal",
    category: "Agricultural Products",
    collectionSlug: "agricultural",
    featured: true,
    price: "$205.00 / ton",
    tags: {},
    shortDescription: "High-quality, nutrient-rich corn gluten meal perfect for livestock feed and agricultural applications. Sustainably sourced and processed to maintain maximum protein content.",
    fullDescription: "<p>Our Premium Corn Gluten Meal is a high-protein feed ingredient used widely in poultry, swine, and cattle diets. It provides an excellent source of energy and essential amino acids.</p>",
    specifications: [
      { label: "Protein Content", value: "60% Min" },
      { label: "Moisture", value: "10% Max" },
      { label: "Fiber", value: "2.5% Max" },
      { label: "Packaging", value: "50kg Bags / Bulk Jumbo Bags" }
    ],
    images: [
      "https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&w=800&q=80"
    ]
  },
  {
    id: 1002,
    slug: "premium-alfalfa-hay-bales",
    sku: "AHB-3320-B",
    title: "Premium Alfalfa Hay Bales",
    category: "Agricultural Products",
    collectionSlug: "agricultural",
    featured: true,
    price: "$185.00 / ton",
    tags: { bestseller: true },
    shortDescription: "Sun-cured alfalfa hay bales, rich in protein and fiber, ideal for livestock and dairy cattle feeding programs.",
    fullDescription: "<p>Harvested at peak maturity and sun-cured to lock in nutrients, our Alfalfa Hay Bales are a trusted feed source for dairy and beef operations worldwide.</p>",
    specifications: [
      { label: "Crude Protein", value: "18% Min" },
      { label: "Moisture", value: "12% Max" },
      { label: "Bale Weight", value: "550-650 kg" },
      { label: "Packaging", value: "Compressed Bales" }
    ],
    images: [
      "https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&w=800&q=80"
    ]
  },
  {
    id: 1003,
    slug: "yellow-corn-grain-bulk",
    sku: "YCG-1145-C",
    title: "Yellow Corn Grain Bulk",
    category: "Agricultural Products",
    collectionSlug: "agricultural",
    featured: false,
    price: "$195.00 / ton",
    tags: { bestseller: true },
    shortDescription: "Non-GMO yellow corn grain supplied in bulk for animal feed, food processing, and industrial applications.",
    fullDescription: "<p>Our Yellow Corn Grain is carefully cleaned and graded, offering consistent quality for feed mills, distilleries, and food manufacturers.</p>",
    specifications: [
      { label: "Moisture", value: "14% Max" },
      { label: "Foreign Matter", value: "1% Max" },
      { label: "Broken Kernels", value: "3% Max" },
      { label: "Packaging", value: "Bulk Vessel / 50kg Bags" }
    ],
    images: [
      "https://images.unsplash.com/photo-1551754655-cd27e38d2076?auto=format&fit=crop&w=800&q=80"
    ]
  },
  {
    id: 1004,
    slug: "organic-soybean-meal",
    sku: "OSM-4471-D",
    title: "Organic Soybean Meal",
    category: "Agricultural Products",
    collectionSlug: "agricultural",
    featured: false,
    price: "$210.00 / ton",
    tags: { bestseller: true },
    shortDescription: "Certified organic soybean meal, a high-protein feed ingredient for poultry, swine, and dairy livestock.",
    fullDescription: "<p>Our Organic Soybean Meal is processed from certified organic soybeans, offering a premium protein source free of synthetic pesticides and GMOs.</p>",
    specifications: [
      { label: "Protein Content", value: "48% Min" },
      { label: "Moisture", value: "12% Max" },
      { label: "Certification", value: "Certified Organic" },
      { label: "Packaging", value: "50kg Bags / Bulk Jumbo Bags" }
    ],
    images: [
      "https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=800&q=80"
    ]
  },
  {
    id: 1005,
    slug: "whole-grain-wheat",
    sku: "WGW-6620-E",
    title: "Whole Grain Wheat",
    category: "Agricultural Products",
    collectionSlug: "agricultural",
    featured: false,
    price: "$220.00 / ton",
    tags: { bestseller: true },
    shortDescription: "Premium whole grain wheat, milled and unmilled options available for bulk food processing and feed use.",
    fullDescription: "<p>Sourced from trusted growing regions, our Whole Grain Wheat is cleaned and graded to meet international milling and feed industry standards.</p>",
    specifications: [
      { label: "Moisture", value: "13% Max" },
      { label: "Test Weight", value: "78 kg/hl Min" },
      { label: "Protein", value: "11% Min" },
      { label: "Packaging", value: "Bulk Vessel / 50kg Bags" }
    ],
    images: [
      "https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&w=800&q=80"
    ]
  },
  {
    id: 1006,
    slug: "twix-chocolate-multipack",
    sku: "TWX-2210-M",
    title: "Twix Chocolate Multipack",
    category: "Confectionery",
    collectionSlug: "confectionery",
    featured: true,
    price: "$12.50",
    oldPrice: "$15.00",
    badge: "HOT",
    tags: { onSale: true },
    shortDescription: "Crunchy cookie, smooth caramel, and rich chocolate — Twix multipacks ready for retail shelves and distribution.",
    fullDescription: "<p>Sourced directly from authorized distributors, our Twix Multipacks arrive fresh and shelf-ready for supermarkets and convenience stores.</p>",
    specifications: [
      { label: "Units per Case", value: "48 Bars" },
      { label: "Shelf Life", value: "12 Months" },
      { label: "Storage", value: "Cool & Dry Place" },
      { label: "Packaging", value: "Retail Multipack Box" }
    ],
    images: [
      "https://images.unsplash.com/photo-1621939514649-280e2ee25f60?auto=format&fit=crop&w=800&q=80"
    ]
  },
  {
    id: 1007,
    slug: "snickers-chocolate-bars-box",
    sku: "SNK-3312-N",
    title: "Snickers Chocolate Bars Box",
    category: "Confectionery",
    collectionSlug: "confectionery",
    featured: false,
    price: "$18.00",
    oldPrice: "$22.00",
    badge: "SALE",
    tags: { onSale: true },
    shortDescription: "Peanuts, caramel, nougat, and milk chocolate — a full box of Snickers bars ready for retail distribution.",
    fullDescription: "<p>Snickers Chocolate Bars Box is a top-selling confectionery item, supplied fresh with full shelf-life guarantee for retailers.</p>",
    specifications: [
      { label: "Units per Box", value: "48 Bars" },
      { label: "Shelf Life", value: "12 Months" },
      { label: "Storage", value: "Cool & Dry Place" },
      { label: "Packaging", value: "Retail Display Box" }
    ],
    images: [
      "https://images.unsplash.com/photo-1582293041079-7814c2f12063?auto=format&fit=crop&w=800&q=80"
    ]
  },
  {
    id: 1008,
    slug: "raffaello-premium-box",
    sku: "RFL-7743-P",
    title: "Raffaello Premium Box",
    category: "Confectionery",
    collectionSlug: "confectionery",
    featured: false,
    price: "$24.99",
    oldPrice: "$29.99",
    badge: "NEW",
    tags: { onSale: true },
    shortDescription: "Premium coconut and almond confectionery, elegantly boxed for gifting and retail display.",
    fullDescription: "<p>Raffaello Premium Box combines crisp wafer, creamy coconut filling, and a whole almond for a luxury confectionery experience.</p>",
    specifications: [
      { label: "Net Weight", value: "230g Box" },
      { label: "Shelf Life", value: "10 Months" },
      { label: "Storage", value: "Cool & Dry Place" },
      { label: "Packaging", value: "Gift Box" }
    ],
    images: [
      "https://images.unsplash.com/photo-1549007994-cb92caebd54b?auto=format&fit=crop&w=800&q=80"
    ]
  },
  {
    id: 1009,
    slug: "whey-protein-concentrate",
    sku: "WPC-9012-H",
    title: "Whey Protein Concentrate",
    category: "Health & Fitness",
    collectionSlug: null,
    featured: false,
    price: "$45.00",
    oldPrice: "$55.00",
    badge: "SALE",
    tags: { onSale: true },
    shortDescription: "High-quality whey protein concentrate for wholesale distribution to gyms, retailers, and supplement brands.",
    fullDescription: "<p>Our Whey Protein Concentrate is sourced from trusted dairy suppliers, offering a high protein yield for sports nutrition products.</p>",
    specifications: [
      { label: "Protein Content", value: "80% Min" },
      { label: "Net Weight", value: "1kg / 2.5kg / 25kg Bulk" },
      { label: "Shelf Life", value: "18 Months" },
      { label: "Packaging", value: "Sealed Pouch / Bulk Drum" }
    ],
    images: [
      "https://images.unsplash.com/photo-1593095948071-474c5cc2989d?auto=format&fit=crop&w=800&q=80"
    ]
  },
  {
    id: 1010,
    slug: "heineken-premium-lager",
    sku: "HNK-5540-L",
    title: "Heineken Premium Lager",
    category: "Beverages",
    collectionSlug: "beverages",
    featured: true,
    price: "$32.99",
    tags: { weeklyFeatured: true },
    shortDescription: "World-renowned premium lager beer, imported and distributed in full pallet or mixed container loads.",
    fullDescription: "<p>Heineken Premium Lager is available for wholesale import with full documentation, ideal for distributors and retail chains.</p>",
    specifications: [
      { label: "Alcohol Content", value: "5.0% ABV" },
      { label: "Bottle Size", value: "330ml / 500ml" },
      { label: "Units per Case", value: "24 Bottles" },
      { label: "Packaging", value: "Carton / Pallet" }
    ],
    images: [
      "https://images.unsplash.com/photo-1618886614638-80e3c103d31a?auto=format&fit=crop&w=800&q=80"
    ]
  },
  {
    id: 1011,
    slug: "desperados-beer-multipack",
    sku: "DSP-6631-B",
    title: "Desperados Beer Multipack 24x",
    category: "Beverages",
    collectionSlug: "beverages",
    featured: false,
    price: "$34.00",
    tags: { weeklyFeatured: true },
    shortDescription: "Tequila-flavored lager beer, supplied in 24x multipacks for wholesale and retail distribution.",
    fullDescription: "<p>Desperados Beer Multipack combines lager beer with a bold tequila flavor, popular in bars, retailers, and distribution chains.</p>",
    specifications: [
      { label: "Alcohol Content", value: "5.9% ABV" },
      { label: "Bottle Size", value: "330ml" },
      { label: "Units per Case", value: "24 Bottles" },
      { label: "Packaging", value: "Carton / Pallet" }
    ],
    images: [
      "https://images.unsplash.com/photo-1608270586620-248524c67de9?auto=format&fit=crop&w=800&q=80"
    ]
  },
  {
    id: 1012,
    slug: "corona-extra-beer-pack",
    sku: "CRN-7742-B",
    title: "Corona Extra Beer Pack",
    category: "Beverages",
    collectionSlug: "beverages",
    featured: false,
    price: "$38.50",
    tags: { weeklyFeatured: true },
    shortDescription: "Classic Mexican lager beer, imported and packed for wholesale distribution to retailers and bars.",
    fullDescription: "<p>Corona Extra Beer Pack is one of the world's best-selling beers, available for bulk import with full documentation.</p>",
    specifications: [
      { label: "Alcohol Content", value: "4.5% ABV" },
      { label: "Bottle Size", value: "355ml" },
      { label: "Units per Case", value: "24 Bottles" },
      { label: "Packaging", value: "Carton / Pallet" }
    ],
    images: [
      "https://images.unsplash.com/photo-1535958636474-b021ee887b13?auto=format&fit=crop&w=800&q=80"
    ]
  },
  {
    id: 1013,
    slug: "kronenbourg-1664-blanc-beer",
    sku: "KRN-8853-B",
    title: "Kronenbourg 1664 Blanc Beer",
    category: "Beverages",
    collectionSlug: "beverages",
    featured: false,
    price: "$36.00",
    tags: { weeklyFeatured: true },
    shortDescription: "French wheat beer with a citrus twist, imported and distributed in wholesale case quantities.",
    fullDescription: "<p>Kronenbourg 1664 Blanc is a premium French wheat beer, offering a smooth citrus finish popular across European and international markets.</p>",
    specifications: [
      { label: "Alcohol Content", value: "5.0% ABV" },
      { label: "Bottle Size", value: "330ml" },
      { label: "Units per Case", value: "24 Bottles" },
      { label: "Packaging", value: "Carton / Pallet" }
    ],
    images: [
      "https://images.unsplash.com/photo-1567696911980-2eed69a46042?auto=format&fit=crop&w=800&q=80"
    ]
  },
  {
    id: 1014,
    slug: "sunflower-oil-pure",
    sku: "SFO-7702-P",
    title: "Sunflower Oil Pure",
    category: "Cooking Oil",
    collectionSlug: "cooking-oil",
    featured: false,
    price: "$18.50",
    tags: {},
    shortDescription: "100% refined pure sunflower oil, packaged for both retail shelves and bulk commercial kitchens.",
    fullDescription: "<p>Our Pure Sunflower Oil is cold-pressed and refined to remove impurities while retaining its light flavor and nutritional value.</p>",
    specifications: [
      { label: "Free Fatty Acid", value: "0.1% Max" },
      { label: "Packaging", value: "1L / 5L / 20L / Bulk Tanker" },
      { label: "Shelf Life", value: "18 Months" },
      { label: "Storage", value: "Cool & Dry Place" }
    ],
    images: [
      "https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&w=800&q=80"
    ]
  },
  {
    id: 1015,
    slug: "nestle-coffee-mate",
    sku: "NCM-9081-C",
    title: "Nestle Coffee Mate",
    category: "Tea & Coffee",
    collectionSlug: "tea-coffee",
    featured: false,
    price: "$8.50",
    tags: {},
    shortDescription: "Smooth and creamy coffee creamer, packaged in bulk for HORECA and retail distribution.",
    fullDescription: "<p>Nestle Coffee Mate delivers a consistent, creamy taste to every cup, trusted by cafes and retailers worldwide.</p>",
    specifications: [
      { label: "Net Weight", value: "400g / 900g" },
      { label: "Shelf Life", value: "24 Months" },
      { label: "Storage", value: "Room Temperature" },
      { label: "Packaging", value: "Jar / Carton" }
    ],
    images: [
      "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=800&q=80"
    ]
  }
];

function toHomeCard(product) {
  return {
    id: product.id,
    slug: product.slug,
    title: product.title,
    category: product.category.toUpperCase(),
    price: product.price,
    oldPrice: product.oldPrice,
    image: product.images[0],
    badge: product.badge
  };
}

export const HERO_SLIDES = [
  {
    id: 1,
    title: "FAVORITE BRANDS AND HOTTEST TRENDS",
    subtitle: "KONAVA TRADE INC.",
    tag: "PREMIUM SELECTION",
    image: "https://images.unsplash.com/photo-1541781774459-bb2af2f05b55?q=80&w=1200&auto=format&fit=crop",
    btnText: "BROWSE NOW",
    btnLink: "/collection/beverages",
    badge: "Hot Deals 2026"
  },
  {
    id: 2,
    title: "AUTHENTIC FROZEN FOODS & GROCERIES",
    subtitle: "FRESH & IMPORTED",
    tag: "BEST QUALITY GUARANTEED",
    image: "https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=1200&auto=format&fit=crop",
    btnText: "SHOP FROZEN",
    btnLink: "/collection/frozen-food",
    badge: "100% Organic"
  },
  {
    id: 3,
    title: "PREMIUM SPICES & AGRICULTURAL PRODUCTS",
    subtitle: "WHOLESALE PRICES",
    tag: "DIRECT FROM FARMERS",
    image: "https://images.unsplash.com/photo-1596040033229-a9821ebd058d?q=80&w=1200&auto=format&fit=crop",
    btnText: "DISCOVER MORE",
    btnLink: "/collection/agricultural",
    badge: "Bulk Save"
  }
];

export const SIDE_BANNERS = [
  {
    id: 1,
    tag: "Great Value Offer",
    title: "SPECIAL SEASONS DISCOUNT",
    btnText: "BROWSE NOW",
    link: "/collection/confectionery",
    bgImage: "https://images.unsplash.com/photo-1610348725531-843dff563e2c?q=80&w=600&auto=format&fit=crop"
  },
  {
    id: 2,
    tag: "Fresh Harvest",
    title: "AGRICULTURAL PRODUCTS",
    btnText: "BROWSE NOW",
    link: "/collection/agricultural",
    bgImage: "https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?q=80&w=600&auto=format&fit=crop"
  }
];

export const LATEST_ON_SALE = PRODUCTS.filter((p) => p.tags?.onSale).map(toHomeCard);
export const WEEKLY_FEATURED = PRODUCTS.filter((p) => p.tags?.weeklyFeatured).map(toHomeCard);
export const BESTSELLERS = PRODUCTS.filter((p) => p.tags?.bestseller).map(toHomeCard);

export const CATEGORY_CARDS = [
  { title: "TEA AND COFFEE", slug: "tea-coffee", image: "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?q=80&w=300&auto=format&fit=crop" },
  { title: "FROZEN FOOD", slug: "frozen-food", image: "https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=300&auto=format&fit=crop" },
  { title: "CONFECTIONERY", slug: "confectionery", image: "https://images.unsplash.com/photo-1549007994-cb92caebd54b?q=80&w=300&auto=format&fit=crop" },
  { title: "COOKING OIL", slug: "cooking-oil", image: "https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?q=80&w=300&auto=format&fit=crop" },
  { title: "BEVERAGES & BEER", slug: "beverages", image: "https://images.unsplash.com/photo-1618886614638-80e3c103d31a?q=80&w=300&auto=format&fit=crop" },
  { title: "AGRICULTURAL", slug: "agricultural", image: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?q=80&w=300&auto=format&fit=crop" }
].map((cat) => ({
  ...cat,
  count: `${PRODUCTS.filter((p) => p.collectionSlug === cat.slug).length} PRODUCTS`
}));

export const FOOTER_MINI_LISTS = {
  drinks: [
    { title: "Carlsberg Beer", price: "$28.00", img: "https://images.unsplash.com/photo-1608270586620-248524c67de9?q=80&w=100&auto=format&fit=crop" },
    { title: "Grey Goose Vodka 1000ml", price: "$45.00", img: "https://images.unsplash.com/photo-1569529465841-dfecdab7503b?q=80&w=100&auto=format&fit=crop" },
    { title: "Heineken Beer", price: "$32.99", img: "https://images.unsplash.com/photo-1618886614638-80e3c103d31a?q=80&w=100&auto=format&fit=crop" },
    { title: "Hennessy Cognac", price: "$65.00", img: "https://images.unsplash.com/photo-1527281400683-1aae777175f8?q=80&w=100&auto=format&fit=crop" }
  ],
  cookingOil: [
    { title: "Sunflower Oil Pure", price: "$18.50", img: "https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?q=80&w=100&auto=format&fit=crop" },
    { title: "Soybean Oil 5L", price: "$22.00", img: "https://images.unsplash.com/photo-1620706857370-e1b9770e8bb1?q=80&w=100&auto=format&fit=crop" },
    { title: "Refined Corn Oil", price: "$19.00", img: "https://images.unsplash.com/photo-1586201375761-83865001e31c?q=80&w=100&auto=format&fit=crop" },
    { title: "Pure Peanut Oil", price: "$24.00", img: "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?q=80&w=100&auto=format&fit=crop" }
  ],
  confectionery: [
    { title: "Ferrero Rocher Box", price: "$16.00", img: "https://images.unsplash.com/photo-1549007994-cb92caebd54b?q=80&w=100&auto=format&fit=crop" },
    { title: "Kinder Bueno Box", price: "$14.50", img: "https://images.unsplash.com/photo-1621939514649-280e2ee25f60?q=80&w=100&auto=format&fit=crop" },
    { title: "Kinder Joy Eggs 24x", price: "$22.00", img: "https://images.unsplash.com/photo-1582293041079-7814c2f12063?q=80&w=100&auto=format&fit=crop" },
    { title: "M&M's Peanut Box", price: "$12.00", img: "https://images.unsplash.com/photo-1541781774459-bb2af2f05b55?q=80&w=100&auto=format&fit=crop" }
  ],
  bestsellersMini: [
    { title: "Soybean Meal Bulk", price: "$210.00", img: "https://images.unsplash.com/photo-1586201375761-83865001e31c?q=80&w=100&auto=format&fit=crop" },
    { title: "Alfalfa Hay Bales", price: "$185.00", img: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?q=80&w=100&auto=format&fit=crop" },
    { title: "Nestle Coffee Mate", price: "$8.50", img: "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?q=80&w=100&auto=format&fit=crop" },
    { title: "Nutella Chocolate 750g", price: "$9.99", img: "https://images.unsplash.com/photo-1582293041079-7814c2f12063?q=80&w=100&auto=format&fit=crop" }
  ]
};
