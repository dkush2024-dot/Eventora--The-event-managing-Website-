const redis = require('../config/redisClient');

const ROLE_LIMITS = {
  Participant: 10,
  Organizer: 20,
  Admin: 100
};

const RATE_LIMIT_WINDOW = 60;

const roleBasesRateLimiter = async (req, res, next) => {
  try {
    const user = req.user;
    const id = user?.id || req.ip;
    const role = user?.role || 'Participant';
    const key = `rate_limit:${id}`;
    const limit = ROLE_LIMITS[role] || ROLE_LIMITS.user;

    const reqCount = await redis.incr(key);

    if (reqCount === 1) {
      await redis.expire(key, RATE_LIMIT_WINDOW);
    }

    if (reqCount > limit) {
      const ttl = await redis.ttl(key);
      return res.status(429).json({
        error: 'Too many requests. Please wait.',
        retryAfter: ttl
      });
    }

    next();
  } catch (err) {
    console.error('Rate limiter error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = roleBasesRateLimiter;
