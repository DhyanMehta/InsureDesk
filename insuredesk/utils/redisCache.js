// Redis cache utilities with fallback to memory cache

let redis = null
let redisAvailable = false

// Try to initialize Redis (Upstash)
try {
    if (process.env.UPSTASH_REDIS_URL && process.env.UPSTASH_REDIS_TOKEN) {
        const { Redis } = require('@upstash/redis')
        redis = new Redis({
            url: process.env.UPSTASH_REDIS_URL,
            token: process.env.UPSTASH_REDIS_TOKEN,
        })
        redisAvailable = true
        console.log('✅ Redis cache initialized')
    } else {
        console.log('⚠️ Redis not configured, using memory cache')
    }
} catch (error) {
    console.log('⚠️ Redis initialization failed, using memory cache:', error.message)
}

// Fallback in-memory cache
const memoryCache = new Map()

// Cache TTL configurations (in seconds)
export const CACHE_TTL = {
    MASTER_DATA: 300, // 5 minutes for insurance companies, providers, etc.
    LISTS: 60, // 1 minute for client/policy lists
    DASHBOARD: 30, // 30 seconds for dashboard KPIs
    DETAILS: 120, // 2 minutes for individual record details
    SEARCH: 30, // 30 seconds for search results
}

/**
 * Get value from cache
 */
export async function getCache(key) {
    try {
        if (redisAvailable && redis) {
            const value = await redis.get(key)
            return value
        }

        // Fallback to memory cache
        if (memoryCache.has(key)) {
            const { value, expiry } = memoryCache.get(key)
            if (Date.now() < expiry) {
                return value
            }
            memoryCache.delete(key)
        }

        return null
    } catch (error) {
        console.error('Cache get error:', error)
        return null
    }
}

/**
 * Set value in cache with TTL
 */
export async function setCache(key, value, ttl = CACHE_TTL.LISTS) {
    try {
        if (redisAvailable && redis) {
            await redis.setex(key, ttl, JSON.stringify(value))
            return true
        }

        // Fallback to memory cache
        memoryCache.set(key, {
            value,
            expiry: Date.now() + (ttl * 1000),
        })

        return true
    } catch (error) {
        console.error('Cache set error:', error)
        return false
    }
}

/**
 * Delete specific key from cache
 */
export async function deleteCache(key) {
    try {
        if (redisAvailable && redis) {
            await redis.del(key)
        }
        memoryCache.delete(key)
        return true
    } catch (error) {
        console.error('Cache delete error:', error)
        return false
    }
}

/**
 * Delete keys matching pattern
 */
export async function deleteCachePattern(pattern) {
    try {
        if (redisAvailable && redis) {
            const keys = await redis.keys(pattern)
            if (keys && keys.length > 0) {
                await redis.del(...keys)
            }
        }

        // For memory cache, do prefix matching
        const prefix = pattern.replace('*', '')
        for (const key of memoryCache.keys()) {
            if (key.startsWith(prefix)) {
                memoryCache.delete(key)
            }
        }

        return true
    } catch (error) {
        console.error('Cache pattern delete error:', error)
        return false
    }
}

/**
 * Clear all cache
 */
export async function clearCache() {
    try {
        if (redisAvailable && redis) {
            await redis.flushdb()
        }
        memoryCache.clear()
        return true
    } catch (error) {
        console.error('Cache clear error:', error)
        return false
    }
}

/**
 * Cached query wrapper with Redis
 * Falls back to memory cache if Redis unavailable
 */
export async function cachedQuery(key, queryFn, ttl = CACHE_TTL.LISTS) {
    try {
        // Try to get from cache
        const cached = await getCache(key)
        if (cached) {
            return typeof cached === 'string' ? JSON.parse(cached) : cached
        }

        // Execute query
        const result = await queryFn()

        // Store in cache
        await setCache(key, result, ttl)

        return result
    } catch (error) {
        console.error('Cached query error:', error)
        // If cache fails, still return the query result
        return queryFn()
    }
}

/**
 * Invalidate cache keys related to a specific entity
 */
export async function invalidateEntityCache(entity) {
    const patterns = [
        `${entity}-list*`,
        `${entity}-details*`,
        `dashboard*`,
        `search-${entity}*`,
    ]

    for (const pattern of patterns) {
        await deleteCachePattern(pattern)
    }
}

// Export cache utilities
export default {
    get: getCache,
    set: setCache,
    delete: deleteCache,
    deletePattern: deleteCachePattern,
    clear: clearCache,
    query: cachedQuery,
    invalidate: invalidateEntityCache,
    TTL: CACHE_TTL,
}
