// The "Discover our brands" row on the home page. Products have no brand field, so a
// brand shows up when at least one active product's TITLE names it (whole word, any
// capitalisation); its tile links to a shop search for that brand. A brand with no
// matching product is simply not shown, so a tile never opens an empty page.
//
// To add a brand: put its logo in /public, then add a line to BRANDS below.
//   name   — shown as the logo's alt text
//   logo   — site path to the image (use the two helpers so odd file names are URL-encoded)
//   terms  — spellings to look for in product titles (default: just `name`)
//   search — words for the shop search the tile links to (default: whichever spelling
//            most products use). Set it when the brand name alone would pull in
//            unrelated products, e.g. "illy" also appears inside "Chilly".
//
// Pure (no database, no file reads) so it can be unit-tested.

// Logos scraped for the Partners page; some file names contain full-width letters or spaces.
const partnersPage = (file) => `/PartnersPage/${encodeURIComponent(file)}`;
const partners = (file) => `/partners/${file}`;

export const BRANDS = [
  { name: '7Days', logo: partnersPage('imgi_6_7days-1.png'), terms: ['7Days', '7 Days'] },
  { name: 'Alpen Gold', logo: partnersPage('imgi_8_Ａｌｐｅｎ　Ｇｏｌｄ-1.png') },
  { name: 'Alpinella', logo: partnersPage('imgi_9_ＡＬＰＩＮＥＬＬＡ-1.png') },
  { name: 'Ariel', logo: partnersPage('imgi_11_ARIEL-1-400x400.png') },
  { name: 'AriZona', logo: partnersPage('imgi_12_AriZona-1.png') },
  { name: 'Barilla', logo: partnersPage('imgi_167_Barilla-1.png') },
  { name: 'Bounty', logo: partnersPage('imgi_14_ＢＯＶＮＴＹ-1.png') },
  { name: 'Cadbury', logo: partners('25.PNG') },
  { name: 'Calgon', logo: partnersPage('imgi_16_Calgon-1.png') },
  { name: 'Carletti', logo: partnersPage('imgi_18_Carletti-1.png') },
  { name: 'Cheetos', logo: partnersPage('imgi_19_cheetos-1.png') },
  { name: 'Chocolat Mathez', logo: partners('28.PNG') },
  { name: 'Chupa Chups', logo: partnersPage('imgi_20_chupa-chups-1.jpeg') },
  { name: 'Coca-Cola', logo: partnersPage('imgi_21_coca-cola-1-697x400.png'), terms: ['Coca Cola', 'Coca-Cola', 'Cocacola'] },
  { name: 'Colgate', logo: partnersPage('imgi_22_Colgate-1-800x202.png') },
  { name: 'Daim', logo: partnersPage('imgi_23_Ｄａｉｍ-1.png') },
  { name: 'Dalli', logo: partnersPage('imgi_24_ｄａｌｌｉ-1.png') },
  { name: 'Dove', logo: partnersPage('imgi_25_DOVE-1-480x400.gif') },
  { name: 'Dr Pepper', logo: partnersPage('imgi_76_pepper-dr-1-572x400.jpg'), terms: ['Dr Pepper', 'Dr. Pepper'] },
  { name: 'Elseve', logo: partnersPage('imgi_26_ＥＬＳＥＶＥ-1.png') },
  { name: 'Fairy', logo: partnersPage('imgi_28_ＦＡＩＲＹ-1.png') },
  { name: 'Fanta', logo: partnersPage('imgi_29_FANTA-1.jpeg') },
  // The logo is the Ferrero Rocher seal, but products are named "Ferrero ...", so match the company name.
  { name: 'Ferrero', logo: partnersPage('imgi_30_FERRERO-ROCHER-1.jpeg') },
  { name: 'Finish', logo: partnersPage('imgi_31_FINISH-1.jpeg') },
  { name: "Fox's", logo: partners('8.PNG'), terms: ["Fox's", 'Foxs'] },
  { name: 'Garnier', logo: partnersPage('imgi_32_GARNIER-1.jpeg') },
  { name: 'Gillette', logo: partnersPage('imgi_33_gillette-1-526x400.jpeg') },
  { name: 'Godiva', logo: partners('21.PNG') },
  { name: 'Halls', logo: partnersPage('imgi_34_HALLS-1.png') },
  { name: 'Hanuta', logo: partnersPage('imgi_36_hanuta-1-762x400.png') },
  { name: 'Haribo', logo: partnersPage('imgi_37_HARIBO-1.jpg') },
  { name: 'Heinz', logo: partnersPage('imgi_38_HEINZ-1-711x400.jpg') },
  { name: "Hellmann's", logo: partnersPage('imgi_39_HELLMANNS-1.jpeg'), terms: ["Hellmann's", 'Hellmanns'] },
  { name: 'Huggies', logo: partnersPage('imgi_40_Huggies-1-657x400.jpeg') },
  { name: 'illy', logo: partnersPage('imgi_41_illy-1-400x400.jpg'), search: 'illy coffee' },
  { name: 'Jacobs', logo: partnersPage('imgi_42_ＪＡＣＯＢＳ-1.png') },
  { name: "Kellogg's", logo: partnersPage('imgi_43_Ｋｅｌｌｖｇｇ＇ｓ-1.png'), terms: ["Kellogg's", 'Kelloggs'] },
  { name: 'Kinder', logo: partnersPage('imgi_44_Kinder-1.jpeg') },
  { name: 'KitKat', logo: partners('9.PNG'), terms: ['KitKat', 'Kit Kat'] },
  { name: 'Knoppers', logo: partners('14.PNG') },
  { name: 'Kopiko', logo: partnersPage('imgi_46_ＫＯＰＬＫＯ-1.png') },
  { name: 'Lavazza', logo: partnersPage('imgi_47_LAVAZZA-1-554x400.jpeg') },
  { name: "Lay's", logo: partnersPage('imgi_48_LAYS-1-711x400.jpg'), terms: ["Lay's", 'Lays'] },
  { name: 'Leibniz', logo: partnersPage('imgi_49_LEIBNIZ-1-800x374.jpeg') },
  { name: 'Lenor', logo: partnersPage('imgi_50_LENOR-1.png') },
  { name: 'Lindt', logo: partnersPage('imgi_51_ｌｉｎｄｔ-1.png') },
  { name: 'Lipton', logo: partnersPage('imgi_53_Lipton-1-400x400.jpg') },
  { name: 'Listerine', logo: partnersPage('imgi_54_LISTERINE-1.jpeg') },
  { name: 'Loacker', logo: partners('11.PNG') },
  { name: 'Long Chips', logo: partnersPage('imgi_55_LongChips-1.png'), terms: ['Long Chips', 'LongChips'] },
  // "M&M" also matches "M&M's": the apostrophe counts as a separator.
  { name: "M&M's", logo: partnersPage('imgi_57_MM-1.jpg'), terms: ['M&M'] },
  { name: 'Maltesers', logo: partnersPage('imgi_58_maltesers-1.jpeg') },
  { name: 'Mamba', logo: partnersPage('imgi_59_ＭＡＭＢＡ-1.png') },
  { name: 'Mars', logo: partnersPage('imgi_60_MARS-1-711x400.jpg') },
  { name: 'Mentos', logo: partnersPage('imgi_61_mentos-1-512x400.jpeg') },
  { name: 'Merci', logo: partnersPage('imgi_62_merci-1-533x400.jpg') },
  { name: 'Milka', logo: partnersPage('imgi_63_MILKA-1-465x400.png') },
  { name: 'Mondelez', logo: partners('10.PNG') },
  { name: 'Nescafe', logo: partnersPage('imgi_65_NESCAFE-1.gif'), terms: ['Nescafe', 'Nescafé'] },
  { name: 'Nestle', logo: partnersPage('imgi_66_NESTLE-1.jpeg'), terms: ['Nestle', 'Nestlé'] },
  { name: 'nimm2', logo: partners('3.PNG') },
  { name: 'Nivea', logo: partnersPage('imgi_67_NIVEA-1-400x400.jpeg') },
  { name: 'Nutella', logo: partnersPage('imgi_68_nutella-1-800x223.png') },
  { name: 'Old Spice', logo: partnersPage('imgi_69_old-spice-1-400x400.jpg') },
  { name: 'Oral-B', logo: partnersPage('imgi_70_ORALTB-1-601x400.jpg'), terms: ['Oral-B', 'Oral B'] },
  { name: 'Orangina', logo: partnersPage('imgi_71_orangina-1-800x352.jpeg') },
  { name: 'Oreo', logo: partnersPage('imgi_73_Oreo-1.jpeg'), terms: ['Oreo', 'Oreos'] },
  { name: 'Palmolive', logo: partnersPage('imgi_74_PALMOLIVE-1.jpg') },
  { name: 'Pampers', logo: partnersPage('imgi_75_Pampers-1-479x400.jpg') },
  { name: 'Pepsi', logo: partnersPage('imgi_77_PEPSI-1-400x400.jpeg') },
  { name: 'Persil', logo: partnersPage('imgi_78_PERSIL-1-400x400.jpeg') },
  { name: 'Powerade', logo: partnersPage('imgi_79_ｐｏｗｅｒｒｄｅ-1.png') },
  { name: 'Pringles', logo: partnersPage('imgi_80_Pringles-1-328x400.png') },
  { name: 'Quality Street', logo: partners('29.PNG') },
  { name: 'Raffaello', logo: partnersPage('imgi_27_faffaello-1.png') },
  { name: 'Red Bull', logo: partnersPage('imgi_82_RED-BULL-1-533x400.jpeg'), terms: ['Red Bull', 'Redbull'] },
  { name: 'Renova', logo: partnersPage('imgi_83_Renova-1.jpeg') },
  { name: 'Rexona', logo: partnersPage('imgi_84_Rexona-1-711x400.jpeg') },
  { name: 'Ritter Sport', logo: partnersPage('imgi_85_ritter-sport-1-466x400.jpg'), terms: ['Ritter Sport', 'Ritter'] },
  { name: 'Rubicon', logo: partnersPage('imgi_86_Ｒｕｂｉｃｏｎ-1.png') },
  { name: 'Selpak', logo: partnersPage('imgi_87_ｓｅｌｐａｋ-1.png') },
  { name: 'Snickers', logo: partnersPage('imgi_89_SNICKERS-1.jpeg') },
  { name: 'Storck', logo: partners('1.PNG') },
  { name: 'Tampax', logo: partnersPage('imgi_90_TAMPAX-1.jpeg') },
  { name: 'Toblerone', logo: partnersPage('imgi_91_TOBLERO-1.jpeg') },
  { name: 'Triumf', logo: partnersPage('imgi_92_triumf-1-800x144.jpg') },
  { name: 'Twinings', logo: partnersPage('imgi_202_TWININGS-1.jpg') },
  { name: 'Twix', logo: partnersPage('imgi_94_TWIX-1.jpg') },
  { name: 'Vanish', logo: partnersPage('imgi_95_VANISH-1-565x400.jpg') },
];

