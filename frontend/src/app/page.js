import HomePageClient from '@/components/HomePageClient';

const BASE_URL = 'https://www.propertiesforrents.com';
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

// ─── Server-side data fetching ────────────────────────────────────────────────
async function getInitialProperties() {
  try {
    const res = await fetch(
      `${API_URL}/properties/nearby?lat=13.9299&lng=75.5681&radius=100&limit=50`,
      { next: { revalidate: 300 } } // revalidate every 5 minutes
    );
    if (!res.ok) return [];
    const data = await res.json();
    return data?.data?.properties || [];
  } catch {
    return [];
  }
}

// ─── FAQ data (used for both rendering and JSON-LD) ────────────────────────────
const FAQ_ITEMS = [
  {
    question: 'What is Properties For Rents?',
    answer:
      'Properties For Rents is a free platform that helps you discover homes, rooms, PGs, shops, lodges, and plots for rent or sale near you. We connect tenants directly with property owners — no middlemen, no brokerage.',
  },
  {
    question: 'How do I find properties for rent near me?',
    answer:
      'Simply open propertiesforrents.com and allow location access. Our map-based search instantly shows you verified rental listings sorted by distance. You can also search by city name or area.',
  },
  {
    question: 'Is Properties For Rents free to use?',
    answer:
      'Yes! Browsing listings and contacting property owners is completely free. Listing your own property is also free of charge.',
  },
  {
    question: 'What areas does Properties For Rents cover?',
    answer:
      'We currently serve Shivamogga and surrounding areas across Karnataka, India. We are expanding rapidly to cover more cities.',
  },
  {
    question: 'What types of properties can I find?',
    answer:
      'You can find Homes (apartments and houses), Rooms (single room rentals), PGs (paying guest accommodation), Shops (commercial rental spaces), Lodges (hourly and daily stay), and Sites/Plots (land for sale).',
  },
  {
    question: 'How do I list my property for rent?',
    answer:
      'Sign up for a free account, go to your Dashboard, and click "Add Property". Fill in the details, upload a photo, set your location on the map, and submit. Your listing goes live immediately.',
  },
];

