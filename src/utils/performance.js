// Enhanced Performance utilities for ultra-low latency
export class PerformanceManager {
  constructor() {
    this.cache = new Map();
    this.requestQueue = new Map();
    this.debounceTimers = new Map();
    this.prefetchQueue = new Set();
    this.compressionCache = new Map();
    this.metrics = {
      cacheHits: 0,
      cacheMisses: 0,
      requestsSaved: 0,
      avgResponseTime: 0,
    };

    // Initialize performance monitoring
    this.initPerformanceMonitoring();
    this.initServiceWorker();
  }

  // Enhanced memory cache with compression and smart eviction
  setCache(key, data, ttl = 300000, compress = true) {
    const expiry = Date.now() + ttl;
    let cacheData = data;

    if (compress && typeof data === "object") {
      cacheData = this.compressData(data);
    }

    this.cache.set(key, {
      data: cacheData,
      expiry,
      compressed: compress,
      size: this.getDataSize(data),
      accessCount: 0,
      lastAccessed: Date.now(),
    });

    // Smart cache eviction when memory limit reached
    this.enforceMemoryLimit();
  }

  getCache(key) {
    const cached = this.cache.get(key);
    if (cached && cached.expiry > Date.now()) {
      cached.accessCount++;
      cached.lastAccessed = Date.now();
      this.metrics.cacheHits++;

      return cached.compressed ? this.decompressData(cached.data) : cached.data;
    }

    if (cached) {
      this.cache.delete(key);
    }
    this.metrics.cacheMisses++;
    return null;
  }

  // Data compression for large objects
  compressData(data) {
    try {
      const jsonString = JSON.stringify(data);
      // Simple compression - in production use proper compression library
      return this.simpleCompress(jsonString);
    } catch (error) {
      console.warn("Compression failed:", error);
      return data;
    }
  }

  decompressData(compressedData) {
    try {
      const jsonString = this.simpleDecompress(compressedData);
      return JSON.parse(jsonString);
    } catch (error) {
      console.warn("Decompression failed:", error);
      return compressedData;
    }
  }

  simpleCompress(str) {
    // Simple run-length encoding for demo
    return str.replace(/(.)\1+/g, (match, char) => `${char}${match.length}`);
  }

  simpleDecompress(str) {
    // Reverse of simple compression
    return str.replace(/(.)\d+/g, (match, char) => {
      const count = parseInt(match.slice(1));
      return char.repeat(count);
    });
  }

  // Enhanced request deduplication with priority queue
  async dedupeRequest(key, requestFn, priority = "normal") {
    if (this.requestQueue.has(key)) {
      this.metrics.requestsSaved++;
      return this.requestQueue.get(key);
    }

    const startTime = performance.now();
    const promise = requestFn()
      .then((result) => {
        const endTime = performance.now();
        this.updateMetrics(endTime - startTime);
        return result;
      })
      .finally(() => {
        this.requestQueue.delete(key);
      });

    this.requestQueue.set(key, promise);
    return promise;
  }

  // Smart prefetching based on user behavior
  prefetch(key, requestFn, probability = 0.7) {
    if (this.prefetchQueue.has(key) || Math.random() > probability) {
      return;
    }

    this.prefetchQueue.add(key);

    // Use requestIdleCallback for non-blocking prefetch
    if (window.requestIdleCallback) {
      window.requestIdleCallback(() => {
        this.dedupeRequest(`prefetch-${key}`, requestFn)
          .then((data) => {
            this.setCache(`prefetch-${key}`, data, 600000); // 10 min cache
            this.prefetchQueue.delete(key);
          })
          .catch(() => {
            this.prefetchQueue.delete(key);
          });
      });
    }
  }

  // Batch operations with smart scheduling
  createBatcher(batchSize = 10, delay = 100, maxWait = 1000) {
    let batch = [];
    let timer = null;
    let startTime = null;

    return (item, processor) => {
      if (batch.length === 0) {
        startTime = Date.now();
      }

      batch.push(item);

      if (timer) clearTimeout(timer);

      const shouldFlush =
        batch.length >= batchSize ||
        (startTime && Date.now() - startTime > maxWait);

      if (shouldFlush) {
        processor([...batch]);
        batch = [];
        startTime = null;
      } else {
        timer = setTimeout(() => {
          if (batch.length > 0) {
            processor([...batch]);
            batch = [];
            startTime = null;
          }
        }, delay);
      }
    };
  }

  // Enhanced preloading with critical resource hints
  async preloadCriticalData() {
    const criticalEndpoints = [
      { key: "students", url: "/src/data/students.json", priority: "high" },
      { key: "ledger", url: "/src/data/ledger.json", priority: "high" },
      {
        key: "dashboard-stats",
        fn: this.calculateDashboardStats,
        priority: "medium",
      },
    ];

    // Add resource hints
    this.addResourceHints(criticalEndpoints);

    const preloadPromises = criticalEndpoints.map((endpoint) => {
      if (endpoint.url) {
        return this.dedupeRequest(`preload-${endpoint.key}`, () =>
          fetch(endpoint.url).then((r) => r.json())
        );
      } else if (endpoint.fn) {
        return this.dedupeRequest(`preload-${endpoint.key}`, endpoint.fn);
      }
    });

    return Promise.allSettled(preloadPromises);
  }

