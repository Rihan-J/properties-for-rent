'use client';

import Link from 'next/link';

export default function VerifyPendingPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-sm border border-[#e8e2db] p-8 text-center space-y-6">
        <div className="w-16 h-16 bg-[#faf9f7] rounded-full flex items-center justify-center mx-auto mb-4 border border-[#e2ddd8]">
          <svg className="w-8 h-8 text-[#b5936b]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        </div>
        
        <h1 className="text-2xl font-bold text-[#1a1815]">Check your email</h1>
        
        <p className="text-[#5a5550] text-sm leading-relaxed">
          We&apos;ve sent a verification link to your email address. Please click the link to activate your account.
        </p>

        <div className="pt-6 border-t border-[#e8e2db]">
          <Link 
            href="/auth/login"
            className="text-sm font-bold text-black hover:text-[#b5936b] transition-colors"
          >
            Return to Login
          </Link>
        </div>
      </div>
    </div>
  );
}
