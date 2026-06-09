export const metadata = {
  title: 'Account Deletion Request — Properties for Rentz',
  description: 'Request deletion of your account and personal data from Properties for Rentz.',
};

export default function AccountDeletionPage() {
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
            Account Deletion
          </h1>
          <p className="text-[#5a5550] mt-2 text-sm">
            Request the deletion of your account and data
          </p>
        </div>

        {/* Content Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-[#e8e2db] p-8 md:p-10 space-y-8">
          <section>
            <p className="text-[#3d3a36] leading-relaxed text-[15px] mb-4">
              At Properties for Rentz, you have the right to request the complete deletion of your account and all associated personal data.
            </p>
            <p className="text-[#3d3a36] leading-relaxed text-[15px]">
              When your account is deleted, the following data will be permanently removed from our servers:
            </p>
            <ul className="space-y-2 text-[15px] text-[#3d3a36] mt-4 mb-6">
              <li className="flex items-start gap-3">
                <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-[#b5936b] flex-shrink-0" />
                <span>Your personal profile information (Name, Email, Phone Number)</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-[#b5936b] flex-shrink-0" />
                <span>All property listings you have uploaded</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-[#b5936b] flex-shrink-0" />
                <span>All images associated with your property listings</span>
              </li>
            </ul>
          </section>

          <section>
            <h2
              className="text-xl font-semibold text-[#1a1815] mb-3"
              style={{ fontFamily: "'Cormorant Garamond', serif" }}
            >
              How to Request Deletion
            </h2>
            <div className="bg-[#f7f4f0] rounded-xl p-6 border border-[#e8e2db]">
              <p className="text-[15px] text-[#3d3a36] leading-relaxed mb-4">
                To initiate the deletion of your account and data, please send an email to our support team from the email address associated with your account.
              </p>
              
              <div className="space-y-3">
                <div>
                  <span className="text-sm text-[#9e968d] uppercase tracking-wider font-semibold">Email To:</span>
                  <p className="font-medium text-[#1a1815]">
                    <a href="mailto:propertiesforrentz.in@gmail.com" className="text-[#b5936b] hover:underline">propertiesforrentz.in@gmail.com</a>
                  </p>
                </div>
                <div>
                  <span className="text-sm text-[#9e968d] uppercase tracking-wider font-semibold">Subject Line:</span>
                  <p className="font-medium text-[#1a1815]">Account Deletion Request</p>
                </div>
                <div>
                  <span className="text-sm text-[#9e968d] uppercase tracking-wider font-semibold">Email Body:</span>
                  <p className="text-[#3d3a36] text-[15px]">Please include your registered phone number or any other identifying information to help us locate your account quickly.</p>
                </div>
              </div>
            </div>
            
            <p className="text-[#5a5550] text-sm mt-4 italic">
              Note: We will process your deletion request within 30 days of receipt. We may contact you to verify your identity before finalizing the deletion.
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
