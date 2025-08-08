// Ultra-optimized data fetching hooks for minimal latency
import { useState, useEffect, useCallback, useRef, useMemo } from 'react';

// Simple performance manager for demo
const performanceManager = {
  cache: new Map(),
  
  getCache: (key) => {
    const cached = performanceManager.cache.get(key);
    if (cached && Date.now() - cached.timestamp < cached.ttl) {
      return cached.data;
    }
    return null;
  },
  
  setCache: (key, data, ttl = 300000, priority = false) => {
    performanceManager.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl,
      priority
    });
  },
  
  dedupeRequest: async (key, fetchFn, priority = 'normal') => {
    // Simple deduplication
    if (performanceManager.pendingRequests?.has(key)) {
      return performanceManager.pendingRequests.get(key);
    }
    
    if (!performanceManager.pendingRequests) {
      performanceManager.pendingRequests = new Map();
    }
    
    const promise = fetchFn();
    performanceManager.pendingRequests.set(key, promise);
    
    try {
      const result = await promise;
      performanceManager.pendingRequests.delete(key);
      return result;
    } catch (error) {
      performanceManager.pendingRequests.delete(key);
      throw error;
    }
  },
  
  prefetch: (key, fetchFn, priority = 0.5) => {
    // Simple prefetch implementation
    setTimeout(() => {
      fetchFn().catch(error => {
        console.warn(`Prefetch failed for ${key}:`, error);
      });
    }, 100);
  },
  
  debounce: (key, fn, delay) => {
    if (!performanceManager.debounceTimers) {
      performanceManager.debounceTimers = new Map();
    }
    
    const existingTimer = performanceManager.debounceTimers.get(key);
    if (existingTimer) {
      clearTimeout(existingTimer);
    }
    
    const timer = setTimeout(fn, delay);
    performanceManager.debounceTimers.set(key, timer);
  }
};

// Enhanced optimized data fetching with predictive caching
export const useOptimizedData = (key, fetchFn, options = {}) => {
  const {
    cacheTime = 300000, // 5 minutes
    staleTime = 60000,  // 1 minute
    refetchOnWindowFocus = false,
    enabled = true,
    prefetch = false,
    priority = 'normal',
    retryCount = 3,
    retryDelay = 1000
  } = options;

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastFetch, setLastFetch] = useState(0);
  const [retries, setRetries] = useState(0);
  const mountedRef = useRef(true);
  const abortControllerRef = useRef(null);

  const isStale = useMemo(() => {
    return Date.now() - lastFetch > staleTime;
  }, [lastFetch, staleTime]);

  const fetchData = useCallback(async (force = false, isRetry = false) => {
    if (!enabled) return;

    // Cancel previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();

    // Check cache first (skip on retry)
    if (!force && !isStale && !isRetry) {
      const cached = performanceManager.getCache(key);
      if (cached) {
        setData(cached);
        // Prefetch fresh data in background if stale
        if (Date.now() - lastFetch > staleTime * 0.8) {
          performanceManager.prefetch(key, fetchFn, 0.9);
        }
        return cached;
      }
    }

    setLoading(true);
    setError(null);

    try {
      const enhancedFetchFn = () => {
        const signal = abortControllerRef.current?.signal;
        return fetchFn({ signal });
      };

      const result = await performanceManager.dedupeRequest(
        key, 
        enhancedFetchFn, 
        priority
      );
      
      if (mountedRef.current && !abortControllerRef.current?.signal.aborted) {
        setData(result);
        setLastFetch(Date.now());
        setRetries(0);
        performanceManager.setCache(key, result, cacheTime, true);
        
        // Predictive prefetching of related data
        if (prefetch && result) {
          performanceManager.prefetch(`${key}-related`, () => 
            fetchRelatedData(result), 0.6
          );
        }
      }
      
      return result;
    } catch (err) {
      if (mountedRef.current && !abortControllerRef.current?.signal.aborted) {
        // Retry logic with exponential backoff
        if (retries < retryCount && err.name !== 'AbortError') {
          const delay = retryDelay * Math.pow(2, retries);
          setTimeout(() => {
            setRetries(prev => prev + 1);
            fetchData(force, true);
          }, delay);
          return;
        }
        
        setError(err);
        console.error(`Data fetch failed for ${key}:`, err);
      }
    } finally {
      if (mountedRef.current) {
        setLoading(false);
      }
    }
  }, [key, fetchFn, enabled, isStale, cacheTime, priority, retries, retryCount, retryDelay, prefetch, lastFetch, staleTime]);

  // Initial fetch with smart timing
  useEffect(() => {
    // Use requestIdleCallback for non-critical data
    if (priority === 'low' && window.requestIdleCallback) {
      window.requestIdleCallback(() => fetchData());
    } else {
      fetchData();
    }
  }, [fetchData]);

  // Enhanced window focus refetch
  useEffect(() => {
    if (!refetchOnWindowFocus) return;

    const handleFocus = () => {
      if (isStale && document.visibilityState === 'visible') {
        fetchData();
      }
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && isStale) {
        fetchData();
      }
    };

    window.addEventListener('focus', handleFocus);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      window.removeEventListener('focus', handleFocus);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [refetchOnWindowFocus, isStale, fetchData]);

  // Cleanup
  useEffect(() => {
    return () => {
      mountedRef.current = false;
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  return {
    data,
    loading,
    error,
    refetch: () => fetchData(true),
    isStale,
    retries
  };
};

// Helper function for related data fetching
const fetchRelatedData = async (data) => {
  // This would fetch related data based on the current data
  // For example, if we have student data, fetch their ledger entries
  return {};
};

// Optimized infinite scroll hook
export const useInfiniteScroll = (fetchFn, options = {}) => {
  const {
    pageSize = 20,
    threshold = 0.8,
    enabled = true
  } = options;

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(0);
  const observerRef = useRef();

  const loadMore = useCallback(async () => {
    if (loading || !hasMore || !enabled) return;

    setLoading(true);
    try {
      const newData = await fetchFn(page, pageSize);
      
      setData(prev => [...prev, ...newData]);
      setHasMore(newData.length === pageSize);
      setPage(prev => prev + 1);
    } catch (error) {
      console.error('Infinite scroll fetch failed:', error);
    } finally {
      setLoading(false);
    }
  }, [fetchFn, page, pageSize, loading, hasMore, enabled]);

  const lastElementRef = useCallback(node => {
    if (loading) return;
    if (observerRef.current) observerRef.current.disconnect();
    
    observerRef.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        loadMore();
      }
    }, { threshold });
    
    if (node) observerRef.current.observe(node);
  }, [loading, hasMore, loadMore, threshold]);

  return { data, loading, hasMore, lastElementRef, loadMore };
};

