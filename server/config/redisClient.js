const dotenv = require('dotenv');
const Redis = require('ioredis');
dotenv.config();

let redis;

if (process.env.REDIS_URL) {
  redis = new Redis(process.env.REDIS_URL, {
    maxRetriesPerRequest: 3,
    retryStrategy(times) {
      if (times > 5) {
        console.error('❌ Redis: max retries reached, giving up reconnection');
        return null; // stop retrying
      }
      const delay = Math.min(times * 500, 3000);
      console.log(`⏳ Redis: retrying connection in ${delay}ms (attempt ${times})`);
      return delay;
    },
    lazyConnect: false,
  });

  redis.on('connect', () => {
    console.log('✅ Redis connected successfully');
  });

  redis.on('error', (err) => {
    console.error('⚠️  Redis connection error:', err.message);
  });

  redis.on('close', () => {
    console.warn('⚠️  Redis connection closed');
  });
} else {
  console.warn('⚠️  REDIS_URL not set — Redis features (rate limiting, caching) are disabled');
  
  // Create a mock Redis client that gracefully returns null/0 for all operations
  redis = {
    get: async () => null,
    set: async () => 'OK',
    del: async () => 0,
    incr: async () => 1,
    expire: async () => 1,
    ttl: async () => -1,
    keys: async () => [],
    status: 'disabled',
  };
}

module.exports = redis;
