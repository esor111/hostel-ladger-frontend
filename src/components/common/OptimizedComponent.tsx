import React, { memo, useMemo, useCallback, useRef, useEffect } from 'react';

// Higher-order component for performance optimization
export const withOptimization = (WrappedComponent: React.ComponentType<any>, options: any = {}) => {
  const {
    memoize = true,
    virtualizeThreshold = 100,
    lazyLoad = false,
    preloadData = null
  } = options;

  const OptimizedComponent = memo((props: any) => {
    const componentRef = useRef(null);
    const renderCountRef = useRef(0);
    const lastPropsRef = useRef(props);

    // Track render performance
    useEffect(() => {
      renderCountRef.current++;
      const renderTime = performance.now();
      
      return () => {
        const endTime = performance.now();
        if (renderCountRef.current > 1) {
          console.log(`${WrappedComponent.name} render time:`, endTime - renderTime, 'ms');
        }
      };
    });

    // Preload data if specified
    useEffect(() => {
      if (preloadData && typeof preloadData === 'function') {
        // Simple prefetch implementation
        preloadData().catch((error: Error) => {
          console.warn('Preload failed:', error);
        });
      }
    }, []);

    // Memoized props to prevent unnecessary re-renders
    const memoizedProps = useMemo(() => {
      if (!memoize) return props;
      
      // Deep comparison for complex props
      const hasChanged = JSON.stringify(props) !== JSON.stringify(lastPropsRef.current);
      if (!hasChanged) {
        return lastPropsRef.current;
      }
      
      lastPropsRef.current = props;
      return props;
    }, [props, memoize]);

    return (
      <div ref={componentRef}>
        <WrappedComponent {...memoizedProps} />
      </div>
    );
  });

  OptimizedComponent.displayName = `Optimized(${WrappedComponent.displayName || WrappedComponent.name})`;
  
  return OptimizedComponent;
};

// Virtual scrolling component for large lists
interface VirtualizedListProps {
  items: any[];
  renderItem: (item: any, index: number) => React.ReactNode;
  itemHeight?: number;
  containerHeight?: number;
  overscan?: number;
}

export const VirtualizedList = memo<VirtualizedListProps>(({ 
  items, 
  renderItem, 
  itemHeight = 60, 
  containerHeight = 400,
  overscan = 5 
}) => {
  const [scrollTop, setScrollTop] = React.useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const visibleRange = useMemo(() => {
    const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
    const endIndex = Math.min(
      items.length - 1,
      Math.ceil((scrollTop + containerHeight) / itemHeight) + overscan
    );
    return { startIndex, endIndex };
  }, [scrollTop, itemHeight, containerHeight, items.length, overscan]);

  const visibleItems = useMemo(() => {
    return items.slice(visibleRange.startIndex, visibleRange.endIndex + 1);
  }, [items, visibleRange]);

  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop);
  }, []);

  const totalHeight = items.length * itemHeight;
  const offsetY = visibleRange.startIndex * itemHeight;

  return (
    <div
      ref={containerRef}
      style={{ height: containerHeight, overflow: 'auto' }}
      onScroll={handleScroll}
    >
      <div style={{ height: totalHeight, position: 'relative' }}>
        <div style={{ transform: `translateY(${offsetY}px)` }}>
          {visibleItems.map((item, index) => (
            <div
              key={visibleRange.startIndex + index}
              style={{ height: itemHeight }}
            >
              {renderItem(item, visibleRange.startIndex + index)}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
});

// Lazy loading component with intersection observer
interface LazyComponentProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  threshold?: number;
  rootMargin?: string;
}

export const LazyComponent = memo<LazyComponentProps>(({ 
  children, 
  fallback = <div>Loading...</div>,
  threshold = 0.1,
  rootMargin = '50px'
}) => {
  const [isVisible, setIsVisible] = React.useState(false);
  const [hasLoaded, setHasLoaded] = React.useState(false);
  const elementRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasLoaded) {
          setIsVisible(true);
          setHasLoaded(true);
          observer.disconnect();
        }
      },
      { threshold, rootMargin }
    );

    if (elementRef.current) {
      observer.observe(elementRef.current);
    }

    return () => observer.disconnect();
  }, [threshold, rootMargin, hasLoaded]);

  return (
    <div ref={elementRef}>
      {isVisible ? children : fallback}
    </div>
  );
});