function escapeRegex(text) {
  return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// Whole word, any capitalisation: "Mars" is in "Mars Bar" but not in "Marshmallow",
// and "illy" is in "Illy Coffee" but not in "Chilly". Anything that is not a letter or
// digit counts as a separator, so "Pepsi-Cola", "(Fanta)" and "M&M's" all match.
function wordMatcher(term) {
  return new RegExp(`(?<![\\p{L}\\p{N}])${escapeRegex(term.normalize('NFC'))}(?![\\p{L}\\p{N}])`, 'iu');
}

// `titles` is every active product's title. Returns the brands to show, most products
// first (ties alphabetical), as { name, logo, href, count }.
export function pickHomeBrands(titles, brands = BRANDS) {
  const list = (Array.isArray(titles) ? titles : [])
    .filter((title) => typeof title === 'string' && title.trim())
    .map((title) => title.normalize('NFC'));

  const picked = [];
  for (const brand of brands) {
    const terms = brand.terms?.length ? brand.terms : [brand.name];
    const matchers = terms.map(wordMatcher);
    const perTerm = matchers.map(() => 0);
    let count = 0;

    for (const title of list) {
      let named = false;
      matchers.forEach((matcher, i) => {
        if (matcher.test(title)) {
          perTerm[i] += 1;
          named = true;
        }
      });
      if (named) count += 1;
    }
    if (count === 0) continue;

    // Search with the spelling most products use, so the link finds as many of them as it can.
    const search = brand.search ?? terms[perTerm.indexOf(Math.max(...perTerm))];
    picked.push({
      name: brand.name,
      logo: brand.logo,
      href: `/shop?search=${encodeURIComponent(search)}`,
      count,
    });
  }

  return picked.sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));
}
