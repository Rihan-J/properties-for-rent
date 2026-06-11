export const metadata = {
  title: 'Terms & Conditions — Properties for Rentz',
  description: 'Read the Terms and Conditions governing your use of Properties for Rentz.',
};

export default function TermsPage() {
  return (
    <div className="min-h-screen px-4 py-12" style={{ backgroundColor: '#f7f4f0' }}>
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="w-12 h-12 bg-[#1a1815] rounded-xl flex items-center justify-center mx-auto mb-4">
            <span className="text-white font-bold text-base" style={{ fontFamily: "'Cormorant Garamond', serif" }}>PfR</span>
          </div>
          <h1
            className="text-3xl md:text-4xl font-semibold text-[#1a1815]"
            style={{ fontFamily: "'Cormorant Garamond', serif" }}
          >
            Terms &amp; Conditions
          </h1>
          <p className="text-[#5a5550] mt-2 text-sm">
            Last updated: June 11, 2026
          </p>
        </div>

        {/* Content Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-[#e8e2db] p-8 md:p-10 space-y-8">
          {/* Intro */}
          <section>
            <p className="text-[#3d3a36] leading-relaxed text-[15px]">
              Welcome to Properties for Rentz. By creating an account or using our mobile application
              and website, you agree to be bound by these Terms &amp; Conditions. If you do not agree,
              please do not use the service.
            </p>
          </section>

          {/* Definitions */}
          <section>
            <h2
              className="text-xl font-semibold text-[#1a1815] mb-3"
              style={{ fontFamily: "'Cormorant Garamond', serif" }}
            >
              1. Definitions
            </h2>
            <ul className="space-y-2 text-[15px] text-[#3d3a36]">
              <li className="flex items-start gap-3">
                <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-[#b5936b] flex-shrink-0" />
                <span><strong className="text-[#1a1815]">&quot;Service&quot;</strong> refers to the Properties for Rentz mobile application and website.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-[#b5936b] flex-shrink-0" />
                <span><strong className="text-[#1a1815]">&quot;User&quot;</strong> refers to any person who creates an account or uses the Service.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-[#b5936b] flex-shrink-0" />
                <span><strong className="text-[#1a1815]">&quot;Listing&quot;</strong> refers to any property advertisement posted on the Service.</span>
              </li>
            </ul>
          </section>

          {/* Eligibility */}
          <section>
            <h2
              className="text-xl font-semibold text-[#1a1815] mb-3"
              style={{ fontFamily: "'Cormorant Garamond', serif" }}
            >
              2. Eligibility
            </h2>
            <p className="text-[15px] text-[#3d3a36] leading-relaxed">
              You must be at least 18 years of age to create an account and use the Service. By registering,
              you represent that you meet this age requirement and that all information you provide is accurate
              and truthful.
            </p>
          </section>

          {/* Account Responsibilities */}
          <section>
            <h2
              className="text-xl font-semibold text-[#1a1815] mb-3"
              style={{ fontFamily: "'Cormorant Garamond', serif" }}
            >
              3. Account Responsibilities
            </h2>
            <ul className="space-y-2 text-[15px] text-[#3d3a36]">
              <li className="flex items-start gap-3">
                <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-[#b5936b] flex-shrink-0" />
                <span>You are responsible for maintaining the confidentiality of your account credentials.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-[#b5936b] flex-shrink-0" />
                <span>You are responsible for all activity that occurs under your account.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-[#b5936b] flex-shrink-0" />
                <span>You must notify us immediately of any unauthorized access or use of your account.</span>
              </li>
            </ul>
          </section>

          {/* Property Listings */}
          <section>
            <h2
              className="text-xl font-semibold text-[#1a1815] mb-3"
              style={{ fontFamily: "'Cormorant Garamond', serif" }}
            >
              4. Property Listings
            </h2>
            <ul className="space-y-2 text-[15px] text-[#3d3a36]">
              <li className="flex items-start gap-3">
                <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-[#b5936b] flex-shrink-0" />
                <span>You may only list properties that you own or are legally authorized to rent or sell.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-[#b5936b] flex-shrink-0" />
                <span>Listings must contain accurate information including pricing, location, and images.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-[#b5936b] flex-shrink-0" />
                <span>All listings are subject to review and approval by our administrators.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-[#b5936b] flex-shrink-0" />
                <span>We reserve the right to remove any listing that violates these terms without prior notice.</span>
              </li>
            </ul>
          </section>

          {/* Prohibited Content */}
          <section>
            <h2
              className="text-xl font-semibold text-[#1a1815] mb-3"
              style={{ fontFamily: "'Cormorant Garamond', serif" }}
            >
              5. Prohibited Content &amp; Conduct
            </h2>
            <p className="text-[15px] text-[#3d3a36] leading-relaxed mb-3">
              You agree not to:
            </p>
            <ul className="space-y-2 text-[15px] text-[#3d3a36]">
              <li className="flex items-start gap-3">
                <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-[#b5936b] flex-shrink-0" />
                <span>Post false, misleading, or fraudulent property listings.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-[#b5936b] flex-shrink-0" />
                <span>Upload offensive, obscene, or illegal content.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-[#b5936b] flex-shrink-0" />
                <span>Harass, threaten, or abuse other users.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-[#b5936b] flex-shrink-0" />
                <span>Use automated tools to scrape data or spam the platform.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-[#b5936b] flex-shrink-0" />
                <span>Attempt to gain unauthorized access to accounts or systems.</span>
              </li>
            </ul>
          </section>

          {/* Intellectual Property */}
          <section>
            <h2
              className="text-xl font-semibold text-[#1a1815] mb-3"
              style={{ fontFamily: "'Cormorant Garamond', serif" }}
            >
              6. Intellectual Property
            </h2>
            <p className="text-[15px] text-[#3d3a36] leading-relaxed">
              All content, design, and functionality of the Service are the property of Properties for Rentz
              and are protected by applicable intellectual property laws. You retain ownership of content you
              upload (such as property images and descriptions), but grant us a non-exclusive, worldwide,
              royalty-free license to display that content on the Service for the purpose of operating and
              promoting property listings.
            </p>
          </section>

          {/* Disclaimer */}
          <section>
            <h2
              className="text-xl font-semibold text-[#1a1815] mb-3"
              style={{ fontFamily: "'Cormorant Garamond', serif" }}
            >
              7. Disclaimer of Warranties
            </h2>
            <p className="text-[15px] text-[#3d3a36] leading-relaxed">
              The Service is provided on an &quot;as is&quot; and &quot;as available&quot; basis. We do not guarantee
              the accuracy, completeness, or reliability of any property listing. Properties for Rentz acts
              solely as a platform connecting property seekers and owners, and is not a party to any rental
              or sale transaction between users. We are not responsible for the condition, legality, or
              availability of any listed property.
            </p>
          </section>

          {/* Limitation of Liability */}
          <section>
            <h2
              className="text-xl font-semibold text-[#1a1815] mb-3"
              style={{ fontFamily: "'Cormorant Garamond', serif" }}
            >
              8. Limitation of Liability
            </h2>
            <p className="text-[15px] text-[#3d3a36] leading-relaxed">
              To the maximum extent permitted by law, Properties for Rentz shall not be liable for any
              indirect, incidental, special, or consequential damages arising from your use of the Service,
              including but not limited to financial losses from property transactions, data loss, or
              unauthorized access to your account.
            </p>
          </section>

          {/* Account Termination */}
          <section>
            <h2
              className="text-xl font-semibold text-[#1a1815] mb-3"
              style={{ fontFamily: "'Cormorant Garamond', serif" }}
            >
              9. Account Termination
            </h2>
            <ul className="space-y-2 text-[15px] text-[#3d3a36]">
              <li className="flex items-start gap-3">
                <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-[#b5936b] flex-shrink-0" />
                <span>You may delete your account at any time through the app or by contacting support.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-[#b5936b] flex-shrink-0" />
                <span>We reserve the right to suspend or terminate accounts that violate these terms.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-[#b5936b] flex-shrink-0" />
                <span>Upon account deletion, all your personal data and listings will be permanently removed.</span>
              </li>
            </ul>
          </section>

          {/* Privacy */}
          <section>
            <h2
              className="text-xl font-semibold text-[#1a1815] mb-3"
              style={{ fontFamily: "'Cormorant Garamond', serif" }}
            >
              10. Privacy
            </h2>
            <p className="text-[15px] text-[#3d3a36] leading-relaxed">
              Your use of the Service is also governed by our{' '}
              <a
                href="/privacy"
                className="text-[#b5936b] font-semibold underline underline-offset-2 hover:text-[#8a6b4a] transition-colors"
              >
                Privacy Policy
              </a>
              , which describes how we collect, use, and protect your personal information.
            </p>
          </section>

          {/* Changes to Terms */}
          <section>
            <h2
              className="text-xl font-semibold text-[#1a1815] mb-3"
              style={{ fontFamily: "'Cormorant Garamond', serif" }}
            >
              11. Changes to These Terms
            </h2>
            <p className="text-[15px] text-[#3d3a36] leading-relaxed">
              We may update these Terms from time to time. When we do, we will revise the &quot;Last updated&quot;
              date at the top of this page. Continued use of the Service after changes constitutes your
              acceptance of the updated Terms.
            </p>
          </section>

          {/* Governing Law */}
          <section>
            <h2
              className="text-xl font-semibold text-[#1a1815] mb-3"
              style={{ fontFamily: "'Cormorant Garamond', serif" }}
            >
              12. Governing Law
            </h2>
            <p className="text-[15px] text-[#3d3a36] leading-relaxed">
              These Terms shall be governed by and construed in accordance with the laws of India. Any
              disputes arising from these Terms shall be subject to the exclusive jurisdiction of the
              courts in Karnataka, India.
            </p>
          </section>

          {/* Contact */}
          <section className="pt-4 border-t border-[#e8e2db]">
            <h2
              className="text-xl font-semibold text-[#1a1815] mb-3"
              style={{ fontFamily: "'Cormorant Garamond', serif" }}
            >
              13. Contact Us
            </h2>
            <p className="text-[15px] text-[#3d3a36] leading-relaxed">
              If you have any questions about these Terms, please contact us at{' '}
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
