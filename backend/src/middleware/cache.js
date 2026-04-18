const NodeCache = require('node-cache');

const propertyCache = new NodeCache({
  stdTTL: 60,
  checkperiod: 120,
  useClones: false,
});

function buildDefaultCacheKey(req) {
  const userPart = req.user ? `${req.user.id}:${req.user.role}` : 'public';
  return `${req.method}:${req.baseUrl}${req.path}:${userPart}:${JSON.stringify(req.query || {})}`;
}

function normalizeNumber(value, decimals = 4) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return 'na';
  return parsed.toFixed(decimals);
}

function buildNearbyCacheKey(req) {
  const lat = normalizeNumber(req.query.lat, 4);
  const lng = normalizeNumber(req.query.lng, 4);
  const radius = normalizeNumber(req.query.radius ?? 5, 2);
  const category = req.query.category || 'all';
  const page = parseInt(req.query.page, 10) || 1;
  const limit = Math.min(parseInt(req.query.limit, 10) || 20, 50);
  return `nearby:${lat}:${lng}:${radius}:category:${category}:page:${page}:limit:${limit}`;
}

function cacheResponse(ttlSeconds = 60, options = {}) {
  const keyBuilder = options.keyBuilder || buildDefaultCacheKey;

  return (req, res, next) => {
    const key = keyBuilder(req);
    const cached = propertyCache.get(key);

    if (cached) {
      return res.status(200).json(cached);
    }

    const originalJson = res.json.bind(res);
    res.json = (payload) => {
      if (res.statusCode >= 200 && res.statusCode < 300) {
        propertyCache.set(key, payload, ttlSeconds);
      }
      return originalJson(payload);
    };

    return next();
  };
}

function invalidatePropertyCaches() {
  propertyCache.flushAll();
}

module.exports = {
  cacheResponse,
  buildNearbyCacheKey,
  invalidatePropertyCaches,
};
