// Advanced latency optimization utilities
class LatencyOptimizer {
  constructor() {
    this.preloadQueue = new Set();
    this.criticalResourcesCache = new Map();
    this.renderQueue = [];
    this.isProcessingQueue = false;
    this.observers = new Map();
    this.prefetchThreshold = 100; // ms before user interaction
  }

  // Predictive preloading based on user behavior
  initPredictivePreloading() {
    // Track mouse movements to predict next clicks
    let mouseTimer;
    document.addEventListener('mouseover', (e) => {
      clearTimeout(mouseTimer);
      mouseTimer = setTimeout(() => {
        this.predictAndPreload(e.target);
      }, this.prefetchThreshold);
    });

    // Track scroll patterns for viewport preloading
    let scrollTimer;
    window.addEventListener('scroll', () => {
      clearTimeout(scrollTimer);
      scrollTimer = setTimeout(() => {
        this.preloadViewportContent();
      }, 50);
    }, { passive: true });
  }

  // Predict and preload based on element interaction
  predictAndPreload(element) {
    const button = element.closest('button, [role="button"], a');
    if (!button) return;

    const action = button.dataset.action || button.getAttribute('href');
    if (action && !this.preloadQueue.has(action)) {
      this.preloadQueue.add(action);
      this.executePreload(action);
    }
  }

  // Execute preload based on action type
  async executePreload(action) {
    try {
      if (action.startsWith('/api/')) {
        // Preload API data
        const response = await fetch(action, { 
          method: 'GET',
          headers: { 'X-Preload': 'true' }
        });
        if (response.ok) {
          const data = await response.json();
          this.criticalResourcesCache.set(action, {
            data,
            timestamp: Date.now(),
            ttl: 30000 // 30 seconds
          });
        }
      } else if (action.includes('student') || action.includes('ledger')) {
        // Preload component data
        this.preloadComponentData(action);
      }
    } catch (error) {
      console.warn('Preload failed:', action, error);
    }
  }

  // Preload component-specific data
  async preloadComponentData(action) {
    const componentMap = {
      'student-management': () => import('../components/ledger/StudentManagement.tsx'),
      'billing-management': () => import('../components/ledger/BillingManagement.tsx'),
      'dashboard': () => import('../components/ledger/Dashboard.tsx')
    };

    const componentKey = Object.keys(componentMap).find(key => action.includes(key));
    if (componentKey && componentMap[componentKey]) {
      await componentMap[componentKey]();
    }
  }

