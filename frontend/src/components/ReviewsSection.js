'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { useAuth } from '@/context/AuthContext';

// ─── Star Rating Display ────────────────────────────────
function Stars({ rating, size = 'sm' }) {
  const sizeClass = size === 'lg' ? 'text-xl' : 'text-sm';
  return (
    <div className={`flex items-center gap-0.5 ${sizeClass}`}>
      {[1, 2, 3, 4, 5].map((star) => (
        <span key={star} className={star <= rating ? 'text-amber-400' : 'text-[#e2ddd8]'}>
          ★
        </span>
      ))}
    </div>
  );
}

// ─── Star Rating Input ──────────────────────────────────
function StarInput({ value, onChange }) {
  const [hover, setHover] = useState(0);
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => onChange(star)}
          onMouseEnter={() => setHover(star)}
          onMouseLeave={() => setHover(0)}
          className={`text-2xl transition-all duration-150 hover:scale-110 ${
            star <= (hover || value) ? 'text-amber-400' : 'text-[#e2ddd8]'
          }`}
        >
          ★
        </button>
      ))}
      {value > 0 && (
        <span className="ml-2 text-xs font-bold text-black">{value}/5</span>
      )}
    </div>
  );
}

// ─── Review Card ────────────────────────────────────────
function ReviewCard({ review }) {
  const date = new Date(review.created_at).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric',
  });

  return (
    <div className="p-5 bg-[#faf9f7] rounded-xl border border-[#e8e2db]">
      <div className="flex items-start justify-between gap-3 mb-2">
        <div className="flex items-center gap-3">
          {/* Avatar */}
          <div className="w-9 h-9 rounded-full bg-[#1a1815] text-white flex items-center justify-center text-sm font-bold shrink-0">
            {(review.user_name || 'A').charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="text-sm font-semibold text-[#1a1815]">{review.user_name}</p>
            <p className="text-[10px] text-black font-medium">{date}</p>
          </div>
        </div>
        <Stars rating={review.rating} />
      </div>
      {review.comment && (
        <p className="text-sm text-[#1a1815] leading-relaxed mt-3 pl-12">{review.comment}</p>
      )}
    </div>
  );
}

// ─── Main Reviews Section ───────────────────────────────
export default function ReviewsSection({ propertyId }) {
  const { user } = useAuth();
  const [reviews, setReviews] = useState([]);
  const [stats, setStats] = useState({ count: 0, avgRating: 0 });
  const [loading, setLoading] = useState(true);

  // Form state
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    async function fetchReviews() {
      try {
        const res = await api.get(`/reviews/${propertyId}`);
        setReviews(res.data.data.reviews);
        setStats(res.data.data.stats);
      } catch {
        // silent fail — reviews are non-critical
      } finally {
        setLoading(false);
      }
    }
    if (propertyId) fetchReviews();
  }, [propertyId]);

  // Check if current user already reviewed
  const hasReviewed = user && reviews.some(r => r.user_name === user.name);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    if (rating === 0) { setError('Please select a rating'); return; }

    setSubmitting(true);
    try {
      const res = await api.post('/reviews', {
        property_id: propertyId,
        rating,
        comment: comment.trim() || null,
      });
      const newReview = res.data.data.review;
      setReviews(prev => [newReview, ...prev]);
      setStats(prev => {
        const newCount = prev.count + 1;
        const newAvg = parseFloat(((prev.avgRating * prev.count + rating) / newCount).toFixed(1));
        return { count: newCount, avgRating: newAvg };
      });
      setRating(0);
      setComment('');
      setSubmitted(true);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to submit review');
    } finally {
      setSubmitting(false);
    }
  }

  const inputCls =
    'w-full px-4 py-3 bg-[#faf9f7] border border-[#e2ddd8] rounded-xl ' +
    'focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#b5936b]/40 focus:border-[#b5936b] ' +
    'transition-all duration-200 text-[#1a1815] text-sm placeholder:text-[#b8b0a6] font-[450]';

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-[#e8e2db] p-6 sm:p-8 transition-all duration-300 hover:shadow-md hover:-translate-y-0.5">
      {/* Header with stats */}
      <div className="flex items-center justify-between mb-6">
        <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-black">
          Reviews
        </p>
        {stats.count > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-amber-400 text-lg">★</span>
            <span className="text-sm font-bold text-[#1a1815]">{stats.avgRating}</span>
            <span className="text-xs text-black">({stats.count} {stats.count === 1 ? 'review' : 'reviews'})</span>
          </div>
        )}
      </div>

      {/* Review Form (logged-in users only, not yet reviewed) */}
      {user && !hasReviewed && !submitted && (
        <form onSubmit={handleSubmit} className="mb-8 p-5 bg-[#f7f4f0] rounded-xl border border-[#e8e2db]">
          <p className="text-xs font-bold text-[#1a1815] uppercase tracking-wider mb-4">Write a Review</p>
          
          {error && (
            <div className="mb-4 px-4 py-2.5 bg-white border border-red-200 rounded-lg text-red-600 text-xs font-medium">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-[0.12em] text-black mb-2">Rating</label>
              <StarInput value={rating} onChange={setRating} />
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-[0.12em] text-black mb-2">Comment <span className="text-[#b8b0a6] normal-case tracking-normal">(optional)</span></label>
              <textarea
                rows={3}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className={`${inputCls} resize-none leading-relaxed`}
                placeholder="Share your experience with this property…"
                maxLength={1000}
              />
            </div>
            <button
              type="submit"
              disabled={submitting || rating === 0}
              className="px-6 py-3 bg-[#1a1815] text-white rounded-xl text-sm font-bold hover:bg-[#2e2a25] transition-all duration-200 active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {submitting ? 'Submitting…' : 'Submit Review'}
            </button>
          </div>
        </form>
      )}

      {/* Success message */}
      {submitted && (
        <div className="mb-6 flex items-center gap-2 px-4 py-3 bg-emerald-50 border border-emerald-200 rounded-xl">
          <svg className="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-xs font-semibold text-emerald-700">Thank you for your review!</p>
        </div>
      )}

      {/* Reviews List */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2].map(i => (
            <div key={i} className="h-24 bg-[#f0ece7] rounded-xl animate-pulse" />
          ))}
        </div>
      ) : reviews.length === 0 ? (
        <div className="text-center py-10">
          <span className="text-3xl block mb-2">💬</span>
          <p className="text-sm font-semibold text-[#1a1815]">No reviews yet</p>
          <p className="text-xs text-black mt-1">Be the first to share your experience</p>
        </div>
      ) : (
        <div className="space-y-3">
          {reviews.map(review => (
            <ReviewCard key={review.id} review={review} />
          ))}
        </div>
      )}
    </div>
  );
}
