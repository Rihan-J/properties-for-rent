/**
 * ReviewsSection — displays and submits property reviews.
 */
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity } from 'react-native';
import api from '../config/api';
import { useAuth } from '../context/AuthContext';
import { colors, fonts, fontSizes, spacing, borderRadius } from '../theme';

const Stars = ({ rating, onRate }) => {
  return (
    <View style={styles.starsContainer}>
      {[1, 2, 3, 4, 5].map(star => (
        <TouchableOpacity 
          key={star} 
          onPress={() => onRate && onRate(star)}
          disabled={!onRate}
        >
          <Text style={[styles.star, star <= rating ? styles.starActive : styles.starInactive]}>
            ★
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

export default function ReviewsSection({ propertyId }) {
  const { user } = useAuth();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Form state
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    async function fetchReviews() {
      try {
        const res = await api.get(`/reviews/${propertyId}`);
        setReviews(res.data.data.reviews || []);
      } catch (err) {
        console.warn('Failed to load reviews');
      } finally {
        setLoading(false);
      }
    }
    if (propertyId) fetchReviews();
  }, [propertyId]);

  const hasReviewed = user && reviews.some(r => r.user_name === user.name);

  const handleSubmit = async () => {
    if (rating === 0) {
      setErrorMsg('Please give a rating');
      return;
    }

    setSubmitting(true);
    setErrorMsg('');
    try {
      const res = await api.post('/reviews', {
        property_id: propertyId,
        rating,
        comment
      });
      
      const newReview = res.data.data.review;
      setReviews(prev => [newReview, ...prev]);
      
      // Reset form
      setRating(0);
      setComment('');
    } catch (err) {
      setErrorMsg(err.response?.data?.error || 'Failed to submit review');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <Text style={styles.loadingText}>Loading reviews...</Text>;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Reviews ({reviews.length})</Text>

      {user && !hasReviewed && (
        <View style={styles.formContainer}>
          <Text style={styles.formTitle}>Write a Review</Text>
          
          <Text style={styles.label}>Rating</Text>
          <Stars rating={rating} onRate={setRating} />
          
          <Text style={styles.label}>Comment</Text>
          <TextInput
            style={styles.input}
            placeholder="Share your experience (optional)"
            placeholderTextColor={colors.textMuted}
            value={comment}
            onChangeText={setComment}
            multiline
            numberOfLines={4}
          />

          {errorMsg ? <Text style={styles.errorText}>{errorMsg}</Text> : null}

          <TouchableOpacity 
            style={[styles.submitBtn, submitting && styles.submitBtnDisabled]} 
            onPress={handleSubmit}
            disabled={submitting}
          >
            <Text style={styles.submitBtnText}>{submitting ? 'Submitting...' : 'Submit Review'}</Text>
          </TouchableOpacity>
        </View>
      )}

      {!user && (
        <Text style={styles.loginPrompt}>Log in to write a review.</Text>
      )}

      {user && hasReviewed && (
        <Text style={styles.successPrompt}>Thank you for your review!</Text>
      )}

      <View style={styles.reviewsList}>
        {reviews.length === 0 ? (
          <Text style={styles.emptyText}>No reviews yet. Be the first to review!</Text>
        ) : (
          reviews.map(review => (
            <View key={review.id} style={styles.reviewCard}>
              <View style={styles.reviewHeader}>
                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>
                    {(review.user_name || 'A').charAt(0).toUpperCase()}
                  </Text>
                </View>
                <View style={styles.reviewMeta}>
                  <Text style={styles.reviewerName}>{review.user_name}</Text>
                  <Text style={styles.reviewDate}>
                    {new Date(review.created_at).toLocaleDateString('en-IN', {
                      month: 'short', day: 'numeric', year: 'numeric'
                    })}
                  </Text>
                </View>
              </View>
              <Stars rating={review.rating} />
              {review.comment ? (
                <Text style={styles.reviewComment}>{review.comment}</Text>
              ) : null}
            </View>
          ))
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginTop: spacing.md },
  sectionTitle: { fontFamily: fonts.serif, fontSize: fontSizes.xl, color: colors.text, marginBottom: spacing.lg },
  loadingText: { fontFamily: fonts.medium, fontSize: fontSizes.sm, color: colors.textSecondary },
  
  formContainer: { backgroundColor: colors.surfaceAlt, padding: spacing.lg, borderRadius: borderRadius.lg, marginBottom: spacing.xl, borderWidth: 1, borderColor: colors.borderLight },
  formTitle: { fontFamily: fonts.semiBold, fontSize: fontSizes.lg, color: colors.text, marginBottom: spacing.md },
  label: { fontFamily: fonts.medium, fontSize: fontSizes.sm, color: colors.textSecondary, marginBottom: spacing.xs, marginTop: spacing.sm },
  input: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: borderRadius.md, padding: spacing.md, fontFamily: fonts.regular, fontSize: fontSizes.sm, color: colors.text, minHeight: 80, textAlignVertical: 'top' },
  errorText: { fontFamily: fonts.medium, fontSize: fontSizes.xs, color: colors.errorText, marginTop: spacing.sm },
  submitBtn: { backgroundColor: colors.primary, paddingVertical: spacing.md, borderRadius: borderRadius.md, alignItems: 'center', marginTop: spacing.lg },
  submitBtnDisabled: { opacity: 0.7 },
  submitBtnText: { fontFamily: fonts.bold, fontSize: fontSizes.sm, color: '#fff' },
  
  starsContainer: { flexDirection: 'row', gap: 4, marginBottom: spacing.sm },
  star: { fontSize: 24 },
  starActive: { color: '#f59e0b' },
  starInactive: { color: '#e5e7eb' },
  
  loginPrompt: { fontFamily: fonts.medium, fontSize: fontSizes.sm, color: colors.textSecondary, marginBottom: spacing.xl, fontStyle: 'italic' },
  successPrompt: { fontFamily: fonts.semiBold, fontSize: fontSizes.sm, color: colors.success, marginBottom: spacing.xl, padding: spacing.md, backgroundColor: '#ecfdf5', borderRadius: borderRadius.md, textAlign: 'center' },
  
  reviewsList: { gap: spacing.lg },
  emptyText: { fontFamily: fonts.medium, fontSize: fontSizes.sm, color: colors.textSecondary, textAlign: 'center', marginVertical: spacing.xl },
  reviewCard: { borderBottomWidth: 1, borderBottomColor: colors.borderLight, paddingBottom: spacing.lg },
  reviewHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.sm },
  avatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.border, justifyContent: 'center', alignItems: 'center', marginRight: spacing.md },
  avatarText: { fontFamily: fonts.bold, fontSize: fontSizes.lg, color: colors.textSecondary },
  reviewMeta: { flex: 1 },
  reviewerName: { fontFamily: fonts.semiBold, fontSize: fontSizes.sm, color: colors.text },
  reviewDate: { fontFamily: fonts.regular, fontSize: fontSizes.xs, color: colors.textMuted },
  reviewComment: { fontFamily: fonts.regular, fontSize: fontSizes.sm, color: colors.text, lineHeight: 22, marginTop: spacing.sm },
});
