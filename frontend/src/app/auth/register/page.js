'use client';

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function RegisterPage() {
  const { register } = useAuth();
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState('user');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await register(name, email, password, role, phone);
      router.push('/');
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-[#1a1815] rounded-xl flex items-center justify-center mx-auto mb-4">
            <span className="text-white font-bold text-base" style={{ fontFamily: "'Cormorant Garamond', serif" }}>AS</span>
          </div>
          <h1 className="text-3xl font-semibold text-[#1a1815]" style={{ fontFamily: "'Cormorant Garamond', serif" }}>Create your account</h1>
          <p className="text-black mt-2 text-sm">Join Apna Stay to find or list properties</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-[#e8e2db] p-8 space-y-5">
          {error && (
            <div className="flex items-start gap-3 px-4 py-3.5 bg-white border border-red-200 rounded-xl text-sm text-red-600 font-medium">
              {error}
            </div>
          )}

          <div>
            <label htmlFor="name" className="block text-[11px] font-bold uppercase tracking-[0.12em] text-black mb-2">Full Name</label>
            <input
              id="name"
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-3 bg-[#faf9f7] border border-[#e2ddd8] rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#b5936b]/40 focus:border-[#b5936b] transition-all duration-200 text-[#1a1815] text-sm placeholder:text-[#b8b0a6]"
              placeholder="Your full name"
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-[11px] font-bold uppercase tracking-[0.12em] text-black mb-2">Email</label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 bg-[#faf9f7] border border-[#e2ddd8] rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#b5936b]/40 focus:border-[#b5936b] transition-all duration-200 text-[#1a1815] text-sm placeholder:text-[#b8b0a6]"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-[11px] font-bold uppercase tracking-[0.12em] text-black mb-2">Password</label>
            <input
              id="password"
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 bg-[#faf9f7] border border-[#e2ddd8] rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#b5936b]/40 focus:border-[#b5936b] transition-all duration-200 text-[#1a1815] text-sm placeholder:text-[#b8b0a6]"
              placeholder="Min 6 characters"
            />
          </div>

          <div>
            <label htmlFor="phone" className="block text-[11px] font-bold uppercase tracking-[0.12em] text-black mb-2">Phone Number <span className="text-[#b8b0a6] font-normal normal-case tracking-normal">(optional)</span></label>
            <input
              id="phone"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full px-4 py-3 bg-[#faf9f7] border border-[#e2ddd8] rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#b5936b]/40 focus:border-[#b5936b] transition-all duration-200 text-[#1a1815] text-sm placeholder:text-[#b8b0a6]"
              placeholder="e.g. +919876543210"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase tracking-[0.12em] text-black mb-3">I want to</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setRole('user')}
                className={`px-4 py-4 rounded-xl border text-sm font-bold transition-all duration-300 hover:-translate-y-0.5 active:scale-[0.98] ${
                  role === 'user'
                    ? 'border-[#b5936b] bg-[#fdf8f4] text-[#1a1815] shadow-sm'
                    : 'border-[#e2ddd8] bg-[#faf9f7] text-black hover:border-[#b5936b]/50 hover:bg-white'
                }`}
              >
                <span className="block text-xl mb-1">🔍</span>
                Find a Stay
              </button>
              <button
                type="button"
                onClick={() => setRole('owner')}
                className={`px-4 py-4 rounded-xl border text-sm font-bold transition-all duration-300 hover:-translate-y-0.5 active:scale-[0.98] ${
                  role === 'owner'
                    ? 'border-[#b5936b] bg-[#fdf8f4] text-[#1a1815] shadow-sm'
                    : 'border-[#e2ddd8] bg-[#faf9f7] text-black hover:border-[#b5936b]/50 hover:bg-white'
                }`}
              >
                <span className="block text-xl mb-1">🏠</span>
                List Property
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-[#1a1815] text-white font-bold rounded-xl shadow-sm hover:bg-[#2e2a25] hover:shadow-md active:scale-[0.98] disabled:opacity-50 disabled:active:scale-100 disabled:cursor-not-allowed transition-all duration-300 text-sm mt-2"
          >
            {loading ? 'Creating account…' : 'Create Account'}
          </button>

          <p className="text-center text-sm text-black mt-6">
            Already have an account?{' '}
            <Link href="/auth/login" className="text-black font-bold hover:text-[#8a6b4a] transition-colors">
              Sign in
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
