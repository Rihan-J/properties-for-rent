export const metadata = {
  title: 'Privacy Policy — Properties for Rentz',
  description: 'Learn how Properties for Rentz collects, uses, and protects your personal data.',
};

export default function PrivacyPage() {
  return (
    <div className="min-h-[calc(100vh-64px)] px-4 py-12" style={{ backgroundColor: '#f7f4f0' }}>
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="w-12 h-12 bg-[#1a1815] rounded-xl flex items-center justify-center mx-auto mb-4">
            <span className="text-white font-bold text-base" style={{ fontFamily: "'Cormorant Garamond', serif" }}>AS</span>
          </div>
          <h1
            className="text-3xl md:text-4xl font-semibold text-[#1a1815]"
            style={{ fontFamily: "'Cormorant Garamond', serif" }}
          >
            Privacy Policy
          </h1>
          <p className="text-[#5a5550] mt-2 text-sm">
            Last updated: April 27, 2026
          </p>
        </div>

        {/* Content Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-[#e8e2db] p-8 md:p-10 space-y-8">
          {/* Intro */}
          <section>
            <p className="text-[#3d3a36] leading-relaxed text-[15px]">
              At Properties for Rentz, your privacy matters. This policy explains what personal information we collect,
              why we collect it, and how we keep it safe. By creating an account, you agree to the practices
              described below.
            </p>
          </section>

          {/* Data We Collect */}
          <section>
            <h2
              className="text-xl font-semibold text-[#1a1815] mb-3"
              style={{ fontFamily: "'Cormorant Garamond', serif" }}
            >
              Data We Collect
            </h2>
            <ul className="space-y-2 text-[15px] text-[#3d3a36]">
              <li className="flex items-start gap-3">
                <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-[#b5936b] flex-shrink-0" />
                <span><strong className="text-[#1a1815]">Name</strong> — to personalize your account and listings</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-[#b5936b] flex-shrink-0" />
                <span><strong className="text-[#1a1815]">Email address</strong> — for account login, verification, and important notifications</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-[#b5936b] flex-shrink-0" />
                <span><strong className="text-[#1a1815]">Phone number</strong> — so property seekers and owners can communicate</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-[#b5936b] flex-shrink-0" />
                <span><strong className="text-[#1a1815]">Property details</strong> — title, description, images, and pricing you submit as a listing owner</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-[#b5936b] flex-shrink-0" />
                <span><strong className="text-[#1a1815]">Location data</strong> — latitude and longitude of properties, only when you explicitly provide them</span>
              </li>
            </ul>
          </section>

          {/* How We Use Data */}
          <section>
            <h2
              className="text-xl font-semibold text-[#1a1815] mb-3"
              style={{ fontFamily: "'Cormorant Garamond', serif" }}
            >
              How We Use Your Data
            </h2>
            <ul className="space-y-2 text-[15px] text-[#3d3a36]">
              <li className="flex items-start gap-3">
                <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-[#b5936b] flex-shrink-0" />
                <span>To create and manage your Properties for Rentz account</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-[#b5936b] flex-shrink-0" />
                <span>To display property listings on the map and search results</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-[#b5936b] flex-shrink-0" />
                <span>To connect property seekers with property owners</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-[#b5936b] flex-shrink-0" />
                <span>To send transactional emails (password resets, booking confirmations)</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-[#b5936b] flex-shrink-0" />
                <span>To improve our services and fix technical issues</span>
              </li>
            </ul>
          </section>

          {/* Security */}
          <section>
            <h2
              className="text-xl font-semibold text-[#1a1815] mb-3"
              style={{ fontFamily: "'Cormorant Garamond', serif" }}
            >
              Data Security
            </h2>
            <p className="text-[15px] text-[#3d3a36] leading-relaxed">
              Your password is hashed using industry-standard bcrypt encryption and is never stored in plain text.
              All communication between your browser and our servers is encrypted via HTTPS. We do not sell,
              rent, or share your personal data with third parties for marketing purposes.
            </p>
          </section>

          {/* Data Retention */}
          <section>
            <h2
              className="text-xl font-semibold text-[#1a1815] mb-3"
              style={{ fontFamily: "'Cormorant Garamond', serif" }}
            >
              Data Retention
            </h2>
            <p className="text-[15px] text-[#3d3a36] leading-relaxed">
              We retain your data for as long as your account is active. If you wish to delete your account
              and all associated data, please contact our support team and we will process your request
              within 30 days.
            </p>
          </section>

          {/* Your Rights */}
          <section>
            <h2
              className="text-xl font-semibold text-[#1a1815] mb-3"
              style={{ fontFamily: "'Cormorant Garamond', serif" }}
            >
              Your Rights
            </h2>
            <ul className="space-y-2 text-[15px] text-[#3d3a36]">
              <li className="flex items-start gap-3">
                <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-[#b5936b] flex-shrink-0" />
                <span>Access the personal data we hold about you</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-[#b5936b] flex-shrink-0" />
                <span>Request correction of inaccurate information</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-[#b5936b] flex-shrink-0" />
                <span>Request deletion of your account and data</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-[#b5936b] flex-shrink-0" />
                <span>Withdraw your consent at any time</span>
              </li>
            </ul>
          </section>

          {/* Contact */}
          <section className="pt-4 border-t border-[#e8e2db]">
            <h2
              className="text-xl font-semibold text-[#1a1815] mb-3"
              style={{ fontFamily: "'Cormorant Garamond', serif" }}
            >
              Contact Us
            </h2>
            <p className="text-[15px] text-[#3d3a36] leading-relaxed">
              If you have questions or concerns about this Privacy Policy, please reach out to us at{' '}
              <a
                href="mailto:propertiesforrentz.in@gmail.com"
                className="text-[#b5936b] font-semibold underline underline-offset-2 hover:text-[#8a6b4a] transition-colors"
              >
                propertiesforrentz.in@gmail.com
              </a>
            </p>
          </section>
        </div>

        {/* Footer note */}
        <p className="text-center text-xs text-[#9e968d] mt-8">
          © 2026 Properties for Rentz. All rights reserved.
        </p>
      </div>
    </div>
  );
}
