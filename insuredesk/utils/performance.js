// Performance optimization utilities

// Cache for storing query results
const queryCache = new Map()
const pendingQueries = new Map()

// Cache duration in milliseconds
const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes

/**
 * Cached query wrapper with deduplication
 * Prevents multiple identical requests and caches results
 */
export async function cachedQuery(key, queryFn, options = {}) {
    const {
        cacheTime = CACHE_DURATION,
        staleTime = 30000, // 30 seconds
        forceRefresh = false
    } = options

    const cacheKey = typeof key === 'string' ? key : JSON.stringify(key)
    const now = Date.now()

    // Check if we have a valid cache entry
    if (!forceRefresh && queryCache.has(cacheKey)) {
        const cached = queryCache.get(cacheKey)

        // Return cached data if still valid
        if (now - cached.timestamp < cacheTime) {
            // If stale but within cache time, return stale data and refresh in background
            if (now - cached.timestamp > staleTime && !pendingQueries.has(cacheKey)) {
                pendingQueries.set(cacheKey, true)
                queryFn().then(freshData => {
                    queryCache.set(cacheKey, { data: freshData, timestamp: Date.now() })
                    pendingQueries.delete(cacheKey)
                }).catch(() => {
                    pendingQueries.delete(cacheKey)
                })
            }

            return cached.data
        }
    }

    // Check if there's already a pending request for this query
    if (pendingQueries.has(cacheKey)) {
        return pendingQueries.get(cacheKey)
    }

    // Create new query promise
    const queryPromise = queryFn().then(data => {
        queryCache.set(cacheKey, { data, timestamp: Date.now() })
        pendingQueries.delete(cacheKey)
        return data
    }).catch(error => {
        pendingQueries.delete(cacheKey)
        throw error
    })

    pendingQueries.set(cacheKey, queryPromise)
    return queryPromise
}

/**
 * Invalidate cache for specific key or pattern
 */
export function invalidateCache(keyOrPattern) {
    if (typeof keyOrPattern === 'string') {
        // Exact match
        queryCache.delete(keyOrPattern)
    } else if (keyOrPattern instanceof RegExp) {
        // Pattern match
        for (const key of queryCache.keys()) {
            if (keyOrPattern.test(key)) {
                queryCache.delete(key)
            }
        }
    } else {
        // Clear all
        queryCache.clear()
    }
}

/**
 * Debounce function to reduce excessive calls
 */
export function debounce(func, wait = 300) {
    let timeout
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout)
            func(...args)
        }
        clearTimeout(timeout)
        timeout = setTimeout(later, wait)
    }
}

/**
 * Throttle function to limit call frequency
 */
export function throttle(func, limit = 300) {
    let inThrottle
    return function (...args) {
        if (!inThrottle) {
            func.apply(this, args)
            inThrottle = true
            setTimeout(() => inThrottle = false, limit)
        }
    }
}

/**
 * Preload data for faster navigation
 */
export function prefetchData(key, queryFn) {
    const cacheKey = typeof key === 'string' ? key : JSON.stringify(key)

    if (!queryCache.has(cacheKey) && !pendingQueries.has(cacheKey)) {
        cachedQuery(key, queryFn).catch(() => {
            // Silently fail prefetch
        })
    }
}

/**
 * Get cached data without fetching
 */
export function getCachedData(key) {
    const cacheKey = typeof key === 'string' ? key : JSON.stringify(key)
    const cached = queryCache.get(cacheKey)
    return cached?.data
}

/**
 * Batch multiple queries together
 */
export async function batchQueries(queries) {
    return Promise.all(
        queries.map(({ key, queryFn, options }) =>
            cachedQuery(key, queryFn, options)
        )
    )
}
