const redis = require('../config/redisClient');

const RATE_LIMIT_WINDOW = 60;
const MAX_REQUESTS = 10;

const ipBasedRateLimiter = async (req, res, next) => {
  try {
    const ip = req.ip || req.connection.remoteAddress;
    const key = `ip_rate_limit:${ip}`;

    const reqCount = await redis.incr(key);
    if (reqCount === 1) {
      await redis.expire(key, RATE_LIMIT_WINDOW);
    }

    if (reqCount > MAX_REQUESTS) {
      const ttl = await redis.ttl(key);
      return res.status(429).json({
        error: 'Too many requests from this IP. Please wait.',
        retryAfter: ttl
      });
    }

    next();
  } catch (err) {
    console.error('IP Rate limiter error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = ipBasedRateLimiter;