  // Add resource hints for faster loading
  addResourceHints(resources) {
    resources.forEach((resource) => {
      if (resource.url) {
        const link = document.createElement("link");
        link.rel = "prefetch";
        link.href = resource.url;
        link.as = "fetch";
        link.crossOrigin = "anonymous";
        document.head.appendChild(link);
      }
    });
  }

  // Memory management
  enforceMemoryLimit(maxSize = 50 * 1024 * 1024) {
    // 50MB limit
    let totalSize = 0;
    const entries = Array.from(this.cache.entries());

    // Calculate total cache size
    entries.forEach(([key, value]) => {
      totalSize += value.size || 0;
    });

    if (totalSize > maxSize) {
      // Sort by access frequency and recency (LFU + LRU)
      entries.sort((a, b) => {
        const scoreA = a[1].accessCount / (Date.now() - a[1].lastAccessed);
        const scoreB = b[1].accessCount / (Date.now() - b[1].lastAccessed);
        return scoreA - scoreB;
      });

      // Remove least valuable entries
      let removedSize = 0;
      for (const [key, value] of entries) {
        if (removedSize >= totalSize - maxSize * 0.8) break;
        this.cache.delete(key);
        removedSize += value.size || 0;
      }
    }
  }

  getDataSize(data) {
    return new Blob([JSON.stringify(data)]).size;
  }

  // Performance monitoring
  initPerformanceMonitoring() {
    if ("PerformanceObserver" in window) {
      const observer = new PerformanceObserver((list) => {
        list.getEntries().forEach((entry) => {
          if (entry.entryType === "navigation") {
            console.log("Navigation timing:", entry);
          }
        });
      });

      observer.observe({ entryTypes: ["navigation", "resource"] });
    }
  }

  updateMetrics(responseTime) {
    this.metrics.avgResponseTime =
      (this.metrics.avgResponseTime + responseTime) / 2;
  }

  getMetrics() {
    return {
      ...this.metrics,
      cacheSize: this.cache.size,
      cacheHitRate:
        (this.metrics.cacheHits /
          (this.metrics.cacheHits + this.metrics.cacheMisses)) *
        100,
    };
  }

  // Service Worker initialization for advanced caching
  async initServiceWorker() {
    if ("serviceWorker" in navigator) {
      try {
        const registration = await navigator.serviceWorker.register("/sw.js");
        console.log("Service Worker registered:", registration);
      } catch (error) {
        console.log("Service Worker registration failed:", error);
      }
    }
  }

  // Clear expired cache entries with smart cleanup
  cleanupCache() {
    const now = Date.now();
    let cleanedCount = 0;

    for (const [key, value] of this.cache.entries()) {
      if (value.expiry <= now) {
        this.cache.delete(key);
        cleanedCount++;
      }
    }

    console.log(`Cache cleanup: removed ${cleanedCount} expired entries`);
  }

  // Calculate dashboard stats efficiently
  calculateDashboardStats = async () => {
    // This would be replaced with actual API calls
    return {
      totalStudents: 156,
      totalCollected: 450000,
      totalDues: 85000,
      thisMonthCollection: 120000,
    };
  };
}

// Global performance manager instance
export const performanceManager = new PerformanceManager();

// Auto cleanup every 5 minutes
setInterval(() => performanceManager.cleanupCache(), 300000);

// Intersection Observer for lazy loading
export const createLazyLoader = (callback, options = {}) => {
  const defaultOptions = {
    root: null,
    rootMargin: "50px",
    threshold: 0.1,
  };

  return new IntersectionObserver(callback, { ...defaultOptions, ...options });
};

// Virtual scrolling helper
export class VirtualScrollManager {
  constructor(containerHeight, itemHeight, buffer = 5) {
    this.containerHeight = containerHeight;
    this.itemHeight = itemHeight;
    this.buffer = buffer;
  }

  getVisibleRange(scrollTop, totalItems) {
    const visibleCount = Math.ceil(this.containerHeight / this.itemHeight);
    const startIndex = Math.max(
      0,
      Math.floor(scrollTop / this.itemHeight) - this.buffer
    );
    const endIndex = Math.min(
      totalItems - 1,
      startIndex + visibleCount + this.buffer * 2
    );

    return { startIndex, endIndex, visibleCount };
  }

  getItemStyle(index) {
    return {
      position: "absolute",
      top: index * this.itemHeight,
      height: this.itemHeight,
      width: "100%",
    };
  }
}

// Image optimization
export const optimizeImage = (src, width, height, quality = 80) => {
  if (!src) return "";

  // For production, you'd use a service like Cloudinary or ImageKit
  const params = new URLSearchParams({
    w: width,
    h: height,
    q: quality,
    f: "webp",
  });

  return `${src}?${params.toString()}`;
};

// Bundle splitting helper
export const loadComponent = (importFn) => {
  return React.lazy(() =>
    importFn().catch((err) => {
      console.error("Component loading failed:", err);
      return {
        default: () =>
          React.createElement("div", null, "Failed to load component"),
      };
    })
  );
};
