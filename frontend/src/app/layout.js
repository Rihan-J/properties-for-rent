import './globals.css';
import { AuthProvider } from '@/context/AuthContext';
import { GeoProvider } from '@/context/GeoContext';
import Navbar from '@/components/Navbar';

export const metadata = {
  title: 'Properties for Rentz — Find Your Perfect Stay',
  description: 'Discover and rent properties near you. Browse apartments, houses, PGs, and more on an interactive map.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;500;600;700&family=DM+Sans:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className="min-h-screen text-[#1a1815]" style={{ backgroundColor: '#f7f4f0', fontFamily: "'DM Sans', sans-serif" }}>
        <AuthProvider>
          <GeoProvider>
            <Navbar />
            <main className="pt-16">
              {children}
            </main>
          </GeoProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
