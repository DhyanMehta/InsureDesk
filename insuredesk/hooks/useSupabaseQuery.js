import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/utils/supabase/client'
import { cachedQuery, invalidateCache, debounce } from '@/utils/performance'

/**
 * Custom hook for cached Supabase queries with automatic optimization
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
    } = options

    const fetchData = useCallback(async (forceRefresh = false) => {
        if (!enabled) return

        try {
            setLoading(true)
            setError(null)

            const result = await cachedQuery(
                key,
                queryFn,
                { cacheTime, staleTime, forceRefresh }
            )

            setData(result)
        } catch (err) {
            console.error('Query error:', err)
            setError(err)
        } finally {
            setLoading(false)
        }
    }, [key, enabled, cacheTime, staleTime])

    useEffect(() => {
        if (enabled) {
            fetchData(refetchOnMount)
        }
    }, [enabled, refetchOnMount])

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
 * Hook for mutations with automatic cache invalidation
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

            // Invalidate related caches
            if (options.invalidateKeys) {
                options.invalidateKeys.forEach(k => invalidateCache(k))
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
