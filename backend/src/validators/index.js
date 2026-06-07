/**
 * Input validators — pure functions, no external dependencies.
 * Returns { valid: boolean, errors: string[] }
 */

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validateRegister(body) {
  const errors = [];
  const { name, email, password, role, phone } = body;

  if (!name || typeof name !== 'string' || name.trim().length < 2) {
    errors.push('Name is required and must be at least 2 characters');
  }
  if (name && name.trim().length > 100) {
    errors.push('Name must be under 100 characters');
  }
  if (!email || !EMAIL_REGEX.test(email)) {
    errors.push('Valid email is required');
  }
  
  const strongPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/;
  if (!password || !strongPasswordRegex.test(password)) {
    errors.push('Password must be at least 8 characters and include uppercase, lowercase, number, and special character');
  }
  if (password && password.length > 128) {
    errors.push('Password must be under 128 characters');
  }
  // Role is no longer validated here because it is strictly set by the backend
  if (!phone || !/^\+?[0-9]{10,15}$/.test(phone)) {
    errors.push('Phone is required and must be a valid 10-15 digit number');
  }
  if (!body.accepted_terms || body.accepted_terms !== true) {
    errors.push('You must accept the Privacy Policy to create an account');
  }

  return { valid: errors.length === 0, errors };
}

function validateLogin(body) {
  const errors = [];
  const { email, password } = body;

  if (!email || !EMAIL_REGEX.test(email)) {
    errors.push('Valid email is required');
  }
  if (!password || password.length === 0) {
    errors.push('Password is required');
  }

  return { valid: errors.length === 0, errors };
}

function validateProperty(body) {
  const errors = [];
  const {
    title,
    price,
    latitude,
    longitude,
    image_url,
    category,
    booking_type,
    booking_types,
    price_per_hour,
    price_per_day,
  } = body;
  const isLodge = category === 'lodge';

  if (!title || typeof title !== 'string' || title.trim().length < 3) {
    errors.push('Title must be at least 3 characters');
  }
  if (title && title.trim().length > 255) {
    errors.push('Title must be under 255 characters');
  }
  if (body.description && typeof body.description === 'string' && body.description.trim().length > 2000) {
    errors.push('Description must be under 2000 characters');
  }
  if (!isLodge) {
    if (price === undefined || price === null || isNaN(Number(price)) || Number(price) <= 0) {
      errors.push('Price must be a positive number');
    }
    if (Number(price) > 9999999999) {
      errors.push('Price exceeds maximum allowed value');
    }
  } else {
    // Normalize: accept booking_types array OR legacy booking_type string
    const types = Array.isArray(booking_types) ? booking_types : (booking_type ? [booking_type] : []);
    const validTypes = types.filter(t => ['hourly', 'daily'].includes(t));

    if (validTypes.length === 0) {
      errors.push('At least one booking type (hourly / daily) is required for lodge');
    }

    if (validTypes.includes('hourly')) {
      if (
        price_per_hour === undefined ||
        price_per_hour === null ||
        isNaN(Number(price_per_hour)) ||
        Number(price_per_hour) <= 0
      ) {
        errors.push('Price per hour must be a positive number for hourly lodge');
      }
    }

    if (validTypes.includes('daily')) {
      if (
        price_per_day === undefined ||
        price_per_day === null ||
        isNaN(Number(price_per_day)) ||
        Number(price_per_day) <= 0
      ) {
        errors.push('Price per day must be a positive number for daily lodge');
      }
    }
  }
  if (latitude === undefined || isNaN(Number(latitude)) || Number(latitude) < -90 || Number(latitude) > 90) {
    errors.push('Latitude must be between -90 and 90');
  }
  if (longitude === undefined || isNaN(Number(longitude)) || Number(longitude) < -180 || Number(longitude) > 180) {
    errors.push('Longitude must be between -180 and 180');
  }
  if (!image_url || typeof image_url !== 'string' || !image_url.startsWith('http')) {
    errors.push('A valid image URL is required');
  }
  if (body.phone && !/^\+?[0-9]{10,15}$/.test(body.phone)) {
    errors.push('Phone must be a valid 10-15 digit number');
  }

  const { area_sqft, price_per_sqft, total_price, municipal_status, revenue_type } = body;

  if (area_sqft !== undefined && area_sqft !== null && (isNaN(Number(area_sqft)) || Number(area_sqft) <= 0)) {
    errors.push('Area (sqft) must be a positive number');
  }
  if (price_per_sqft !== undefined && price_per_sqft !== null && isNaN(Number(price_per_sqft))) {
    errors.push('Price per sqft must be a number');
  }
  if (total_price !== undefined && total_price !== null && isNaN(Number(total_price))) {
    errors.push('Total price must be a number');
  }
  if (municipal_status && !['approved', 'pending', 'not_approved'].includes(municipal_status)) {
    errors.push('Invalid municipal status');
  }
  if (revenue_type && !['A_khata', 'B_khata', 'gram_panchayat'].includes(revenue_type)) {
    errors.push('Invalid revenue type');
  }

  return { valid: errors.length === 0, errors };
}

function validateNearbyQuery(query) {
  const errors = [];
  const { lat, lng, radius } = query;

  if (!lat || isNaN(Number(lat)) || Number(lat) < -90 || Number(lat) > 90) {
    errors.push('Valid latitude (-90 to 90) is required');
  }
  if (!lng || isNaN(Number(lng)) || Number(lng) < -180 || Number(lng) > 180) {
    errors.push('Valid longitude (-180 to 180) is required');
  }
  if (radius !== undefined && (isNaN(Number(radius)) || Number(radius) <= 0 || Number(radius) > 100)) {
    errors.push('Radius must be between 0 and 100 km');
  }

  return { valid: errors.length === 0, errors };
}

function validatePagination(query) {
  let page = parseInt(query.page, 10) || 1;
  let limit = parseInt(query.limit, 10) || 20;

  if (page < 1) page = 1;
  if (limit < 1) limit = 1;
  if (limit > 50) limit = 50; // Hard cap

  const offset = (page - 1) * limit;
  return { page, limit, offset };
}

module.exports = {
  validateRegister,
  validateLogin,
  validateProperty,
  validateNearbyQuery,
  validatePagination,
};
