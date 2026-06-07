'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import ProtectedRoute from '@/components/ProtectedRoute';
import SupportInfoCard from '@/components/SupportInfoCard';

// ─── Admin Support Editor ───────────────────────────────
function AdminSupportEditor() {
  const [support, setSupport] = useState({ email: '', phone: '', whatsapp: '', instagram: '' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    async function fetchSupport() {
      try {
        const res = await api.get('/support');
        setSupport(res.data.data);
      } catch {
        setError('Failed to load support info');
      } finally {
        setLoading(false);
      }
    }
    fetchSupport();
  }, []);

  async function handleSave() {
    setSaving(true);
    setError('');
    setSuccessMsg('');

    try {
      const res = await api.put('/support', support);
      setSupport(res.data.data);
      setSuccessMsg('Support info updated successfully!');
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update support info');
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="bg-white rounded-2xl border border-[#e8e2db] p-8 animate-pulse space-y-5">
        {[1, 2, 3, 4].map(i => <div key={i} className="h-12 bg-[#f0ece7] rounded-xl" />)}
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-[#e8e2db] p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-[#fdf8f4] border border-[#f0ece7] rounded-xl flex items-center justify-center">
          <svg className="w-5 h-5 text-[#b5936b]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
        </div>
        <div>
          <h3 className="text-lg font-semibold text-[#1a1815]" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
            Edit Support Info
          </h3>
          <p className="text-sm text-[#5a5550]">Visible to all users and owners</p>
        </div>
      </div>

      {error && (
        <div className="flex items-start gap-3 px-4 py-3.5 bg-white border border-red-200 rounded-xl text-sm text-red-600 font-medium mb-5">
          {error}
        </div>
      )}

      {successMsg && (
        <div className="flex items-start gap-3 px-4 py-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-sm text-emerald-700 font-medium mb-5">
          ✅ {successMsg}
        </div>
      )}

      <div className="space-y-5">
        <div>
          <label className="block text-[11px] font-bold uppercase tracking-[0.12em] text-black mb-2">Email</label>
          <input
            type="email"
            value={support.email || ''}
            onChange={(e) => setSupport(prev => ({ ...prev, email: e.target.value }))}
            className="w-full px-4 py-3 bg-[#faf9f7] border border-[#e2ddd8] rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#b5936b]/40 focus:border-[#b5936b] transition-all duration-200 text-[#1a1815] text-sm placeholder:text-[#b8b0a6]"
            placeholder="support@apnastay.com"
          />
        </div>

        <div>
          <label className="block text-[11px] font-bold uppercase tracking-[0.12em] text-black mb-2">Phone</label>
          <input
            type="tel"
            value={support.phone || ''}
            onChange={(e) => setSupport(prev => ({ ...prev, phone: e.target.value }))}
            className="w-full px-4 py-3 bg-[#faf9f7] border border-[#e2ddd8] rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#b5936b]/40 focus:border-[#b5936b] transition-all duration-200 text-[#1a1815] text-sm placeholder:text-[#b8b0a6]"
            placeholder="9876543210"
          />
        </div>

        <div>
          <label className="block text-[11px] font-bold uppercase tracking-[0.12em] text-black mb-2">WhatsApp Number</label>
          <input
            type="tel"
            value={support.whatsapp || ''}
            onChange={(e) => setSupport(prev => ({ ...prev, whatsapp: e.target.value }))}
            className="w-full px-4 py-3 bg-[#faf9f7] border border-[#e2ddd8] rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#b5936b]/40 focus:border-[#b5936b] transition-all duration-200 text-[#1a1815] text-sm placeholder:text-[#b8b0a6]"
            placeholder="9876543210"
          />
        </div>

        <div>
          <label className="block text-[11px] font-bold uppercase tracking-[0.12em] text-black mb-2">Instagram Handle</label>
          <input
            type="text"
            value={support.instagram || ''}
            onChange={(e) => setSupport(prev => ({ ...prev, instagram: e.target.value }))}
            className="w-full px-4 py-3 bg-[#faf9f7] border border-[#e2ddd8] rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#b5936b]/40 focus:border-[#b5936b] transition-all duration-200 text-[#1a1815] text-sm placeholder:text-[#b8b0a6]"
            placeholder="@apnastay"
          />
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full py-3.5 bg-[#1a1815] text-white font-bold rounded-xl shadow-sm hover:bg-[#2e2a25] hover:shadow-md active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 text-sm mt-2"
        >
          {saving ? 'Updating…' : 'Update Support Info'}
        </button>
      </div>
    </div>
  );
}

// ─── Account Settings Content ───────────────────────────
function AccountSettingsContent() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState('');
  const [confirmText, setConfirmText] = useState('');

  const role = user?.role;
  const isAdmin = role === 'admin';

  async function handleDeleteAccount() {
    if (confirmText !== 'DELETE') return;

    setDeleteLoading(true);
    setDeleteError('');

    try {
      await api.delete('/users/me');
      logout();
      router.push('/');
    } catch (err) {
      setDeleteError(err.response?.data?.error || 'Failed to delete account. Please try again.');
      setDeleteLoading(false);
    }
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10 lg:py-14">
      {/* Header */}
      <div className="mb-10">
        <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-black mb-2">Settings</p>
        <h1 className="text-3xl font-semibold text-[#1a1815]" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
          Account Settings
        </h1>
        <p className="text-black text-sm mt-2">Manage your account and get help</p>
      </div>

      <div className="space-y-8">
        {/* Account Info Card — visible to all roles */}
        <div className="bg-white rounded-2xl border border-[#e8e2db] shadow-sm p-6">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 bg-[#1a1815] rounded-xl flex items-center justify-center">
              <span className="text-white font-bold text-sm">
                {(user?.name || 'U').charAt(0).toUpperCase()}
              </span>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-[#1a1815]" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
                {user?.name}
              </h3>
              <p className="text-sm text-[#5a5550]">{user?.email}</p>
            </div>
            <span className="ml-auto px-3 py-1 bg-[#f0ece7] text-black border border-[#e2ddd8] rounded-full text-[10px] font-bold uppercase tracking-wider">
              {user?.role}
            </span>
          </div>

          {user?.phone && (
            <div className="flex items-center gap-3 text-sm text-[#3d3a36] pt-4 border-t border-[#f0ece7]">
              <svg className="w-4 h-4 text-[#8a6b4a]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
              <span>{user.phone}</span>
            </div>
          )}
        </div>

        {/* ── ADMIN: Support Editor ── */}
        {isAdmin && <AdminSupportEditor />}

        {/* ── USER / OWNER: Read-only Support Info ── */}
        {!isAdmin && <SupportInfoCard />}

        {/* ── USER / OWNER: Danger Zone (Delete Account) ── */}
        {!isAdmin && (
          <div className="bg-white rounded-2xl border border-red-200 shadow-sm p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-red-50 border border-red-200 rounded-xl flex items-center justify-center">
                <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-red-700" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
                  Danger Zone
                </h3>
                <p className="text-sm text-red-600/70">Irreversible actions</p>
              </div>
            </div>

            <p className="text-sm text-[#3d3a36] mb-4 leading-relaxed">
              This action cannot be undone. This will permanently delete your account, reviews, and personal information.
              This action <strong>cannot be undone</strong>.
            </p>

            <button
              onClick={() => setShowDeleteModal(true)}
              className="px-5 py-2.5 bg-red-600 text-white font-bold text-sm rounded-xl hover:bg-red-700 transition-all duration-200 active:scale-[0.98] shadow-sm"
            >
              Delete My Account
            </button>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal — only for non-admin */}
      {!isAdmin && showDeleteModal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center" style={{ backgroundColor: 'rgba(26,24,21,0.4)', backdropFilter: 'blur(4px)' }}>
          <div className="bg-white rounded-2xl shadow-xl border border-[#e8e2db] p-8 max-w-sm w-full mx-4">
            <div className="text-center">
              <div className="w-14 h-14 bg-red-50 border border-red-200 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-[#1a1815] mb-1" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
                Delete your account?
              </h3>
              <p className="text-sm text-[#5a5550] mb-5">
                This will permanently delete your account and all associated data. Type <strong className="text-red-600">DELETE</strong> to confirm.
              </p>

              <input
                type="text"
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                placeholder='Type "DELETE" to confirm'
                className="w-full px-4 py-3 bg-[#faf9f7] border border-[#e2ddd8] rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-400/40 focus:border-red-400 transition-all duration-200 text-[#1a1815] text-sm placeholder:text-[#b8b0a6] mb-4"
              />

              {deleteError && (
                <div className="px-4 py-2.5 bg-white border border-red-200 rounded-xl text-sm text-red-600 font-medium mb-4">
                  {deleteError}
                </div>
              )}

              <div className="flex gap-3">
                <button
                  onClick={() => { setShowDeleteModal(false); setConfirmText(''); setDeleteError(''); }}
                  disabled={deleteLoading}
                  className="flex-1 py-3 bg-[#f7f4f0] text-[#1a1815] font-bold text-sm rounded-xl border border-[#e2ddd8] hover:bg-[#f0ece7] transition-all duration-200 active:scale-[0.98] disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteAccount}
                  disabled={deleteLoading || confirmText !== 'DELETE'}
                  className="flex-1 py-3 bg-red-600 text-white font-bold text-sm rounded-xl hover:bg-red-700 transition-all duration-200 active:scale-[0.98] shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {deleteLoading ? 'Deleting…' : 'Yes, Delete'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function AccountSettingsPage() {
  return (
    <ProtectedRoute allowedRoles={['user', 'owner', 'admin']}>
      <AccountSettingsContent />
    </ProtectedRoute>
  );
}
