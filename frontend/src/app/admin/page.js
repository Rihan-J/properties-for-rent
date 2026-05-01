'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import api from '@/lib/api';
import ProtectedRoute from '@/components/ProtectedRoute';
import { getOptimizedImageUrl } from '@/lib/cloudinary';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
  CartesianGrid,
  LabelList
} from 'recharts';

// ─── Tab Button ─────────────────────────────────────────
function Tab({ active, onClick, children, count }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 border ${
        active
          ? 'bg-[#1a1815] text-white border-[#1a1815] shadow-md shadow-[#1a1815]/15'
          : 'bg-white text-[#1a1815] border-[#e2ddd8] hover:bg-[#f7f4f0] hover:border-[#b5936b]'
      }`}
    >
      {children}
      {count !== undefined && (
        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
          active ? 'bg-white/20 text-white' : 'bg-[#f0ece7] text-black'
        }`}>
          {count}
        </span>
      )}
    </button>
  );
}

// ─── Properties Tab ─────────────────────────────────────
function PropertiesPanel() {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState('');
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  async function fetchProperties(pageNum) {
    setLoading(true);
    try {
      const res = await api.get('/admin/properties', { params: { page: pageNum, limit: 20 } });
      setProperties(res.data.data.properties);
      setMeta(res.data.meta);
    } catch {
      setError('Failed to load properties');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchProperties(page);
  }, [page]);

  async function handleApprove(id) {
    setActionLoading(id);
    try {
      await api.patch(`/admin/properties/${id}/approve`);
      setProperties(prev => prev.map(p => p.id === id ? { ...p, status: 'approved' } : p));
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to approve');
    } finally {
      setActionLoading('');
    }
  }

  async function confirmDelete() {
    const id = deleteTarget;
    setDeleteTarget(null);
    if (!id) return;
    setActionLoading(id);
    try {
      await api.delete(`/admin/properties/${id}`);
      setProperties(prev => prev.filter(p => p.id !== id));
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to delete');
    } finally {
      setActionLoading('');
    }
  }

  const statusColor = {
    pending: 'bg-[#fdf8f4] text-black border border-[#e2ddd8]',
    approved: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
    rejected: 'bg-red-50 text-red-700 border border-red-200',
  };

  if (error) return <div className="px-5 py-4 bg-white border border-red-200 rounded-xl text-red-600 text-sm font-medium">{error}</div>;

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3, 4].map(i => <div key={i} className="bg-white border border-[#e8e2db] rounded-xl h-20 animate-pulse" />)}
      </div>
    );
  }

  if (properties.length === 0) {
    return (
      <div className="text-center py-20">
        <span className="text-2xl block mb-2">📋</span>
        <p className="text-lg font-semibold text-[#1a1815]">No properties to manage</p>
        <p className="text-sm text-black mt-1">Properties will appear here once listed</p>
      </div>
    );
  }

  return (
    <>
      <div className="bg-white rounded-2xl shadow-sm border border-[#e8e2db] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#e8e2db] bg-[#faf9f7]">
                <th className="text-left px-6 py-3.5 text-[10px] font-bold text-black uppercase tracking-[0.12em]">Property</th>
                <th className="text-left px-6 py-3.5 text-[10px] font-bold text-black uppercase tracking-[0.12em]">Category</th>
                <th className="text-left px-6 py-3.5 text-[10px] font-bold text-black uppercase tracking-[0.12em]">Owner</th>
                <th className="text-left px-6 py-3.5 text-[10px] font-bold text-black uppercase tracking-[0.12em]">Price</th>
                <th className="text-left px-6 py-3.5 text-[10px] font-bold text-black uppercase tracking-[0.12em]">Status</th>
                <th className="text-right px-6 py-3.5 text-[10px] font-bold text-black uppercase tracking-[0.12em]">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f0ece7]">
              {properties.map(p => (
                <tr key={p.id} className="hover:bg-[#faf9f7] transition-colors duration-200">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <img src={getOptimizedImageUrl(p.image_url, { width: 160 })} alt="" loading="lazy" className="w-11 h-11 rounded-lg object-cover shrink-0 border border-[#e8e2db]" />
                      <span className="text-sm font-medium text-[#1a1815] truncate max-w-[200px]">{p.title}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {p.category ? (
                      <span className="px-2 py-1 bg-[#fdf8f4] text-[#8a6b4a] border border-[#f0ece7] rounded-md text-[10px] font-bold uppercase tracking-wider">
                        {p.category.replace('_', ' ')}
                      </span>
                    ) : <span className="text-sm text-black">—</span>}
                  </td>
                  <td className="px-6 py-4">
                    <Link
                      href={`/admin/users/${p.owner_id}`}
                      className="text-sm text-[#1a1815] font-medium hover:text-[#8a6b4a] underline underline-offset-2 decoration-[#e2ddd8] hover:decoration-[#b5936b] transition-all duration-200"
                    >
                      {p.owner_name || '—'}
                    </Link>
                  </td>
                  <td className="px-6 py-4 text-sm font-semibold text-[#1a1815]">₹{Number(p.price).toLocaleString('en-IN')}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${statusColor[p.status] || ''}`}>
                      {p.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      {p.status !== 'approved' && (
                        <button onClick={() => handleApprove(p.id)} disabled={actionLoading === p.id}
                          className="px-3.5 py-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg hover:bg-emerald-100 disabled:opacity-50 transition-all duration-200 active:scale-[0.98]">
                          Approve
                        </button>
                      )}
                      <button onClick={() => setDeleteTarget(p.id)} disabled={actionLoading === p.id}
                        className="px-3.5 py-1.5 text-xs font-bold text-red-700 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 disabled:opacity-50 transition-all duration-200 active:scale-[0.98]">
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {meta && meta.totalPages > 1 && (
        <div className="flex items-center justify-center gap-4 mt-10">
          <button onClick={() => setPage(prev => Math.max(1, prev - 1))} disabled={page === 1}
            className="px-5 py-2.5 border border-[#e2ddd8] rounded-xl text-sm font-bold text-[#1a1815] hover:bg-white hover:shadow-sm disabled:opacity-40 transition-all duration-300 active:scale-[0.98]">
            ← Previous
          </button>
          <span className="text-sm font-bold text-black bg-[#f0ece7] px-4 py-2 rounded-lg border border-[#e2ddd8]">Page {meta.page} of {meta.totalPages}</span>
          <button onClick={() => setPage(prev => Math.min(meta.totalPages, prev + 1))} disabled={page >= meta.totalPages}
            className="px-5 py-2.5 border border-[#e2ddd8] rounded-xl text-sm font-bold text-[#1a1815] hover:bg-white hover:shadow-sm disabled:opacity-40 transition-all duration-300 active:scale-[0.98]">
            Next →
          </button>
        </div>
      )}

      {/* Delete Modal */}
      {deleteTarget && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center" style={{ backgroundColor: 'rgba(26,24,21,0.4)', backdropFilter: 'blur(4px)' }}>
          <div className="bg-white rounded-2xl shadow-xl border border-[#e8e2db] p-8 max-w-sm w-full mx-4 text-center">
            <div className="w-14 h-14 bg-red-50 border border-red-200 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-[#1a1815] mb-1" style={{ fontFamily: "'Cormorant Garamond', serif" }}>Delete this property?</h3>
            <p className="text-sm text-black mb-6">This action cannot be undone. The listing will be permanently removed.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteTarget(null)} className="flex-1 py-3 bg-[#f7f4f0] text-[#1a1815] font-bold text-sm rounded-xl border border-[#e2ddd8] hover:bg-[#f0ece7] transition-all duration-200 active:scale-[0.98]">Cancel</button>
              <button onClick={confirmDelete} className="flex-1 py-3 bg-red-600 text-white font-bold text-sm rounded-xl hover:bg-red-700 transition-all duration-200 active:scale-[0.98] shadow-sm">Yes, Delete</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// ─── Reviews Tab ────────────────────────────────────────
function ReviewsPanel() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [actionLoading, setActionLoading] = useState('');

  async function fetchReviews(pageNum) {
    setLoading(true);
    try {
      const res = await api.get('/admin/reviews', { params: { page: pageNum, limit: 20 } });
      setReviews(res.data.data.reviews);
      setMeta(res.data.meta);
    } catch {
      setError('Failed to load reviews');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchReviews(page);
  }, [page]);

  async function confirmDelete() {
    const id = deleteTarget;
    setDeleteTarget(null);
    if (!id) return;
    setActionLoading(id);
    try {
      await api.delete(`/admin/reviews/${id}`);
      setReviews(prev => prev.filter(r => r.id !== id));
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to delete review');
    } finally {
      setActionLoading('');
    }
  }

  if (error) return <div className="px-5 py-4 bg-white border border-red-200 rounded-xl text-red-600 text-sm font-medium">{error}</div>;

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map(i => <div key={i} className="bg-white border border-[#e8e2db] rounded-xl h-20 animate-pulse" />)}
      </div>
    );
  }

  if (reviews.length === 0) {
    return (
      <div className="text-center py-20">
        <span className="text-2xl block mb-2">💬</span>
        <p className="text-lg font-semibold text-[#1a1815]">No reviews yet</p>
        <p className="text-sm text-black mt-1">Reviews will appear here once users start reviewing</p>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-3">
        {reviews.map(r => {
          const date = new Date(r.created_at).toLocaleDateString('en-IN', {
            day: 'numeric', month: 'short', year: 'numeric',
          });

          return (
            <div key={r.id} className={`bg-white rounded-xl border border-[#e8e2db] p-5 shadow-sm transition-all ${actionLoading === r.id ? 'opacity-50' : ''}`}>
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-8 h-8 rounded-full bg-[#1a1815] text-white flex items-center justify-center text-xs font-bold shrink-0">
                      {(r.user_name || 'A').charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-[#1a1815]">{r.user_name}</p>
                      <p className="text-[10px] text-black">{r.user_email}</p>
                    </div>
                    <div className="flex items-center gap-0.5 ml-auto">
                      {[1, 2, 3, 4, 5].map(star => (
                        <span key={star} className={`text-sm ${star <= r.rating ? 'text-amber-400' : 'text-[#e2ddd8]'}`}>★</span>
                      ))}
                    </div>
                  </div>
                  
                  <Link
                    href={`/properties/${r.property_id}`}
                    className="text-xs font-bold text-[#8a6b4a] hover:text-[#1a1815] transition-colors underline underline-offset-2 decoration-[#e2ddd8]"
                  >
                    {r.property_title}
                  </Link>
                  
                  {r.comment && (
                    <p className="text-sm text-[#1a1815] leading-relaxed mt-2">{r.comment}</p>
                  )}
                  <p className="text-[10px] text-black font-medium mt-2">{date}</p>
                </div>
                
                <button
                  onClick={() => setDeleteTarget(r.id)}
                  disabled={actionLoading === r.id}
                  className="px-3 py-1.5 text-xs font-bold text-red-700 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 disabled:opacity-50 transition-all duration-200 active:scale-[0.98] shrink-0"
                >
                  Delete
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Pagination */}
      {meta && meta.totalPages > 1 && (
        <div className="flex items-center justify-center gap-4 mt-10">
          <button onClick={() => setPage(prev => Math.max(1, prev - 1))} disabled={page === 1}
            className="px-5 py-2.5 border border-[#e2ddd8] rounded-xl text-sm font-bold text-[#1a1815] hover:bg-white hover:shadow-sm disabled:opacity-40 transition-all duration-300 active:scale-[0.98]">
            ← Previous
          </button>
          <span className="text-sm font-bold text-black bg-[#f0ece7] px-4 py-2 rounded-lg border border-[#e2ddd8]">Page {meta.page} of {meta.totalPages}</span>
          <button onClick={() => setPage(prev => Math.min(meta.totalPages, prev + 1))} disabled={page >= meta.totalPages}
            className="px-5 py-2.5 border border-[#e2ddd8] rounded-xl text-sm font-bold text-[#1a1815] hover:bg-white hover:shadow-sm disabled:opacity-40 transition-all duration-300 active:scale-[0.98]">
            Next →
          </button>
        </div>
      )}

      {/* Delete Modal */}
      {deleteTarget && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center" style={{ backgroundColor: 'rgba(26,24,21,0.4)', backdropFilter: 'blur(4px)' }}>
          <div className="bg-white rounded-2xl shadow-xl border border-[#e8e2db] p-8 max-w-sm w-full mx-4 text-center">
            <div className="w-14 h-14 bg-red-50 border border-red-200 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-[#1a1815] mb-1" style={{ fontFamily: "'Cormorant Garamond', serif" }}>Delete this review?</h3>
            <p className="text-sm text-black mb-6">This review will be permanently removed.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteTarget(null)} className="flex-1 py-3 bg-[#f7f4f0] text-[#1a1815] font-bold text-sm rounded-xl border border-[#e2ddd8] hover:bg-[#f0ece7] transition-all duration-200 active:scale-[0.98]">Cancel</button>
              <button onClick={confirmDelete} className="flex-1 py-3 bg-red-600 text-white font-bold text-sm rounded-xl hover:bg-red-700 transition-all duration-200 active:scale-[0.98] shadow-sm">Yes, Delete</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// ─── Support Info Tab (Admin) ───────────────────────────
function SupportPanel() {
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
    <div className="bg-white rounded-2xl shadow-sm border border-[#e8e2db] p-8">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-[#fdf8f4] border border-[#f0ece7] rounded-xl flex items-center justify-center">
          <svg className="w-5 h-5 text-[#b5936b]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
        </div>
        <div>
          <h3 className="text-lg font-semibold text-[#1a1815]" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
            Support Contact Info
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

// ─── Analytics Tab (Admin) ──────────────────────────────
function AnalyticsPanel() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchStats() {
      try {
        const res = await api.get('/admin/stats');
        setStats(res.data.data);
      } catch (err) {
        setError('Failed to load analytics data.');
      } finally {
        setLoading(false);
      }
    }
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="bg-white rounded-2xl border border-[#e8e2db] p-8 animate-pulse space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {[1, 2, 3].map(i => <div key={i} className="h-24 bg-[#f0ece7] rounded-xl" />)}
        </div>
        <div className="h-64 bg-[#f0ece7] rounded-xl" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-2xl border border-red-200 p-8 text-center text-red-600 font-medium">
        {error}
      </div>
    );
  }

  if (!stats) return null;

  // Custom active shape for a gradient effect
  const colors = ['url(#colorGold)', 'url(#colorGold)', 'url(#colorGold)'];

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl shadow-sm border border-[#e8e2db] p-6 flex flex-col justify-center relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity duration-300">
            <svg className="w-16 h-16" fill="currentColor" viewBox="0 0 24 24"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>
          </div>
          <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-[#5a5550] mb-1 relative z-10">Total Users</p>
          <p className="text-4xl font-semibold text-[#1a1815] relative z-10" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
            {stats.totalUsers}
          </p>
        </div>
        <div className="bg-white rounded-2xl shadow-sm border border-[#e8e2db] p-6 flex flex-col justify-center relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity duration-300">
            <svg className="w-16 h-16" fill="currentColor" viewBox="0 0 24 24"><path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z"/></svg>
          </div>
          <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-[#5a5550] mb-1 relative z-10">Total Owners</p>
          <p className="text-4xl font-semibold text-[#1a1815] relative z-10" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
            {stats.totalOwners}
          </p>
        </div>
        <div className="bg-white rounded-2xl shadow-sm border border-[#e8e2db] p-6 flex flex-col justify-center relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity duration-300">
            <svg className="w-16 h-16" fill="currentColor" viewBox="0 0 24 24"><path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/></svg>
          </div>
          <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-[#5a5550] mb-1 relative z-10">Total Properties</p>
          <p className="text-4xl font-semibold text-[#1a1815] relative z-10" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
            {stats.totalProperties}
          </p>
        </div>
      </div>

      {/* Chart Section */}
      <div className="bg-white rounded-2xl shadow-sm border border-[#e8e2db] p-6 lg:p-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h3 className="text-xl font-semibold text-[#1a1815]" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
              Category Breakdown
            </h3>
            <p className="text-sm text-[#5a5550] mt-1">Distribution of properties across categories</p>
          </div>
          <div className="w-10 h-10 bg-[#fdf8f4] border border-[#f0ece7] rounded-xl flex items-center justify-center">
            <svg className="w-5 h-5 text-[#b5936b]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
        </div>
        
        {stats.categories && stats.categories.length > 0 ? (
          <div className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={stats.categories}
                margin={{ top: 30, right: 10, left: -20, bottom: 10 }}
              >
                <defs>
                  <linearGradient id="colorGold" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#b5936b" stopOpacity={1}/>
                    <stop offset="100%" stopColor="#8a6b4a" stopOpacity={1}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0ece7" />
                <XAxis 
                  dataKey="category" 
                  axisLine={{ stroke: '#e8e2db' }}
                  tickLine={false}
                  tick={{ fontSize: 13, fill: '#1a1815', fontWeight: 600, textTransform: 'capitalize' }}
                  dy={15}
                />
                <YAxis 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: '#8a8580' }}
                  allowDecimals={false}
                  dx={-10}
                />
                <Tooltip 
                  cursor={{ fill: '#faf9f7', radius: 8 }}
                  contentStyle={{ 
                    borderRadius: '12px', 
                    border: '1px solid #e8e2db',
                    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                    padding: '12px 16px',
                    backgroundColor: '#ffffff'
                  }}
                  itemStyle={{ color: '#1a1815', fontWeight: 'bold', fontSize: '15px' }}
                  labelStyle={{ color: '#8a8580', textTransform: 'capitalize', marginBottom: '4px', fontSize: '13px' }}
                />
                <Bar 
                  dataKey="count" 
                  radius={[8, 8, 8, 8]} 
                  barSize={48}
                  background={{ fill: '#f7f4f0', radius: [8, 8, 8, 8] }}
                  animationDuration={1500}
                >
                  {stats.categories.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill="url(#colorGold)" />
                  ))}
                  <LabelList 
                    dataKey="count" 
                    position="top" 
                    fill="#1a1815" 
                    fontWeight="bold"
                    fontSize={14}
                    offset={10}
                  />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="h-[200px] flex items-center justify-center text-[#5a5550] text-sm bg-[#faf9f7] rounded-xl border border-dashed border-[#e2ddd8]">
            No properties found
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Main Admin Panel ───────────────────────────────────
function AdminPanel() {
  const [activeTab, setActiveTab] = useState('analytics');

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 lg:py-14">
      <div className="mb-10">
        <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-black mb-2">Dashboard</p>
        <h1 className="text-3xl font-semibold text-[#1a1815]" style={{ fontFamily: "'Cormorant Garamond', serif" }}>Admin Panel</h1>
        <p className="text-black text-sm mt-2">Manage listings, reviews, and user activity</p>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 mb-8 border-b border-[#e8e2db] pb-4">
        <Tab active={activeTab === 'analytics'} onClick={() => setActiveTab('analytics')}>
          📊 Analytics
        </Tab>
        <Tab active={activeTab === 'properties'} onClick={() => setActiveTab('properties')}>
          📋 Properties
        </Tab>
        <Tab active={activeTab === 'reviews'} onClick={() => setActiveTab('reviews')}>
          ⭐ Reviews
        </Tab>
        <Tab active={activeTab === 'support'} onClick={() => setActiveTab('support')}>
          📞 Support Info
        </Tab>
      </div>

      {/* Tab Content */}
      {activeTab === 'analytics' && <AnalyticsPanel />}
      {activeTab === 'properties' && <PropertiesPanel />}
      {activeTab === 'reviews' && <ReviewsPanel />}
      {activeTab === 'support' && <SupportPanel />}
    </div>
  );
}

export default function AdminPage() {
  return (
    <ProtectedRoute allowedRoles={['admin']}>
      <AdminPanel />
    </ProtectedRoute>
  );
}