  // Preload content entering viewport
  preloadViewportContent() {
    const elements = document.querySelectorAll('[data-preload-on-scroll]');
    elements.forEach(element => {
      if (this.isNearViewport(element)) {
        const preloadAction = element.dataset.preloadOnScroll;
        if (!this.preloadQueue.has(preloadAction)) {
          this.executePreload(preloadAction);
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

  // Optimized render queue for batch updates
  scheduleRender(callback, priority = 'normal') {
    const renderItem = {
      callback,
      priority,
      timestamp: performance.now()
    };

    if (priority === 'critical') {
      this.renderQueue.unshift(renderItem);
    } else {
      this.renderQueue.push(renderItem);
    }

    if (!this.isProcessingQueue) {
      this.processRenderQueue();
    }
  }

  // Process render queue with time slicing
  async processRenderQueue() {
    this.isProcessingQueue = true;
    const timeSlice = 5; // 5ms time slice

    while (this.renderQueue.length > 0) {
      const startTime = performance.now();
      
      while (this.renderQueue.length > 0 && (performance.now() - startTime) < timeSlice) {
        const item = this.renderQueue.shift();
        try {
          await item.callback();
        } catch (error) {
          console.error('Render queue error:', error);
        }
      }

      // Yield to browser for other tasks
      if (this.renderQueue.length > 0) {
        await new Promise(resolve => setTimeout(resolve, 0));
      }
    }

    this.isProcessingQueue = false;
  }

  // Memory-efficient data streaming
  createDataStream(dataSource, chunkSize = 50) {
    return {
      async *[Symbol.asyncIterator]() {
        let offset = 0;
        while (offset < dataSource.length) {
          const chunk = dataSource.slice(offset, offset + chunkSize);
          yield chunk;
          offset += chunkSize;
          
          // Allow other tasks to run
          await new Promise(resolve => setTimeout(resolve, 0));
        }
      }
    };
  }

  // Intelligent cache warming
  warmCache(endpoints, priority = 'low') {
    const warmingPromises = endpoints.map(async (endpoint) => {
      try {
        const response = await fetch(endpoint, {
          method: 'GET',
          headers: { 'X-Cache-Warm': 'true' },
          priority: priority
        });
        
        if (response.ok) {
          const data = await response.json();
          this.criticalResourcesCache.set(endpoint, {
            data,
            timestamp: Date.now(),
            ttl: 300000 // 5 minutes for warmed cache
          });
        }
      } catch (error) {
        console.warn('Cache warming failed:', endpoint, error);
      }
    });

    return Promise.allSettled(warmingPromises);
  }

  // Get cached data with freshness check
  getCachedData(key) {
    const cached = this.criticalResourcesCache.get(key);
    if (!cached) return null;

    const isExpired = Date.now() - cached.timestamp > cached.ttl;
    if (isExpired) {
      this.criticalResourcesCache.delete(key);
      return null;
    }

    return cached.data;
  }

  // Performance monitoring and auto-optimization
  startPerformanceMonitoring() {
    // Monitor Core Web Vitals
    this.observeWebVitals();
    
    // Monitor memory usage
    this.monitorMemoryUsage();
    
    // Auto-adjust optimization parameters
    this.autoTuneParameters();
  }

  observeWebVitals() {
    // Largest Contentful Paint
    new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const lcp = entries[entries.length - 1];
      if (lcp.startTime > 2500) {
        this.adjustOptimizationStrategy('lcp', lcp.startTime);
      }
    }).observe({ entryTypes: ['largest-contentful-paint'] });

    // First Input Delay
    new PerformanceObserver((list) => {
      const entries = list.getEntries();
      entries.forEach(entry => {
        if (entry.processingStart - entry.startTime > 100) {
          this.adjustOptimizationStrategy('fid', entry.processingStart - entry.startTime);
        }
      });
    }).observe({ entryTypes: ['first-input'] });
  }

  monitorMemoryUsage() {
    if ('memory' in performance) {
      setInterval(() => {
        const memory = performance.memory;
        const usageRatio = memory.usedJSHeapSize / memory.jsHeapSizeLimit;
        
        if (usageRatio > 0.8) {
          this.performMemoryCleanup();
        }
      }, 30000); // Check every 30 seconds
    }
  }

  performMemoryCleanup() {
    // Clear expired cache entries
    const now = Date.now();
    for (const [key, value] of this.criticalResourcesCache.entries()) {
      if (now - value.timestamp > value.ttl) {
        this.criticalResourcesCache.delete(key);
      }
    }

    // Clear preload queue
    this.preloadQueue.clear();

    console.log('🧹 Memory cleanup performed');
  }

  adjustOptimizationStrategy(metric, value) {
    switch (metric) {
      case 'lcp':
        // Increase preload aggressiveness
        this.prefetchThreshold = Math.max(50, this.prefetchThreshold - 10);
        break;
      case 'fid':
        // Reduce render queue time slice
        this.renderTimeSlice = Math.max(2, this.renderTimeSlice - 1);
        break;
    }
  }

  autoTuneParameters() {
    setInterval(() => {
      const connectionType = navigator.connection?.effectiveType;
      
      switch (connectionType) {
        case 'slow-2g':
        case '2g':
          this.prefetchThreshold = 200;
          break;
        case '3g':
          this.prefetchThreshold = 100;
          break;
        case '4g':
        default:
          this.prefetchThreshold = 50;
          break;
      }
    }, 60000); // Adjust every minute
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
}

export const latencyOptimizer = new LatencyOptimizer();

// Initialize on load
if (typeof window !== 'undefined') {
  latencyOptimizer.initPredictivePreloading();
  latencyOptimizer.startPerformanceMonitoring();
}