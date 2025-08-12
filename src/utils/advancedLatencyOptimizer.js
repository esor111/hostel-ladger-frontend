// Advanced latency optimization system
import { performanceManager } from './performance.js';

class AdvancedLatencyOptimizer {
  constructor() {
    this.cache = new Map();
    this.preloadQueue = new Set();
    this.renderQueue = [];
    this.isProcessing = false;
    this.observers = new Map();
    this.metrics = {
      cacheHits: 0,
      cacheMisses: 0,
      preloadSuccess: 0,
      preloadFails: 0,
      renderOptimizations: 0
    };
    
    // Initialize performance monitoring
    this.initPerformanceTracking();
  }

  // Initialize performance tracking (disabled to prevent errors)
  initPerformanceTracking() {
    // Disabled to prevent localStorage quota errors and other issues
    console.log('Advanced latency optimizer disabled for stability');
    return;
  }

  // Track page load metrics
  trackPageLoadMetrics() {
    const navigation = performance.getEntriesByType('navigation')[0];
    if (navigation) {
      const metrics = {
        domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
        loadComplete: navigation.loadEventEnd - navigation.loadEventStart,
        firstPaint: 0,
        firstContentfulPaint: 0
      };

      // Get paint metrics
      const paintEntries = performance.getEntriesByType('paint');
      paintEntries.forEach(entry => {
        if (entry.name === 'first-paint') {
          metrics.firstPaint = entry.startTime;
        } else if (entry.name === 'first-contentful-paint') {
          metrics.firstContentfulPaint = entry.startTime;
        }
      });

      console.log('📊 Page Load Metrics:', metrics);
      
      // Auto-adjust optimization strategy based on metrics
      this.adjustOptimizationStrategy(metrics);
    }
  }

  // Setup predictive preloading
  setupPredictivePreloading() {
    // Initialize predictive preloading system
    if (typeof window !== 'undefined') {
      // Setup hover-based preloading
      document.addEventListener('mouseover', (e) => {
        this.predictivePreload(e.target);
      });
      
      // Setup viewport-based preloading
      this.setupViewportPreloading();
    }
  }

