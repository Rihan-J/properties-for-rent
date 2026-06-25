import './globals.css';
import Script from 'next/script';
import { AuthProvider } from '@/context/AuthContext';
import { GeoProvider } from '@/context/GeoContext';
import BottomNav from '@/components/BottomNav';
import Footer from '@/components/Footer';

export const metadata = {
  title: {
    default: 'Properties For Rents — Find Homes, Rooms, PGs & Shops Near You',
    template: '%s | Properties For Rents',
  },
  description:
    'Properties For Rents is the easiest way to find homes, rooms, PGs, shops, and lodges for rent near you. Browse verified listings with photos, prices, and direct owner contact in Shivamogga and Karnataka.',
  keywords: [
    'properties for rents',
    'homes for rent',
    'rooms for rent',
    'PG near me',
    'shops for rent',
    'rental properties Karnataka',
    'Shivamogga rentals',
    'house for rent near me',
    'lodge booking',
    'sites for sale Shivamogga',
  ],
  metadataBase: new URL('https://www.propertiesforrents.com'),
  alternates: { canonical: '/' },
  openGraph: {
    title: 'Properties For Rents — Find Homes, Rooms, PGs & Shops Near You',
    description:
      'Browse verified rental listings with photos, prices, and direct owner contact in Shivamogga and Karnataka.',
    url: 'https://www.propertiesforrents.com',
    siteName: 'Properties For Rents',
    locale: 'en_IN',
    type: 'website',
    images: [
      {
        url: '/logo.png',
        width: 1200,
        height: 630,
        alt: 'Properties For Rents — Find Homes, Rooms, PGs & Shops',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Properties For Rents — Find Homes, Rooms, PGs & Shops Near You',
    description:
      'Browse verified rental listings with photos, prices, and direct owner contact.',
    images: ['/logo.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'YOUR_PASTE_GSC_CODE_HERE',
  },
};

export default function RootLayout({ children }) {
  const organizationJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Properties For Rents',
    url: 'https://www.propertiesforrents.com',
    logo: 'https://www.propertiesforrents.com/logo.png',
    description:
      'Properties For Rents is the easiest way to find homes, rooms, PGs, shops, and lodges for rent near you.',
    areaServed: {
      '@type': 'State',
      name: 'Karnataka',
      containedInPlace: { '@type': 'Country', name: 'India' },
    },
  };

  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;500;600;700&family=DM+Sans:wght@400;500;600;700&display=swap" rel="stylesheet" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
        />
      </head>
      <body className="min-h-screen text-[#1a1815]" style={{ backgroundColor: '#f7f4f0', fontFamily: "'DM Sans', sans-serif" }}>
        <AuthProvider>
          <GeoProvider>
            <main className="pb-20">
              {children}
            </main>
            <Footer />
            <BottomNav />
          </GeoProvider>
        </AuthProvider>
        <Script src="https://www.googletagmanager.com/gtag/js?id=G-04CRYF22Q1" strategy="afterInteractive" />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-04CRYF22Q1');
          `}
        </Script>
      </body>
    </html>
  );
}
