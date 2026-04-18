export function getLat(property) {
  return property?.lat ?? property?.latitude ?? null;
}

export function getLng(property) {
  return property?.lng ?? property?.longitude ?? null;
}
