// The questions and answers shown in FAQ sections (and published as FAQPage
// data). Rule: nothing here is invented. Site-wide answers restate things the
// site already says (About, Footer, Global Reach); product answers are built
// only from fields that are filled in, and a question disappears when its data
// is missing. Plain functions, so they are tested without a browser or database.
// (Imports carry a ".js" extension so Node's test runner can load this file.)
import { COMPANY_DESCRIPTION } from './seo.js';

const clean = (value) => (typeof value === 'string' ? value.trim() : '');

// Each answer's source is noted so the copy can be checked against the site.
const SITE_QUESTIONS = {
  what: () => ({
    question: 'What does Elaff Trade Co. do?', // About > Who We Are / Our Service
    answer: `${COMPANY_DESCRIPTION} Our services include customized cross-border procurement, international logistics and warehousing, customs clearance agency services and delivery solutions.`,
  }),
  moq: () => ({
    question: 'What is your minimum order quantity?', // About > Core Advantages
    answer:
      'Our MOQ can be as low as one pallet. The minimum order for an individual product is shown on its product page.',
  }),
  shipping: () => ({
    question: 'How fast do you ship?', // Footer; About > Core Advantages
    answer:
      'We ship orders within 24 to 72 hours. For urgent orders we offer 7-day express delivery by air freight.',
  }),
  terms: () => ({
    question: 'Which trade terms do you work with?', // About > Our Service
    answer:
      'We work on EXW, FOB or CNF terms, with warehousing, labeling in your language, international logistics and customs clearance available.',
  }),
  certification: () => ({
    question: 'Do you support Halal and HACCP certification?', // About > Export Solutions
    answer:
      'Yes. For export orders we offer Halal and HACCP certification support, and packaging can be redesigned for the target market.',
  }),
  regions: () => ({
    question: 'Where do you deliver?', // Footer; Home > Global Reach
    answer:
      'We deliver to wholesalers, distributors and retailers across the Gulf, the UK, the USA and South Africa, and we can deliver to all locations in compliance with local laws.',
  }),
  catalog: () => ({
    question: "What if a product or brand isn't in your catalog?", // About > Our Service
    answer: "Contact our team and we'll put together a solution. We source premium goods worldwide for international buyers.",
  }),
  quote: () => ({
    question: 'How do I request a quote?', // Send Inquiry buttons; Contact page
    answer:
      'Use the Send Inquiry button on any product page, or send us a message on the Contact page, and our team will get back to you.',
  }),
  location: (settings) => {
    const address = clean(settings?.address)
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter(Boolean)
      .join(', ');
    return address ? { question: 'Where is Elaff Trade Co. located?', answer: `Our address is ${address}.` } : null;
  },
};

// Which questions each page shows, in order. Pages differ so the same
// questions aren't repeated word for word across the site.
const PAGE_QUESTIONS = {
  home: ['what', 'moq', 'regions', 'quote'],
  about: ['what', 'moq', 'shipping', 'terms', 'certification', 'regions', 'catalog'],
  contact: ['quote', 'moq', 'shipping', 'location'],
};

export function siteFaqs(page, settings) {
  return (PAGE_QUESTIONS[page] || []).map((id) => SITE_QUESTIONS[id](settings)).filter(Boolean);
}

const rowsAsText = (rows) =>
  (rows || [])
    .filter((row) => clean(row?.label) && clean(row?.value))
    .map((row) => `${clean(row.label)}: ${clean(row.value)}`)
    .join('; ');

// `product` is a serialized Product. The second argument (Company Settings) is
// accepted but unused, so callers don't change if company facts are added later.
export function productFaqs(product, settings) {
  const name = clean(product?.title);
  const items = [];
  const add = (question, answer) => answer && items.push({ question, answer });

  const moq = clean(product?.moq);
  if (moq) add(`What is the minimum order quantity for ${name}?`, `The minimum order for ${name} is ${moq}.`);

  const leadTime = clean(product?.leadTime);
  if (leadTime) add(`What is the lead time for ${name}?`, `The lead time for ${name} is ${leadTime}.`);

  const packaging = (product?.specifications || []).find(
    (spec) => /packag/i.test(clean(spec?.label)) && clean(spec?.value)
  );
  if (packaging) add(`How is ${name} packaged?`, `${name} is available in: ${clean(packaging.value)}.`);

  const shipping = rowsAsText(product?.shippingInfo);
  if (shipping) add(`What are the shipping details for ${name}?`, `${shipping}.`);

  // Company-wide facts (payment terms, certifications) are deliberately not
  // here: they'd repeat word for word on every product page.
  return items;
}
