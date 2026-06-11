'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import api from '@/lib/api';
import PropertyCard from '@/components/PropertyCard';
import EmptyState from '@/components/EmptyState';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useAuth } from '@/context/AuthContext';

function DashboardPage() {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState('');
  const { user } = useAuth();

  useEffect(() => {
    async function fetchMyProperties() {
      setLoading(true);
      setError('');
      try {
        // Backend filters properties to the logged-in owner implicitly
        const res = await api.get('/properties');
        setProperties(res.data.data.properties || []);
      } catch (err) {
        setError('Failed to load your properties');
      } finally {
        setLoading(false);
      }
    }
    fetchMyProperties();
  }, []);

  function handleDeleteClick(e, id) {
    e.preventDefault();
    e.stopPropagation();
    setDeleteTarget(id);
  }

  async function confirmDelete() {
    const id = deleteTarget;
    setDeleteTarget(null);
    if (!id) return;

    setDeleteLoading(id);
    try {
      await api.delete(`/properties/${id}`);
      setProperties((prev) => prev.filter((p) => p.id !== id));
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to delete property');
    } finally {
      setDeleteLoading('');
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-16 min-h-[calc(100vh-64px)]">
      <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-[#e8e2db] pb-6">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-black mb-2">Dashboard</p>
          <h1 className="text-4xl lg:text-5xl font-semibold text-[#1a1815]" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
            My Listings
          </h1>
          <p className="text-sm text-[#5a5550] mt-3">Manage your properties and track your portfolio.</p>
        </div>
        <Link
          href="/dashboard/add-property"
          className="inline-flex items-center justify-center px-6 py-3 bg-[#1a1815] text-white text-sm font-bold rounded-xl hover:bg-[#2e2a25] shadow-sm hover:shadow-md transition-all duration-300 active:scale-[0.98]"
        >
          <span className="mr-2 text-lg leading-none">+</span> Add Property
        </Link>
      </div>

      {error && (
        <div className="mb-8 px-5 py-4 bg-white border border-red-200 rounded-xl text-red-600 text-sm font-medium">
          {error}
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-white rounded-2xl border border-[#e8e2db] overflow-hidden animate-pulse shadow-sm">
              <div className="w-full h-56 bg-[#f0ece7]" />
              <div className="p-5 space-y-3">
                <div className="h-5 bg-[#f0ece7] rounded w-3/4" />
                <div className="h-4 bg-[#f0ece7] rounded w-1/4" />
                <div className="h-4 bg-[#f0ece7] rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      ) : properties.length === 0 ? (
        <EmptyState
          icon="🏘️"
          title="No properties listed yet"
          subtitle="Start earning by listing your first property."
          actionLabel="Add Property"
          actionHref="/dashboard/add-property"
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {properties.map((p) => (
            <PropertyCard
              key={p.id}
              property={p}
              showDelete={true}
              onDelete={handleDeleteClick}
              isDeleting={deleteLoading === p.id}
            />
          ))}
        </div>
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
            <p className="text-sm text-black mb-6">This action cannot be undone. The listing and its image will be permanently removed.</p>
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

export default function ProtectedDashboardPage() {
  return (
    <ProtectedRoute allowedRoles={['owner']}>
      <DashboardPage />
    </ProtectedRoute>
  );
}
