'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import api from '@/lib/api';

function VerifyContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  
  const [status, setStatus] = useState('loading'); // loading, success, error
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setMessage('Invalid verification link.');
      return;
    }

    let isMounted = true;

    async function verifyToken() {
      try {
        const res = await api.get(`/auth/verify?token=${encodeURIComponent(token)}`);
        if (isMounted) {
          setStatus('success');
          setMessage(res.data.message || 'Email verified successfully!');
          // You could automatically log them in here if you want, 
          // but forcing them to login is safer.
        }
      } catch (err) {
        if (isMounted) {
          setStatus('error');
          setMessage(err.response?.data?.error || 'Verification failed. The link might be expired.');
        }
      }
    }

    verifyToken();

    return () => {
      isMounted = false;
    };
  }, [token]);

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-sm border border-[#e8e2db] p-8 text-center space-y-6">
        
        {status === 'loading' && (
          <>
            <div className="w-16 h-16 rounded-full border-4 border-[#e2ddd8] border-t-[#b5936b] animate-spin mx-auto mb-4"></div>
            <h1 className="text-2xl font-bold text-[#1a1815]">Verifying Email...</h1>
            <p className="text-[#5a5550] text-sm">Please wait while we verify your email address.</p>
          </>
        )}

        {status === 'success' && (
          <>
            <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-green-100">
              <svg className="w-8 h-8 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-[#1a1815]">Email Verified!</h1>
            <p className="text-[#5a5550] text-sm leading-relaxed">{message}</p>
            <div className="pt-4">
              <Link href="/auth/login" className="inline-block py-3 px-8 bg-[#1a1815] text-white font-bold rounded-xl shadow-sm hover:bg-[#2e2a25] transition-all text-sm">
                Go to Login
              </Link>
            </div>
          </>
        )}

        {status === 'error' && (
          <>
            <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-red-100">
              <svg className="w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-[#1a1815]">Verification Failed</h1>
            <p className="text-red-600 text-sm leading-relaxed font-medium">{message}</p>
            <div className="pt-6 border-t border-[#e8e2db] flex flex-col gap-4">
              <Link href="/auth/login" className="text-sm font-bold text-black hover:text-[#b5936b] transition-colors">
                Return to Login
              </Link>
            </div>
          </>
        )}
        
      </div>
    </div>
  );
}

export default function VerifyPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <VerifyContent />
    </Suspense>
  );
}
