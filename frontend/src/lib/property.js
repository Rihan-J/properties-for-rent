export function getLat(property) {
  return property?.lat ?? property?.latitude ?? null;
}

export function getLng(property) {
  return property?.lng ?? property?.longitude ?? null;
}

/**
 * Returns pricing info for a property.
 * For lodges with booking_type = 'both', returns a multi-price object.
 */
export function getPropertyPricing(property) {
  if (!property) {
    return {
      amount: 0,
      unitShort: '/mo',
      unitLong: 'per month',
      label: '₹0 / month',
      isFlexible: false,
    };
  }

  if (property.category === 'lodge') {
    const hourly = property.price_per_hour ? Number(property.price_per_hour) : null;
    const daily = property.price_per_day ? Number(property.price_per_day) : null;

    // Both pricing options available
    if (property.booking_type === 'both' && hourly && daily) {
      return {
        amount: Math.min(hourly, daily), // primary display amount (lower price)
        unitShort: '/hr',
        unitLong: 'per hour',
        label: `₹${hourly.toLocaleString('en-IN')}/hr • ₹${daily.toLocaleString('en-IN')}/day`,
        labelCompact: `₹${hourly.toLocaleString('en-IN')}/hr | ₹${daily.toLocaleString('en-IN')}/day`,
        isFlexible: true,
        hourly,
        daily,
        pricingLines: [
          { amount: hourly, unit: 'per hour', label: `₹${hourly.toLocaleString('en-IN')} per hour` },
          { amount: daily, unit: 'per day', label: `₹${daily.toLocaleString('en-IN')} per day` },
        ],
      };
    }

    if (property.booking_type === 'hourly' || (!daily && hourly)) {
      const amount = hourly || Number(property.price ?? 0);
      return {
        amount,
        unitShort: '/hr',
        unitLong: 'per hour',
        label: `₹${amount.toLocaleString('en-IN')} / hour`,
        isFlexible: false,
      };
    }

    if (property.booking_type === 'daily' || (!hourly && daily)) {
      const amount = daily || Number(property.price ?? 0);
      return {
        amount,
        unitShort: '/day',
        unitLong: 'per day',
        label: `₹${amount.toLocaleString('en-IN')} / day`,
        isFlexible: false,
      };
    }
  }

  const amount = Number(property.price ?? 0);
  const isSale = property.listing_type === 'sale' || property.category === 'site';

  return {
    amount,
    unitShort: isSale ? '' : '/mo',
    unitLong: isSale ? '' : 'per month',
    label: isSale ? `₹${amount.toLocaleString('en-IN')}` : `₹${amount.toLocaleString('en-IN')} / month`,
    isFlexible: false,
  };
}
