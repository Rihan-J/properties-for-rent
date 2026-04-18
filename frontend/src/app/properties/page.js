'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import PropertyCard from '@/components/PropertyCard';
import PropertyListSkeleton from '@/components/skeletons/PropertyListSkeleton';
import EmptyState from '@/components/EmptyState';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useAuth } from '@/context/AuthContext';

const CATEGORIES = [
  { id: 'all',  label: 'All',  icon: '🏘️' },
  { id: 'home', label: 'Home', icon: '🏠' },
  { id: 'room', label: 'Room', icon: '🛏️' },
  { id: 'shop', label: 'Shop', icon: '🏪' },
  { id: 'pg',   label: 'PG',   icon: '🧑‍🎓' },
  { id: 'site', label: 'Site', icon: '🌍' },
];

function PropertiesPage() {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState(null);
  const [error, setError] = useState('');
  const [category, setCategory] = useState('all');
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState('');
  const { user, isOwner, isAdmin } = useAuth();

  async function fetchProperties(pageNum, cat) {
    setLoading(true);
    setError('');

    try {
      const params = { page: pageNum, limit: 20 };
      if (cat && cat !== 'all') params.category = cat;

      const res = await api.get('/properties', { params });
      setProperties(res.data.data.properties);
      setMeta(res.data.meta);
    } catch (err) {
      setError('Failed to load properties');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchProperties(page, category);
  }, [page, category]);

  // Reset to page 1 when category changes
  function handleCategoryChange(cat) {
    if (cat === category) return;
    setCategory(cat);
    setPage(1);
  }

  // Delete handlers
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

  const canDelete = (property) => {
    if (!user) return false;
    if (user.role === 'admin') return true;
    if (user.role === 'owner' && property.owner_id === user.id) return true;
    return false;
  };

  return (
    <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
      {/* Header */}
      <div className="mb-8">
        <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-black mb-2">
          {user?.role === 'owner' ? 'Dashboard' : 'Browse'}
        </p>
        <h1 className="text-4xl lg:text-5xl font-semibold text-[#1a1815]" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
          {user?.role === 'owner' ? 'My Listings' : 'All Properties'}
        </h1>
        <p className="text-base text-black mt-3 max-w-lg leading-relaxed">
          {user?.role === 'owner' 
            ? 'Manage your property listings and keep track of your portfolio.'
            : 'Browse our collection of curated stays, handpicked for comfort and location.'}
        </p>
      </div>

      {/* Category Filter Pills */}
      <div className="mb-8">
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => handleCategoryChange(cat.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 active:scale-[0.97] border
                ${category === cat.id
                  ? 'bg-[#1a1815] text-white border-[#1a1815] shadow-md shadow-[#1a1815]/15'
                  : 'bg-white text-[#1a1815] border-[#e2ddd8] hover:bg-[#f7f4f0] hover:border-[#b5936b]'
                }`}
            >
              <span className="text-base">{cat.icon}</span>
              {cat.label}
            </button>
          ))}
        </div>

        {/* Result count */}
        {!loading && meta && (
          <p className="text-sm text-black mt-4 font-medium">
            Showing <span className="font-bold text-[#1a1815]">{properties.length}</span> of <span className="font-bold text-[#1a1815]">{meta.total}</span> {meta.total === 1 ? 'property' : 'properties'}
            {category !== 'all' && (
              <span className="ml-1">
                in <span className="font-bold text-[#8a6b4a] capitalize">{category}</span>
              </span>
            )}
          </p>
        )}
      </div>

      {/* Error */}
      {error && (
        <div className="mb-8 px-5 py-4 bg-white border border-red-200 rounded-xl text-red-600 text-sm font-medium">
          {error}
        </div>
      )}

      {/* Grid */}
      {loading ? (
        <PropertyListSkeleton count={8} />
      ) : properties.length === 0 ? (
        <EmptyState
          icon={CATEGORIES.find(c => c.id === category)?.icon || '🏠'}
          title={category !== 'all' ? `No ${category} properties` : 'No properties yet'}
          subtitle={
            category !== 'all'
              ? `No properties found in the "${category}" category. Try another filter.`
              : 'Be the first to list a property, or check back soon for new listings.'
          }
          actionLabel={category !== 'all' ? undefined : 'List a Property'}
          actionHref={category !== 'all' ? undefined : '/dashboard/add-property'}
        />
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 lg:gap-8">
            {properties.map((p) => (
              <PropertyCard
                key={p.id}
                property={p}
                showDelete={canDelete(p)}
                onDelete={handleDeleteClick}
                isDeleting={deleteLoading === p.id}
              />
            ))}
          </div>

          {/* Pagination */}
          {meta && meta.totalPages > 1 && (
            <div className="flex items-center justify-center gap-4 mt-16">
              <button
                onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                disabled={page === 1}
                className="px-6 py-3 bg-white border border-[#e2ddd8] rounded-xl text-sm font-bold text-[#1a1815] hover:bg-[#f7f4f0] hover:shadow-sm hover:-translate-y-0.5 active:scale-[0.98] disabled:opacity-40 disabled:hover:scale-100 disabled:hover:-translate-y-0 disabled:hover:shadow-none disabled:cursor-not-allowed transition-all duration-300"
              >
                ← Previous
              </button>
              <span className="text-sm font-bold text-black bg-[#f0ece7] px-4 py-2 rounded-lg border border-[#e2ddd8]">
                Page {meta.page} of {meta.totalPages}
              </span>
              <button
                onClick={() => setPage((prev) => Math.min(meta.totalPages, prev + 1))}
                disabled={page >= meta.totalPages}
                className="px-6 py-3 bg-white border border-[#e2ddd8] rounded-xl text-sm font-bold text-[#1a1815] hover:bg-[#f7f4f0] hover:shadow-sm hover:-translate-y-0.5 active:scale-[0.98] disabled:opacity-40 disabled:hover:scale-100 disabled:hover:-translate-y-0 disabled:hover:shadow-none disabled:cursor-not-allowed transition-all duration-300"
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

export default function ProtectedPropertiesPage() {
  return (
    <ProtectedRoute allowedRoles={['owner', 'admin']}>
      <PropertiesPage />
    </ProtectedRoute>
  );
}

