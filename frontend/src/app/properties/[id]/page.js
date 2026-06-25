import PropertyDetailClient from '@/components/PropertyDetailClient';

const BASE_URL = 'https://www.propertiesforrents.com';
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

// ─── Server-side property fetcher ─────────────────────────────────────────────
async function fetchProperty(id) {
  try {
    const res = await fetch(`${API_URL}/properties/${id}`, {
      next: { revalidate: 300 },
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data?.data?.property || null;
  } catch {
    return null;
  }
}

// ─── Dynamic Metadata (SEO title, description, OG, Twitter) ───────────────────
export async function generateMetadata({ params }) {
  const { id } = await params;
  const property = await fetchProperty(id);

  if (!property) {
    return {
      title: 'Property Not Found',
      description: 'This property listing could not be found on Properties For Rents.',
    };
  }

  const isSale = property.listing_type === 'sale' || property.category === 'site';
  const price = Number(property.price || property.total_price || 0);
  const priceStr = price > 0 ? `₹${price.toLocaleString('en-IN')}` : '';
  const priceUnit = isSale ? '' : '/month';
  const category = property.category ? property.category.replace('_', ' ') : 'property';
  const city = property.city || 'Shivamogga';

  const title = `${property.title}${priceStr ? ` — ${priceStr}${priceUnit}` : ''}`;
  const description = property.description
    ? property.description.slice(0, 155)
    : `${property.title} — ${category} available ${isSale ? 'for sale' : 'for rent'} in ${city}. ${priceStr ? `Price: ${priceStr}${priceUnit}. ` : ''}Contact the owner directly on Properties For Rents.`;

  return {
    title,
    description,
    alternates: {
      canonical: `/properties/${id}`,
    },
    openGraph: {
      title,
      description,
      url: `${BASE_URL}/properties/${id}`,
      siteName: 'Properties For Rents',
      type: 'article',
      images: property.image_url
        ? [{ url: property.image_url, width: 1200, height: 630, alt: property.title }]
        : [{ url: `${BASE_URL}/logo.png`, width: 1200, height: 630, alt: 'Properties For Rents' }],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: property.image_url ? [property.image_url] : [`${BASE_URL}/logo.png`],
    },
  };
}

// ─── Page Component (Server) ──────────────────────────────────────────────────
export default async function PropertyDetailPage({ params }) {
  const { id } = await params;
  const property = await fetchProperty(id);

  // Build JSON-LD for this specific property
  const jsonLd = property
    ? {
        '@context': 'https://schema.org',
        '@type': 'RealEstateListing',
        name: property.title,
        description: property.description || '',
        url: `${BASE_URL}/properties/${id}`,
        datePosted: property.created_at || new Date().toISOString(),
        image: property.image_url || undefined,
        offers: {
          '@type': 'Offer',
          price: property.price || property.total_price || 0,
          priceCurrency: 'INR',
          availability: 'https://schema.org/InStock',
          priceValidUntil: '2027-12-31',
        },
        address: {
          '@type': 'PostalAddress',
          addressLocality: property.city || 'Shivamogga',
          addressRegion: 'Karnataka',
          addressCountry: 'IN',
        },
        geo: property.latitude && property.longitude
          ? {
              '@type': 'GeoCoordinates',
              latitude: property.latitude,
              longitude: property.longitude,
            }
          : undefined,
      }
    : null;

  return (
    <>
      {jsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      )}
      <PropertyDetailClient initialProperty={property} />
    </>
  );
}
