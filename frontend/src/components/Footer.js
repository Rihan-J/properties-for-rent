import Link from 'next/link';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-[#1a1815] text-white/70 border-t border-[#2e2a25] pb-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-8">
          
          {/* Brand */}
          <div className="col-span-2 sm:col-span-1">
            <Link href="/" className="text-white font-bold text-lg" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
              Properties For Rents
            </Link>
            <p className="text-xs mt-3 leading-relaxed text-white/50">
              The easiest way to find homes, rooms, PGs, shops, and lodges for rent near you. No brokerage, direct owner contact.
            </p>
          </div>

          {/* Browse */}
          <div>
            <h4 className="text-white text-xs font-bold uppercase tracking-wider mb-3">Browse</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/?category=home" className="hover:text-white transition-colors">Homes for Rent</Link></li>
              <li><Link href="/?category=room" className="hover:text-white transition-colors">Rooms for Rent</Link></li>
              <li><Link href="/?category=pg" className="hover:text-white transition-colors">PG Accommodation</Link></li>
              <li><Link href="/?category=shop" className="hover:text-white transition-colors">Shops for Rent</Link></li>
              <li><Link href="/?category=lodge" className="hover:text-white transition-colors">Lodge Booking</Link></li>
              <li><Link href="/?category=site" className="hover:text-white transition-colors">Sites &amp; Plots</Link></li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="text-white text-xs font-bold uppercase tracking-wider mb-3">Company</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/" className="hover:text-white transition-colors">Home</Link></li>
              <li><Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
              <li><Link href="/terms" className="hover:text-white transition-colors">Terms of Service</Link></li>
              <li><Link href="/account-deletion" className="hover:text-white transition-colors">Account Deletion</Link></li>
            </ul>
          </div>

          {/* Location */}
          <div>
            <h4 className="text-white text-xs font-bold uppercase tracking-wider mb-3">Location</h4>
            <ul className="space-y-2 text-sm">
              <li className="text-white/50">Shivamogga, Karnataka</li>
              <li className="text-white/50">India</li>
            </ul>
            <p className="text-xs text-white/40 mt-4">
              Serving Shivamogga and surrounding areas across Karnataka.
            </p>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-10 pt-6 border-t border-white/10 flex flex-col sm:flex-row justify-between items-center gap-3">
          <p className="text-xs text-white/40">
            © {currentYear} Properties For Rents. All rights reserved.
          </p>
          <p className="text-xs text-white/30">
            Find properties for rent — homes, rooms, PGs, shops, lodges near you.
          </p>
        </div>
      </div>
    </footer>
  );
}
