'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import api from '@/lib/api';
import ProtectedRoute from '@/components/ProtectedRoute';
import { getOptimizedImageUrl } from '@/lib/cloudinary';

function OwnerDetailPanel() {
  const { id } = useParams();
  const router = useRouter();
  const [owner, setOwner] = useState(null);
  const [properties, setProperties] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [actionLoading, setActionLoading] = useState('');

  useEffect(() => {
    async function fetchOwner() {
      try {
        const res = await api.get(`/admin/users/${id}`);
        setOwner(res.data.data.user);
        setProperties(res.data.data.properties);
        setStats(res.data.data.stats);
      } catch (err) {
        setError(err.response?.status === 404 ? 'User not found' : 'Failed to load user details');
      } finally {
        setLoading(false);
      }
    }
    if (id) fetchOwner();
  }, [id]);

  async function handleApprove(propId) {
    setActionLoading(propId);
    try {
      await api.patch(`/admin/properties/${propId}/approve`);
      setProperties(prev =>
        prev.map(p => p.id === propId ? { ...p, status: 'approved' } : p)
      );
      setStats(prev => ({
        ...prev,
        approvedCount: prev.approvedCount + 1,
        pendingCount: prev.pendingCount - 1,
      }));
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to approve');
    } finally {
      setActionLoading('');
    }
  }

  async function confirmDelete() {
    const propId = deleteTarget;
    setDeleteTarget(null);
    if (!propId) return;

    setActionLoading(propId);
    try {
      await api.delete(`/admin/properties/${propId}`);
      setProperties(prev => prev.filter(p => p.id !== propId));
      setStats(prev => ({
        ...prev,
        totalProperties: prev.totalProperties - 1,
      }));
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

  const joinedDate = owner?.created_at
    ? new Date(owner.created_at).toLocaleDateString('en-IN', {
        day: 'numeric', month: 'long', year: 'numeric',
      })
    : '—';

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10 lg:py-14">
        <div className="space-y-6">
          <div className="h-8 w-48 bg-[#f0ece7] rounded-lg animate-pulse" />
          <div className="h-40 bg-[#f0ece7] rounded-2xl animate-pulse" />
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-20 bg-[#f0ece7] rounded-xl animate-pulse" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-20 text-center">
        <div className="w-16 h-16 bg-[#f0ece7] rounded-2xl flex items-center justify-center mx-auto mb-4 border border-[#e8e2db]">
          <span className="text-3xl">😕</span>
        </div>
        <p className="text-lg font-semibold text-[#1a1815]">{error}</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10 lg:py-14">
      {/* Back button */}
      <button
        onClick={() => router.push('/admin')}
        className="flex items-center gap-2 text-black hover:text-[#1a1815] transition-colors text-sm font-medium mb-8"
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M10 12L6 8l4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        Back to Admin
      </button>

      {/* Owner Info Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-[#e8e2db] p-6 sm:p-8 mb-8">
        <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-black mb-6">Owner Profile</p>
        
        <div className="flex flex-col sm:flex-row items-start gap-6">
          {/* Avatar */}
          <div className="w-16 h-16 rounded-2xl bg-[#1a1815] text-white flex items-center justify-center text-2xl font-bold shrink-0">
            {(owner.name || 'O').charAt(0).toUpperCase()}
          </div>
          
          <div className="flex-1 space-y-4">
            <div>
              <h1 className="text-2xl font-semibold text-[#1a1815]" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
                {owner.name}
              </h1>
              <span className={`px-2 py-1 rounded-full text-xs font-semibold uppercase tracking-wider
                ${owner.role === 'admin' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                  'bg-gray-50 text-gray-700 border border-gray-200'}
              `}>
                {owner.role}
              </span>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-[#faf9f7] p-4 rounded-xl border border-[#e8e2db]">
                <p className="text-[#b8b0a6] text-[10px] font-bold uppercase tracking-wider mb-1">Email</p>
                <p className="text-[#1a1815] font-semibold text-sm truncate">{owner.email}</p>
              </div>
              <div className="bg-[#faf9f7] p-4 rounded-xl border border-[#e8e2db]">
                <p className="text-[#b8b0a6] text-[10px] font-bold uppercase tracking-wider mb-1">Phone</p>
                <p className="text-[#1a1815] font-semibold text-sm">{owner.phone || '—'}</p>
              </div>
              <div className="bg-[#faf9f7] p-4 rounded-xl border border-[#e8e2db]">
                <p className="text-[#b8b0a6] text-[10px] font-bold uppercase tracking-wider mb-1">Joined</p>
                <p className="text-[#1a1815] font-semibold text-sm">{joinedDate}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Row */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl border border-[#e8e2db] p-5 text-center shadow-sm">
            <p className="text-2xl font-bold text-[#1a1815]">{stats.totalProperties}</p>
            <p className="text-[10px] font-bold uppercase tracking-wider text-black mt-1">Total Listings</p>
          </div>
          <div className="bg-white rounded-xl border border-emerald-200 p-5 text-center shadow-sm">
            <p className="text-2xl font-bold text-emerald-600">{stats.approvedCount}</p>
            <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 mt-1">Approved</p>
          </div>
          <div className="bg-white rounded-xl border border-amber-200 p-5 text-center shadow-sm">
            <p className="text-2xl font-bold text-amber-600">{stats.pendingCount}</p>
            <p className="text-[10px] font-bold uppercase tracking-wider text-amber-700 mt-1">Pending</p>
          </div>
          <div className="bg-white rounded-xl border border-red-200 p-5 text-center shadow-sm">
            <p className="text-2xl font-bold text-red-600">{stats.rejectedCount}</p>
            <p className="text-[10px] font-bold uppercase tracking-wider text-red-700 mt-1">Rejected</p>
          </div>
        </div>
      )}

      {/* Properties Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-[#e8e2db] overflow-hidden">
        <div className="px-6 py-4 border-b border-[#e8e2db] bg-[#faf9f7]">
          <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-black">
            Listings by {owner.name}
          </p>
        </div>

        {properties.length === 0 ? (
          <div className="text-center py-16">
            <span className="text-3xl block mb-2">🏠</span>
            <p className="text-sm font-semibold text-[#1a1815]">No properties listed</p>
            <p className="text-xs text-black mt-1">This owner hasn&apos;t listed any properties yet</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#e8e2db] bg-[#faf9f7]">
                  <th className="text-left px-6 py-3.5 text-[10px] font-bold text-black uppercase tracking-[0.12em]">Property</th>
                  <th className="text-left px-6 py-3.5 text-[10px] font-bold text-black uppercase tracking-[0.12em]">Category</th>
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
                        <img
                          src={getOptimizedImageUrl(p.image_url, { width: 160 })}
                          alt=""
                          loading="lazy"
                          className="w-11 h-11 rounded-lg object-cover shrink-0 border border-[#e8e2db]"
                        />
                        <Link
                          href={`/properties/${p.id}`}
                          className="text-sm font-medium text-[#1a1815] truncate max-w-[200px] hover:text-[#8a6b4a] transition-colors"
                        >
                          {p.title}
                        </Link>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {p.category ? (
                        <span className="px-2 py-1 bg-[#fdf8f4] text-[#8a6b4a] border border-[#f0ece7] rounded-md text-[10px] font-bold uppercase tracking-wider">
                          {p.category.replace('_', ' ')}
                        </span>
                      ) : (
                        <span className="text-sm text-black">—</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm font-semibold text-[#1a1815]">
                      ₹{Number(p.price).toLocaleString('en-IN')}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${statusColor[p.status] || ''}`}>
                        {p.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        {p.status !== 'approved' && (
                          <button
                            onClick={() => handleApprove(p.id)}
                            disabled={actionLoading === p.id}
                            className="px-3.5 py-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg hover:bg-emerald-100 disabled:opacity-50 transition-all duration-200 active:scale-[0.98]"
                          >
                            Approve
                          </button>
                        )}
                        <button
                          onClick={() => setDeleteTarget(p.id)}
                          disabled={actionLoading === p.id}
                          className="px-3.5 py-1.5 text-xs font-bold text-red-700 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 disabled:opacity-50 transition-all duration-200 active:scale-[0.98]"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
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
              <button
                onClick={() => setDeleteTarget(null)}
                className="flex-1 py-3 bg-[#f7f4f0] text-[#1a1815] font-bold text-sm rounded-xl border border-[#e2ddd8] hover:bg-[#f0ece7] transition-all duration-200 active:scale-[0.98]"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="flex-1 py-3 bg-red-600 text-white font-bold text-sm rounded-xl hover:bg-red-700 transition-all duration-200 active:scale-[0.98] shadow-sm"
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function OwnerDetailPage() {
  return (
    <ProtectedRoute allowedRoles={['admin']}>
      <OwnerDetailPanel />
    </ProtectedRoute>
  );
}