// Optimized image component with lazy loading
interface OptimizedImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  lazy?: boolean;
  quality?: number;
}

export const OptimizedImage = memo<OptimizedImageProps>(({ 
  src, 
  alt, 
  width, 
  height, 
  className = '',
  lazy = true,
  quality = 80
}) => {
  const [imageSrc, setImageSrc] = React.useState(lazy ? '' : src);
  const [isLoaded, setIsLoaded] = React.useState(false);
  const [hasError, setHasError] = React.useState(false);
  const imgRef = useRef<HTMLDivElement>(null);

  // Generate optimized image URL
  const optimizedSrc = useMemo(() => {
    if (!src) return '';
    
    const params = new URLSearchParams({
      w: width?.toString() || 'auto',
      h: height?.toString() || 'auto',
      q: quality.toString(),
      f: 'webp'
    });
    
    return `${src}?${params.toString()}`;
  }, [src, width, height, quality]);

  useEffect(() => {
    if (!lazy) {
      setImageSrc(optimizedSrc);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setImageSrc(optimizedSrc);
          observer.disconnect();
        }
      },
      { threshold: 0.1, rootMargin: '50px' }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => observer.disconnect();
  }, [lazy, optimizedSrc]);

  const handleLoad = useCallback(() => {
    setIsLoaded(true);
  }, []);

  const handleError = useCallback(() => {
    setHasError(true);
    // Fallback to original image
    if (imageSrc !== src) {
      setImageSrc(src);
      setHasError(false);
    }
  }, [imageSrc, src]);

  return (
    <div 
      ref={imgRef}
      className={`relative overflow-hidden ${className}`}
      style={{ width, height }}
    >
      {imageSrc && !hasError && (
        <img
          src={imageSrc}
          alt={alt}
          width={width}
          height={height}
          className={`transition-opacity duration-300 ${
            isLoaded ? 'opacity-100' : 'opacity-0'
          }`}
          onLoad={handleLoad}
          onError={handleError}
          loading={lazy ? 'lazy' : 'eager'}
        />
      )}
      
      {!isLoaded && !hasError && (
        <div 
          className="absolute inset-0 bg-gray-200 animate-pulse flex items-center justify-center"
          style={{ width, height }}
        >
          <div className="text-gray-400 text-sm">Loading...</div>
        </div>
      )}
      
      {hasError && (
        <div 
          className="absolute inset-0 bg-gray-100 flex items-center justify-center"
          style={{ width, height }}
        >
          <div className="text-gray-400 text-sm">Failed to load</div>
        </div>
      )}
    </div>
  );
});

// Performance monitoring component
interface PerformanceMonitorProps {
  children: React.ReactNode;
  componentName: string;
}

export const PerformanceMonitor = memo<PerformanceMonitorProps>(({ children, componentName }) => {
  const renderStartTime = useRef(performance.now());
  const mountTime = useRef<number | null>(null);

  useEffect(() => {
    mountTime.current = performance.now();
    const mountDuration = mountTime.current - renderStartTime.current;
    
    console.log(`${componentName} mount time:`, mountDuration, 'ms');
    
    return () => {
      if (mountTime.current) {
        const unmountTime = performance.now();
        const totalLifetime = unmountTime - mountTime.current;
        console.log(`${componentName} lifetime:`, totalLifetime, 'ms');
      }
    };
  }, [componentName]);

  return <>{children}</>;
});

// Batch update hook for multiple state updates
export const useBatchedUpdates = () => {
  const batchRef = useRef<(() => void)[]>([]);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const batchUpdate = useCallback((updateFn: () => void) => {
    batchRef.current.push(updateFn);
    
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    timeoutRef.current = setTimeout(() => {
      // Use React's batching
      batchRef.current.forEach(fn => fn());
      batchRef.current = [];
    }, 0);
  }, []);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return batchUpdate;
};

VirtualizedList.displayName = 'VirtualizedList';
LazyComponent.displayName = 'LazyComponent';
OptimizedImage.displayName = 'OptimizedImage';
PerformanceMonitor.displayName = 'PerformanceMonitor';