  // Setup viewport-based preloading
  setupViewportPreloading() {
    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const preloadTarget = entry.target.dataset.viewportPreload;
            if (preloadTarget) {
              this.executePreload(preloadTarget);
            }
          }
        });
      }, { rootMargin: '300px' });

      // Observe elements with viewport preload attribute
      const elements = document.querySelectorAll('[data-viewport-preload]');
      elements.forEach(el => observer.observe(el));
    }
  }

  // Setup interaction tracking for predictive loading
  setupInteractionTracking() {
    let mouseTimer;
    let scrollTimer;

    // Track mouse movements for hover predictions
    document.addEventListener('mouseover', (e) => {
      clearTimeout(mouseTimer);
      mouseTimer = setTimeout(() => {
        this.predictivePreload(e.target);
      }, 100);
    });

    // Track scroll patterns
    window.addEventListener('scroll', () => {
      clearTimeout(scrollTimer);
      scrollTimer = setTimeout(() => {
        this.preloadViewportContent();
      }, 150);
    }, { passive: true });

    // Track click patterns for route prediction
    document.addEventListener('click', (e) => {
      this.trackClickPattern(e.target);
    });
  }

  // Predictive preloading based on user behavior
  predictivePreload(element) {
    const button = element.closest('button, [role="button"], a, [data-preload]');
    if (!button) return;

    const preloadTarget = button.dataset.preload || button.getAttribute('href');
    if (preloadTarget && !this.preloadQueue.has(preloadTarget)) {
      this.preloadQueue.add(preloadTarget);
      this.executePreload(preloadTarget);
    }
  }

  // Execute preload operations
  async executePreload(target) {
    try {
      if (target.startsWith('/api/')) {
        // Preload API data
        const response = await fetch(target, {
          method: 'GET',
          headers: { 'X-Preload': 'true' }
        });
        
        if (response.ok) {
          const data = await response.json();
          this.setCache(target, data, 300000); // 5 minutes
          this.metrics.preloadSuccess++;
        }
      } else if (target.includes('component')) {
        // Preload components
        await this.preloadComponent(target);
      }
    } catch (error) {
      console.warn('Preload failed:', target, error);
      this.metrics.preloadFails++;
    }
  }

  // Preload components dynamically
  async preloadComponent(componentPath) {
    const componentMap = {
      'student-management': () => import('../components/ledger/StudentManagement.tsx'),
      'billing-management': () => import('../components/ledger/BillingManagement.tsx'),
      'dashboard': () => import('../components/ledger/Dashboard.tsx'),
      'checkout-management': () => import('../components/ledger/StudentCheckoutManagement.tsx')
    };

    const componentKey = Object.keys(componentMap).find(key => componentPath.includes(key));
    if (componentKey && componentMap[componentKey]) {
      await componentMap[componentKey]();
      this.metrics.preloadSuccess++;
    }
  }

  // Preload content entering viewport
  preloadViewportContent() {
    const elements = document.querySelectorAll('[data-viewport-preload]');
    elements.forEach(element => {
      if (this.isNearViewport(element, 300)) {
        const preloadTarget = element.dataset.viewportPreload;
        if (!this.preloadQueue.has(preloadTarget)) {
          this.executePreload(preloadTarget);
        }
      }
    });
  }

  // Check if element is near viewport
  isNearViewport(element, threshold = 200) {
    const rect = element.getBoundingClientRect();
    const windowHeight = window.innerHeight;
    return rect.top < windowHeight + threshold && rect.bottom > -threshold;
  }

  // Advanced caching with TTL and compression
  setCache(key, data, ttl = 300000) {
    const entry = {
      data: this.compressData(data),
      timestamp: Date.now(),
      ttl,
      accessCount: 0,
      lastAccessed: Date.now()
    };
    
    this.cache.set(key, entry);
    
    // Cleanup old entries periodically
    if (this.cache.size > 100) {
      this.cleanupCache();
    }
  }

  // Get cached data with freshness check
  getCache(key) {
    const entry = this.cache.get(key);
    if (!entry) {
      this.metrics.cacheMisses++;
      return null;
    }

    const isExpired = Date.now() - entry.timestamp > entry.ttl;
    if (isExpired) {
      this.cache.delete(key);
      this.metrics.cacheMisses++;
      return null;
    }

    entry.accessCount++;
    entry.lastAccessed = Date.now();
    this.metrics.cacheHits++;
    
    return this.decompressData(entry.data);
  }

  // Simple data compression for cache
  compressData(data) {
    try {
      return JSON.stringify(data);
    } catch (error) {
      return data;
    }
  }

  // Simple data decompression
  decompressData(compressedData) {
    try {
      return JSON.parse(compressedData);
    } catch (error) {
      return compressedData;
    }
  }

  // Cleanup expired cache entries
  cleanupCache() {
    const now = Date.now();
    const entriesToDelete = [];

    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > entry.ttl || entry.accessCount === 0) {
        entriesToDelete.push(key);
      }
    }

    entriesToDelete.forEach(key => this.cache.delete(key));
    console.log(`🧹 Cache cleanup: removed ${entriesToDelete.length} entries`);
  }

  // Optimized render scheduling with priority
  scheduleRender(callback, priority = 'normal') {
    const renderTask = {
      callback,
      priority,
      timestamp: performance.now(),
      id: Math.random().toString(36).substr(2, 9)
    };

    // Insert based on priority
    if (priority === 'critical') {
      this.renderQueue.unshift(renderTask);
    } else if (priority === 'high') {
      const criticalCount = this.renderQueue.filter(t => t.priority === 'critical').length;
      this.renderQueue.splice(criticalCount, 0, renderTask);
    } else {
      this.renderQueue.push(renderTask);
    }

    if (!this.isProcessing) {
      this.processRenderQueue();
    }

    return renderTask.id;
  }

  // Process render queue with time slicing
  async processRenderQueue() {
    this.isProcessing = true;
    const timeSlice = 5; // 5ms time slice
    let processedCount = 0;

    while (this.renderQueue.length > 0) {
      const startTime = performance.now();
      
      while (this.renderQueue.length > 0 && (performance.now() - startTime) < timeSlice) {
        const task = this.renderQueue.shift();
        try {
          await task.callback();
          processedCount++;
          this.metrics.renderOptimizations++;
        } catch (error) {
          console.error('Render task failed:', error);
        }
      }

      // Yield to browser for other tasks
      if (this.renderQueue.length > 0) {
        await new Promise(resolve => setTimeout(resolve, 0));
      }
    }

    this.isProcessing = false;
    console.log(`⚡ Processed ${processedCount} render tasks`);
  }

  // Memory-efficient data streaming
  createDataStream(data, chunkSize = 50) {
    return {
      async *[Symbol.asyncIterator]() {
        for (let i = 0; i < data.length; i += chunkSize) {
          const chunk = data.slice(i, i + chunkSize);
          yield chunk;
          
          // Allow other tasks to run
          await new Promise(resolve => setTimeout(resolve, 0));
        }
      }
    };
  }

  // Virtualized list rendering for large datasets
  createVirtualizedList(items, itemHeight = 50, containerHeight = 400) {
    const visibleCount = Math.ceil(containerHeight / itemHeight) + 2; // Buffer
    
    return {
      getVisibleItems: (scrollTop = 0) => {
        const startIndex = Math.floor(scrollTop / itemHeight);
        const endIndex = Math.min(startIndex + visibleCount, items.length);
        
        return {
          items: items.slice(startIndex, endIndex),
          startIndex,
          endIndex,
          totalHeight: items.length * itemHeight,
          offsetY: startIndex * itemHeight
        };
      },
      
      scrollToIndex: (index) => {
        return index * itemHeight;
      }
    };
  }

  // Debounced function creator
  createDebounced(func, delay = 300) {
    let timeoutId;
    return (...args) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => func.apply(this, args), delay);
    };
  }

  // Throttled function creator
  createThrottled(func, limit = 100) {
    let inThrottle;
    return (...args) => {
      if (!inThrottle) {
        func.apply(this, args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  }

  // Track click patterns for prediction (disabled to prevent quota errors)
  trackClickPattern(element) {
    // Disabled to prevent localStorage quota exceeded errors
    return;
  }

  // Get element path for pattern recognition
  getElementPath(element) {
    const path = [];
    let current = element;
    
    while (current && current !== document.body) {
      let selector = current.tagName.toLowerCase();
      if (current.id) {
        selector += `#${current.id}`;
      } else if (current.className) {
        selector += `.${current.className.split(' ')[0]}`;
      }
      path.unshift(selector);
      current = current.parentElement;
    }
    
    return path.join(' > ');
  }

  // Adjust optimization strategy based on performance
  adjustOptimizationStrategy(metrics) {
    if (metrics.firstContentfulPaint > 2000) {
      // Slow loading - increase preload aggressiveness
      this.preloadThreshold = 50;
      console.log('🚀 Increased preload aggressiveness due to slow FCP');
    }

    if (metrics.domContentLoaded > 1000) {
      // Slow DOM - optimize render queue
      this.renderTimeSlice = 3;
      console.log('⚡ Reduced render time slice due to slow DOM');
    }
  }

  // Get performance metrics
  getMetrics() {
    const cacheHitRate = this.metrics.cacheHits / (this.metrics.cacheHits + this.metrics.cacheMisses) * 100;
    const preloadSuccessRate = this.metrics.preloadSuccess / (this.metrics.preloadSuccess + this.metrics.preloadFails) * 100;

    return {
      ...this.metrics,
      cacheHitRate: cacheHitRate.toFixed(2) + '%',
      preloadSuccessRate: preloadSuccessRate.toFixed(2) + '%',
      cacheSize: this.cache.size,
      queueSize: this.renderQueue.length
    };
  }

  // Resource hints for critical resources
  addResourceHints(resources) {
    const head = document.head;
    
    resources.forEach(resource => {
      const link = document.createElement('link');
      link.rel = resource.type; // 'preload', 'prefetch', 'preconnect'
      link.href = resource.url;
      if (resource.as) link.as = resource.as;
      if (resource.crossorigin) link.crossOrigin = resource.crossorigin;
      head.appendChild(link);
    });
  }

  // Warm up critical caches
  async warmupCache(endpoints) {
    console.log('🔥 Warming up cache...');
    const promises = endpoints.map(async (endpoint) => {
      try {
        const response = await fetch(endpoint, {
          method: 'GET',
          headers: { 'X-Cache-Warmup': 'true' }
        });
        
        if (response.ok) {
          const data = await response.json();
          this.setCache(endpoint, data, 600000); // 10 minutes for warmup
        }
      } catch (error) {
        console.warn('Cache warmup failed:', endpoint, error);
      }
    });

    await Promise.allSettled(promises);
    console.log('✅ Cache warmup complete');
  }
}

// Create singleton instance
export const advancedLatencyOptimizer = new AdvancedLatencyOptimizer();

// Initialize on load
if (typeof window !== 'undefined') {
  // Warm up critical caches
  advancedLatencyOptimizer.warmupCache([
    '/api/students',
    '/api/dashboard/stats',
    '/api/ledger/summary'
  ]);

  // Add resource hints for critical resources
  advancedLatencyOptimizer.addResourceHints([
    { type: 'preconnect', url: '/api' },
    { type: 'prefetch', url: '/api/students' },
    { type: 'prefetch', url: '/api/dashboard/stats' }
  ]);
}