'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import ProtectedRoute from '@/components/ProtectedRoute';

function AdminPanel() {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState('');
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null); // id of property pending delete confirmation

  async function fetchProperties(pageNum) {
    setLoading(true);
    try {
      const res = await api.get('/admin/properties', { params: { page: pageNum, limit: 20 } });
      setProperties(res.data.data.properties);
      setMeta(res.data.meta);
    } catch (err) {
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
      setProperties((prev) =>
        prev.map((p) => (p.id === id ? { ...p, status: 'approved' } : p))
      );
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to approve');
    } finally {
      setActionLoading('');
    }
  }

  // Step 1: User clicks delete → show confirmation
  function handleDeleteClick(id) {
    setDeleteTarget(id);
  }

  // Step 2: User confirms → actually delete
  async function confirmDelete() {
    const id = deleteTarget;
    setDeleteTarget(null);
    if (!id) return;

    console.log('Deleting property:', id);
    setActionLoading(id);
    try {
      await api.delete(`/admin/properties/${id}`);
      console.log('Delete successful:', id);
      setProperties((prev) => prev.filter((p) => p.id !== id));
    } catch (err) {
      console.error('Delete failed:', err.response?.data || err.message);
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

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 lg:py-14">
      <div className="mb-10">
        <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-black mb-2">Dashboard</p>
        <h1 className="text-3xl font-semibold text-[#1a1815]" style={{ fontFamily: "'Cormorant Garamond', serif" }}>Admin Panel</h1>
        <p className="text-black text-sm mt-2">Manage all property listings</p>
      </div>

      {error && (
        <div className="mb-6 px-5 py-4 bg-white border border-red-200 rounded-xl text-red-600 text-sm font-medium">
          {error}
        </div>
      )}

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white border border-[#e8e2db] rounded-xl h-20 animate-pulse" />
          ))}
        </div>
      ) : properties.length === 0 ? (
        <div className="text-center py-20">
          <div className="w-14 h-14 bg-[#f0ece7] rounded-2xl flex items-center justify-center mx-auto mb-4 border border-[#e8e2db]">
            <span className="text-2xl">📋</span>
          </div>
          <p className="text-lg font-semibold text-[#1a1815]">No properties to manage</p>
          <p className="text-sm text-black mt-1">Properties will appear here once listed</p>
        </div>
      ) : (
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
                  {properties.map((p) => (
                    <tr key={p.id} className="hover:bg-[#faf9f7] transition-colors duration-200">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <img src={p.image_url} alt="" className="w-11 h-11 rounded-lg object-cover shrink-0 border border-[#e8e2db]" />
                          <span className="text-sm font-medium text-[#1a1815] truncate max-w-[200px]">{p.title}</span>
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
                      <td className="px-6 py-4 text-sm text-black">{p.owner_name || '—'}</td>
                      <td className="px-6 py-4 text-sm font-semibold text-[#1a1815]">₹{Number(p.price).toLocaleString('en-IN')}</td>
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
                            onClick={() => handleDeleteClick(p.id)}
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
          </div>

          {/* Pagination */}
          {meta && meta.totalPages > 1 && (
            <div className="flex items-center justify-center gap-4 mt-10">
              <button
                onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                disabled={page === 1}
                className="px-5 py-2.5 border border-[#e2ddd8] rounded-xl text-sm font-bold text-[#1a1815] hover:bg-white hover:shadow-sm disabled:opacity-40 transition-all duration-300 active:scale-[0.98]"
              >
                ← Previous
              </button>
              <span className="text-sm font-bold text-black bg-[#f0ece7] px-4 py-2 rounded-lg border border-[#e2ddd8]">Page {meta.page} of {meta.totalPages}</span>
              <button
                onClick={() => setPage((prev) => Math.min(meta.totalPages, prev + 1))}
                disabled={page >= meta.totalPages}
                className="px-5 py-2.5 border border-[#e2ddd8] rounded-xl text-sm font-bold text-[#1a1815] hover:bg-white hover:shadow-sm disabled:opacity-40 transition-all duration-300 active:scale-[0.98]"
              >
                Next →
              </button>
            </div>
          )}
        </>
      )}

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

export default function AdminPage() {
  return (
    <ProtectedRoute allowedRoles={['admin']}>
      <AdminPanel />
    </ProtectedRoute>
  );
}
