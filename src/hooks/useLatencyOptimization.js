// React hook for latency optimization
import { useEffect, useCallback, useRef, useMemo } from 'react';

// Simple latency optimizer for demo
const latencyOptimizer = {
  criticalResourcesCache: new Map(),
  
  scheduleRender: (updateFn, priority = 'normal') => {
    if (priority === 'high') {
      return updateFn();
    } else {
      return new Promise(resolve => {
        setTimeout(() => resolve(updateFn()), 0);
      });
    }
  },
  
  warmCache: (endpoints, priority) => {
    endpoints.forEach(endpoint => {
      if (!latencyOptimizer.criticalResourcesCache.has(endpoint)) {
        // Simulate cache warming
        console.log(`Warming cache for ${endpoint} with priority ${priority}`);
      }
    });
  },
  
  executePreload: (target) => {
    console.log(`Preloading ${target}`);
  },
  
  getCachedData: (key) => {
    const cached = latencyOptimizer.criticalResourcesCache.get(key);
    if (cached && Date.now() - cached.timestamp < cached.ttl) {
      return cached.data;
    }
    return null;
  }
};

export const useLatencyOptimization = (options = {}) => {
  const {
    preloadEndpoints = [],
    enablePredictiveLoading = true,
    cacheStrategy = 'aggressive',
    renderOptimization = true
  } = options;

  const componentRef = useRef();
  const renderQueueRef = useRef([]);
  const lastRenderTime = useRef(0);

  // Optimized state updates with batching
  const scheduleUpdate = useCallback((updateFn, priority = 'normal') => {
    return latencyOptimizer.scheduleRender(updateFn, priority);
  }, []);

  // Preload critical data on mount
  useEffect(() => {
    if (preloadEndpoints.length > 0) {
      latencyOptimizer.warmCache(preloadEndpoints, 'high');
    }
  }, [preloadEndpoints]);

  // Setup predictive loading
  useEffect(() => {
    if (!enablePredictiveLoading) return;

    const element = componentRef.current;
    if (!element) return;

    // Add preload attributes to interactive elements
    const interactiveElements = element.querySelectorAll('button, [role="button"], a');
    interactiveElements.forEach(el => {
      const action = el.dataset.action || el.getAttribute('href');
      if (action) {
        el.setAttribute('data-preload-target', action);
      }
    });

    // Setup intersection observer for viewport preloading
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const preloadTarget = entry.target.dataset.preloadTarget;
            if (preloadTarget) {
              latencyOptimizer.executePreload(preloadTarget);
            }
          }
        });
      },
      { rootMargin: '100px' }
    );

    interactiveElements.forEach(el => {
      if (el.dataset.preloadTarget) {
        observer.observe(el);
      }
    });

    return () => observer.disconnect();
  }, [enablePredictiveLoading]);

  // Optimized data fetching with caching
  const fetchWithCache = useCallback(async (endpoint, options = {}) => {
    const cacheKey = `${endpoint}-${JSON.stringify(options)}`;
    
    // Try cache first
    const cached = latencyOptimizer.getCachedData(cacheKey);
    if (cached && cacheStrategy === 'aggressive') {
      return cached;
    }

    try {
      const response = await fetch(endpoint, {
        ...options,
        headers: {
          'X-Cache-Strategy': cacheStrategy,
          ...options.headers
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();
      
      // Cache successful responses
      latencyOptimizer.criticalResourcesCache.set(cacheKey, {
        data,
        timestamp: Date.now(),
        ttl: options.cacheTtl || 300000
      });

      return data;
    } catch (error) {
      // Return cached data as fallback
      if (cached) {
        console.warn('Using stale cache due to fetch error:', error);
        return cached;
      }
      throw error;
    }
  }, [cacheStrategy]);

  // Debounced render optimization
  const optimizedRender = useCallback((renderFn, delay = 16) => {
    const now = performance.now();
    const timeSinceLastRender = now - lastRenderTime.current;

    if (timeSinceLastRender >= delay) {
      lastRenderTime.current = now;
      return renderFn();
    } else {
      return new Promise(resolve => {
        setTimeout(() => {
          lastRenderTime.current = performance.now();
          resolve(renderFn());
        }, delay - timeSinceLastRender);
      });
    }
  }, []);

  // Memory-efficient list rendering
  const createVirtualizedRenderer = useCallback((items, renderItem, containerHeight = 400) => {
    const itemHeight = 50; // Estimated item height
    const visibleCount = Math.ceil(containerHeight / itemHeight) + 2; // Buffer

    return useMemo(() => {
      return (startIndex = 0) => {
        const endIndex = Math.min(startIndex + visibleCount, items.length);
        const visibleItems = items.slice(startIndex, endIndex);
        
        return {
          items: visibleItems,
          totalHeight: items.length * itemHeight,
          offsetY: startIndex * itemHeight,
          startIndex,
          endIndex
        };
      };
    }, [items, visibleCount, itemHeight]);
  }, []);

  // Performance metrics collection
  const measurePerformance = useCallback((operationName, operation) => {
    return async (...args) => {
      const start = performance.now();
      const startMemory = performance.memory?.usedJSHeapSize || 0;

      try {
        const result = await operation(...args);
        const duration = performance.now() - start;
        const memoryDelta = (performance.memory?.usedJSHeapSize || 0) - startMemory;

        // Log slow operations
        if (duration > 100) {
          console.warn(`Slow operation: ${operationName} took ${duration.toFixed(2)}ms`);
        }

        // Track memory usage
        if (memoryDelta > 1024 * 1024) { // 1MB
          console.warn(`Memory intensive: ${operationName} used ${(memoryDelta / 1024 / 1024).toFixed(2)}MB`);
        }

        return result;
      } catch (error) {
        console.error(`Operation failed: ${operationName}`, error);
        throw error;
      }
    };
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      // Clear component-specific cache entries
      const componentCacheKeys = Array.from(latencyOptimizer.criticalResourcesCache.keys())
        .filter(key => key.includes(componentRef.current?.dataset?.componentId || ''));
      
      componentCacheKeys.forEach(key => {
        latencyOptimizer.criticalResourcesCache.delete(key);
      });
    };
  }, []);

  return {
    componentRef,
    scheduleUpdate,
    fetchWithCache,
    optimizedRender,
    createVirtualizedRenderer,
    measurePerformance,
    // Utility functions
    preloadData: (endpoints) => latencyOptimizer.warmCache(endpoints),
    clearCache: (pattern) => {
      if (pattern) {
        for (const [key] of latencyOptimizer.criticalResourcesCache.entries()) {
          if (key.includes(pattern)) {
            latencyOptimizer.criticalResourcesCache.delete(key);
          }
        }
      }
    }
  };
};

// Specialized hooks for different use cases
export const useStudentDataOptimization = () => {
  return useLatencyOptimization({
    preloadEndpoints: ['/api/students', '/api/students/recent'],
    cacheStrategy: 'aggressive',
    enablePredictiveLoading: true
  });
};

export const useLedgerOptimization = () => {
  return useLatencyOptimization({
    preloadEndpoints: ['/api/ledger/summary', '/api/dashboard/stats'],
    cacheStrategy: 'moderate',
    enablePredictiveLoading: true
  });
};

export const useBillingOptimization = () => {
  return useLatencyOptimization({
    preloadEndpoints: ['/api/billing/monthly', '/api/billing/pending'],
    cacheStrategy: 'conservative',
    renderOptimization: true
  });
};