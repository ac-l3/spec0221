const NAMESPACE = 'enneagram-analysis';

// Cache the KV URL to avoid rebuilding it on every request
let cachedKVUrl = null;
async function getKVUrl(path) {
  if (!cachedKVUrl) {
    const accountId = process.env.CF_ACCOUNT_ID;
    const namespaceId = process.env.KV_BINDING;
    cachedKVUrl = `https://api.cloudflare.com/client/v4/accounts/${accountId}/storage/kv/namespaces/${namespaceId}`;
  }
  return `${cachedKVUrl}${path}`;
}

// Cache responses in memory for 5 minutes
const cache = new Map();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

// Simple in-memory cache for development
const memoryCache = new Map();

export async function getFromKV(key) {
  if (process.env.NODE_ENV === 'development') {
    return memoryCache.get(key);
  }
  // ... production code
}

export async function putToKV(key, value) {
  if (process.env.NODE_ENV === 'development') {
    memoryCache.set(key, JSON.stringify(value));
    return true;
  }
  // ... production code
} 