// ─── Page Component (Server) ──────────────────────────────────────────────────
export default async function HomePage() {
  const properties = await getInitialProperties();

  // ─── JSON-LD: WebSite with SearchAction ─────────────────────────
  const websiteJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Properties For Rents',
    url: BASE_URL,
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${BASE_URL}/?q={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  };

  // ─── JSON-LD: LocalBusiness (GEO) ───────────────────────────────
  const localBusinessJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: 'Properties For Rents',
    url: BASE_URL,
    logo: `${BASE_URL}/logo.png`,
    image: `${BASE_URL}/logo.png`,
    description:
      'Find verified homes, rooms, PGs, shops, and lodges for rent in Shivamogga and Karnataka. Direct owner contact, no brokerage.',
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Shivamogga',
      addressRegion: 'Karnataka',
      addressCountry: 'IN',
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: 13.9299,
      longitude: 75.5681,
    },
    areaServed: {
      '@type': 'State',
      name: 'Karnataka',
    },
  };

  // ─── JSON-LD: FAQPage (AEO) ────────────────────────────────────
  const faqJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: FAQ_ITEMS.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };

  // ─── JSON-LD: ItemList (property listings) ──────────────────────
  const itemListJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'Properties for Rent Near Shivamogga',
    numberOfItems: properties.length,
    itemListElement: properties.slice(0, 20).map((p, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      url: `${BASE_URL}/properties/${p.id}`,
      name: p.title,
      image: p.image_url || undefined,
    })),
  };

  return (
    <div className="min-h-screen bg-[#f7f4f0] pb-20">
      {/* ─── JSON-LD Structured Data ─── */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListJsonLd) }}
      />

      {/* ─── SEO Hero Section (visible to Google & users) ─── */}
      <section className="bg-gradient-to-b from-[#f7f4f0] to-[#fdfbf9] border-b border-[#e8e2db]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 text-center">
          <h1
            className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[#1a1815] mb-4"
            style={{ fontFamily: "'Cormorant Garamond', serif" }}
          >
            Properties For Rents
          </h1>
          <p className="text-base sm:text-lg text-[#5a5550] max-w-2xl mx-auto leading-relaxed">
            Find <strong>homes</strong>, <strong>rooms</strong>, <strong>PGs</strong>,{' '}
            <strong>shops</strong>, and <strong>lodges for rent</strong> near you. Browse
            verified listings with photos, prices, and{' '}
            <strong>direct owner contact</strong> — no brokerage, no middlemen.
          </p>
          <div className="flex flex-wrap justify-center gap-3 mt-6 text-xs font-semibold text-[#8a6b4a]">
            <span className="bg-[#fdf8f4] px-3 py-1.5 rounded-full border border-[#f0ece7]">🏠 Homes</span>
            <span className="bg-[#fdf8f4] px-3 py-1.5 rounded-full border border-[#f0ece7]">🛏️ Rooms</span>
            <span className="bg-[#fdf8f4] px-3 py-1.5 rounded-full border border-[#f0ece7]">🧑‍🎓 PGs</span>
            <span className="bg-[#fdf8f4] px-3 py-1.5 rounded-full border border-[#f0ece7]">🏪 Shops</span>
            <span className="bg-[#fdf8f4] px-3 py-1.5 rounded-full border border-[#f0ece7]">🏨 Lodges</span>
            <span className="bg-[#fdf8f4] px-3 py-1.5 rounded-full border border-[#f0ece7]">🌍 Sites / Plots</span>
          </div>
        </div>
      </section>

      {/* ─── Interactive Client Section ─── */}
      <HomePageClient initialProperties={properties} />

      {/* ─── SEO: Server-Rendered Property Summary for crawlers ─── */}
      {properties.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <h2
            className="text-2xl sm:text-3xl font-bold text-[#1a1815] mb-6 text-center"
            style={{ fontFamily: "'Cormorant Garamond', serif" }}
          >
            Latest Properties for Rent Near Shivamogga
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {properties.slice(0, 12).map((p) => (
              <a
                key={p.id}
                href={`/properties/${p.id}`}
                className="block bg-white rounded-xl border border-[#e8e2db] p-4 hover:shadow-md transition-shadow"
              >
                <h3 className="font-semibold text-sm text-[#1a1815] mb-1 truncate">{p.title}</h3>
                <p className="text-xs text-[#8a6b4a] font-medium capitalize">{p.category?.replace('_', ' ')}</p>
                {p.price && (
                  <p className="text-sm font-bold text-[#1a1815] mt-2">
                    ₹{Number(p.price).toLocaleString('en-IN')}
                    {p.listing_type !== 'sale' && p.category !== 'site' && (
                      <span className="text-xs font-normal text-[#5a5550]"> /month</span>
                    )}
                  </p>
                )}
              </a>
            ))}
          </div>
        </section>
      )}

      {/* ─── FAQ Section (AEO — visible to users & crawlers) ─── */}
      <section className="bg-white border-t border-[#e8e2db]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <h2
            className="text-2xl sm:text-3xl font-bold text-[#1a1815] mb-8 text-center"
            style={{ fontFamily: "'Cormorant Garamond', serif" }}
          >
            Frequently Asked Questions
          </h2>
          <div className="space-y-4">
            {FAQ_ITEMS.map((faq, index) => (
              <details
                key={index}
                className="group bg-[#faf9f7] rounded-xl border border-[#e8e2db] overflow-hidden"
              >
                <summary className="flex items-center justify-between px-5 py-4 cursor-pointer select-none hover:bg-[#f7f4f0] transition-colors">
                  <h3 className="text-sm font-semibold text-[#1a1815] pr-4">{faq.question}</h3>
                  <svg
                    className="w-4 h-4 shrink-0 text-[#8a6b4a] transition-transform group-open:rotate-180"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </summary>
                <div className="px-5 pb-4">
                  <p className="text-sm text-[#5a5550] leading-relaxed">{faq.answer}</p>
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
