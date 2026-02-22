import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/utils/supabase/client'
import { cachedQuery, invalidateCache, debounce } from '@/utils/performance'
import cache from '@/utils/redisCache'

/**
 * Custom hook for cached Supabase queries with Redis caching and automatic optimization
 */
export function useSupabaseQuery(key, queryFn, options = {}) {
    const [data, setData] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const supabase = createClient()

    const {
        enabled = true,
        refetchOnMount = false,
        cacheTime = 5 * 60 * 1000, // 5 minutes
        staleTime = 30000, // 30 seconds
        useRedis = true, // Use Redis caching by default
        redisTTL = cache.TTL.LISTS, // Default Redis TTL
    } = options

    const fetchData = useCallback(async (forceRefresh = false) => {
        if (!enabled) return

        try {
            setLoading(true)
            setError(null)

            // Try Redis cache first for instant load
            if (useRedis && !forceRefresh) {
                try {
                    const cached = await cache.get(key)
                    if (cached) {
                        const cachedData = typeof cached === 'string' ? JSON.parse(cached) : cached
                        setData(cachedData)
                        setLoading(false)
                        // Continue to fetch fresh data in background
                    }
                } catch (cacheErr) {
                    console.error('Redis read error:', cacheErr)
                }
            }

            // Fetch from Supabase with memory cache
            const result = await cachedQuery(
                key,
                queryFn,
                { cacheTime, staleTime, forceRefresh }
            )

            // Update Redis cache
            if (useRedis && result) {
                try {
                    await cache.set(key, result, redisTTL)
                } catch (cacheErr) {
                    console.error('Redis write error:', cacheErr)
                }
            }

            setData(result)
        } catch (err) {
            console.error('Query error:', err)
            setError(err)
        } finally {
            setLoading(false)
        }
    }, [key, enabled, cacheTime, staleTime, useRedis, redisTTL])

    useEffect(() => {
        if (enabled) {
            fetchData(refetchOnMount)
        }
    }, [enabled, refetchOnMount, fetchData])

    const refetch = useCallback(() => {
        return fetchData(true)
    }, [fetchData])

    const mutate = useCallback((newData) => {
        setData(newData)
        invalidateCache(key)
    }, [key])

    return {
        data,
        loading,
        error,
        refetch,
        mutate,
        supabase
    }
}

/**
 * Hook for paginated queries with caching
 */
export function usePaginatedQuery(key, queryFn, options = {}) {
    const [page, setPage] = useState(options.initialPage || 1)
    const [pageSize] = useState(options.pageSize || 10)

    const paginatedKey = `${key}-page-${page}`
    const query = useSupabaseQuery(
        paginatedKey,
        () => queryFn(page, pageSize),
        options
    )

    const nextPage = useCallback(() => {
        setPage(p => p + 1)
    }, [])

    const prevPage = useCallback(() => {
        setPage(p => Math.max(1, p - 1))
    }, [])

    const goToPage = useCallback((newPage) => {
        setPage(Math.max(1, newPage))
    }, [])

    return {
        ...query,
        page,
        pageSize,
        nextPage,
        prevPage,
        goToPage
    }
}

/**
 * Hook for search queries with debouncing
 */
export function useSearchQuery(key, queryFn, searchTerm, options = {}) {
    const [debouncedTerm, setDebouncedTerm] = useState(searchTerm)

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedTerm(searchTerm)
        }, options.debounceMs || 300)

        return () => clearTimeout(handler)
    }, [searchTerm, options.debounceMs])

    const searchKey = debouncedTerm ? `${key}-search-${debouncedTerm}` : key

    return useSupabaseQuery(
        searchKey,
        () => queryFn(debouncedTerm),
        {
            ...options,
            enabled: options.enabled !== false,
        }
    )
}

/**
 * Hook for mutations with automatic cache invalidation (memory + Redis)
 */
export function useSupabaseMutation(mutationFn, options = {}) {
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)
    const supabase = createClient()

    const mutate = useCallback(async (variables) => {
        try {
            setLoading(true)
            setError(null)

            const result = await mutationFn(variables, supabase)

            // Invalidate related caches (both memory and Redis)
            if (options.invalidateKeys) {
                for (const k of options.invalidateKeys) {
                    invalidateCache(k)
                    try {
                        if (k.includes('*')) {
                            await cache.deletePattern(k)
                        } else {
                            await cache.delete(k)
                        }
                    } catch (cacheErr) {
                        console.error('Redis invalidation error:', cacheErr)
                    }
                }
            }

            // Call success callback
            if (options.onSuccess) {
                options.onSuccess(result)
            }

            return { success: true, data: result }
        } catch (err) {
            console.error('Mutation error:', err)
            setError(err)

            // Call error callback
            if (options.onError) {
                options.onError(err)
            }

            return { success: false, error: err }
        } finally {
            setLoading(false)
        }
    }, [mutationFn, options])

    return {
        mutate,
        loading,
        error,
        supabase
    }
}