// Debounced search hook
export const useDebouncedSearch = (searchFn, delay = 300) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    setLoading(true);
    
    performanceManager.debounce('search', async () => {
      try {
        const searchResults = await searchFn(query);
        setResults(searchResults);
      } catch (error) {
        console.error('Search failed:', error);
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, delay);
  }, [query, searchFn, delay]);

  return { query, setQuery, results, loading };
};

// Optimized form hook with auto-save
export const useOptimizedForm = (initialData, saveFn, options = {}) => {
  const {
    autoSaveDelay = 2000,
    enableAutoSave = true
  } = options;

  const [data, setData] = useState(initialData);
  const [isDirty, setIsDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);

  const updateField = useCallback((field, value) => {
    setData(prev => ({ ...prev, [field]: value }));
    setIsDirty(true);
  }, []);

  const save = useCallback(async (force = false) => {
    if (!isDirty && !force) return;

    setSaving(true);
    try {
      await saveFn(data);
      setIsDirty(false);
      setLastSaved(new Date());
    } catch (error) {
      console.error('Form save failed:', error);
      throw error;
    } finally {
      setSaving(false);
    }
  }, [data, isDirty, saveFn]);

  // Auto-save
  useEffect(() => {
    if (!enableAutoSave || !isDirty) return;

    performanceManager.debounce('form-autosave', () => {
      save();
    }, autoSaveDelay);
  }, [data, isDirty, enableAutoSave, autoSaveDelay, save]);

  return {
    data,
    updateField,
    save,
    isDirty,
    saving,
    lastSaved
  };
};

// Real-time data hook with WebSocket (disabled for demo)
export const useRealTimeData = (endpoint, options = {}) => {
  const {
    reconnectDelay = 3000,
    maxReconnectAttempts = 5
  } = options;

  const [data, setData] = useState(null);
  const [connected, setConnected] = useState(false);
  const [reconnectAttempts, setReconnectAttempts] = useState(0);
  const wsRef = useRef(null);

  const connect = useCallback(() => {
    // WebSocket disabled for demo
    console.log(`WebSocket connection disabled for demo mode: ${endpoint}`);
    setConnected(false);
  }, [endpoint]);

  useEffect(() => {
    connect();
    
    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [connect]);

  return { data, connected, reconnect: connect };
};