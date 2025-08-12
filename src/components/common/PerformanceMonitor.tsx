// Real-time performance monitoring component
import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  Activity, 
  Zap, 
  Database, 
  Clock, 
  TrendingUp, 
  AlertTriangle,
  CheckCircle,
  RefreshCw
} from 'lucide-react';
import { advancedLatencyOptimizer } from '../../utils/advancedLatencyOptimizer.js';

interface PerformanceMetrics {
  // Core Web Vitals
  lcp?: number; // Largest Contentful Paint
  fid?: number; // First Input Delay
  cls?: number; // Cumulative Layout Shift
  fcp?: number; // First Contentful Paint
  ttfb?: number; // Time to First Byte
  
  // Custom metrics
  cacheHitRate?: string;
  preloadSuccessRate?: string;
  renderOptimizations?: number;
  memoryUsage?: number;
  networkRequests?: number;
  
  // Component metrics
  componentRenders?: number;
  slowOperations?: number;
}

interface ComponentMetric {
  name: string;
  duration: string;
  memoryUsage: string;
  timestamp: number;
}

export const PerformanceMonitor: React.FC = () => {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({});
  const [componentMetrics, setComponentMetrics] = useState<ComponentMetric[]>([]);
  const [isVisible, setIsVisible] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [refreshInterval, setRefreshInterval] = useState(5000);

  // Collect performance metrics
  const collectMetrics = useCallback(async () => {
    try {
      // Get Core Web Vitals
      const webVitals = await getWebVitals();
      
      // Get optimizer metrics
      const optimizerMetrics = advancedLatencyOptimizer.getMetrics();
      
      // Get memory usage
      const memoryInfo = getMemoryUsage();
      
      // Get network performance
      const networkMetrics = getNetworkMetrics();
      
      // Combine all metrics
      const combinedMetrics: PerformanceMetrics = {
        ...webVitals,
        ...optimizerMetrics,
        ...memoryInfo,
        ...networkMetrics
      };
      
      setMetrics(combinedMetrics);
      
      // Update component metrics
      updateComponentMetrics();
      
    } catch (error) {
      console.error('Failed to collect performance metrics:', error);
    }
  }, []);

  // Get Core Web Vitals
  const getWebVitals = (): Promise<Partial<PerformanceMetrics>> => {
    return new Promise((resolve) => {
      const metrics: Partial<PerformanceMetrics> = {};
      
      // Largest Contentful Paint
      new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lcp = entries[entries.length - 1];
        metrics.lcp = lcp.startTime;
      }).observe({ entryTypes: ['largest-contentful-paint'] });
      
      // First Input Delay
      new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach(entry => {
          metrics.fid = entry.processingStart - entry.startTime;
        });
      }).observe({ entryTypes: ['first-input'] });
      
      // Cumulative Layout Shift
      new PerformanceObserver((list) => {
        let clsValue = 0;
        list.getEntries().forEach(entry => {
          if (!entry.hadRecentInput) {
            clsValue += entry.value;
          }
        });
        metrics.cls = clsValue;
      }).observe({ entryTypes: ['layout-shift'] });
      
      // First Contentful Paint
      const paintEntries = performance.getEntriesByType('paint');
      const fcpEntry = paintEntries.find(entry => entry.name === 'first-contentful-paint');
      if (fcpEntry) {
        metrics.fcp = fcpEntry.startTime;
      }
      
      // Time to First Byte
      const navigationEntry = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      if (navigationEntry) {
        metrics.ttfb = navigationEntry.responseStart - navigationEntry.requestStart;
      }
      
      setTimeout(() => resolve(metrics), 1000);
    });
  };

  // Get memory usage information
  const getMemoryUsage = (): Partial<PerformanceMetrics> => {
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      return {
        memoryUsage: Math.round((memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100)
      };
    }
    return {};
  };

  // Get network performance metrics
  const getNetworkMetrics = (): Partial<PerformanceMetrics> => {
    const resourceEntries = performance.getEntriesByType('resource');
    const networkRequests = resourceEntries.filter(entry => 
      entry.name.includes('/api/') || entry.name.includes('/src/data/')
    ).length;
    
    return { networkRequests };
  };

  // Update component-specific metrics
  const updateComponentMetrics = () => {
    // This would typically come from a global performance store
    const mockComponentMetrics: ComponentMetric[] = [
      {
        name: 'StudentManagement',
        duration: '12.5',
        memoryUsage: '2.1',
        timestamp: Date.now() - 1000
      },
      {
        name: 'Dashboard',
        duration: '8.3',
        memoryUsage: '1.8',
        timestamp: Date.now() - 2000
      },
      {
        name: 'BillingManagement',
        duration: '15.2',
        memoryUsage: '3.2',
        timestamp: Date.now() - 3000
      }
    ];
    
    setComponentMetrics(mockComponentMetrics);
  };

  // Auto-refresh metrics
  useEffect(() => {
    if (autoRefresh && isVisible) {
      const interval = setInterval(collectMetrics, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [autoRefresh, isVisible, refreshInterval, collectMetrics]);

  // Initial metrics collection
  useEffect(() => {
    if (isVisible) {
      collectMetrics();
    }
  }, [isVisible, collectMetrics]);

  // Get performance score color
  const getScoreColor = (score: number, thresholds: { good: number; needs: number }) => {
    if (score <= thresholds.good) return 'text-green-600';
    if (score <= thresholds.needs) return 'text-yellow-600';
    return 'text-red-600';
  };

  // Get performance badge variant
  const getBadgeVariant = (score: number, thresholds: { good: number; needs: number }): "default" | "secondary" | "destructive" | "outline" => {
    if (score <= thresholds.good) return 'default';
    if (score <= thresholds.needs) return 'secondary';
    return 'destructive';
  };

  // Format duration
  const formatDuration = (ms: number) => {
    if (ms < 1000) return `${ms.toFixed(1)}ms`;
    return `${(ms / 1000).toFixed(2)}s`;
  };

  if (!isVisible) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <Button
          onClick={() => setIsVisible(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white rounded-full p-3"
          title="Show Performance Monitor"
        >
          <Activity size={20} />
        </Button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 w-96 max-h-[80vh] overflow-y-auto">
      <Card className="shadow-lg border-2">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Activity className="h-5 w-5 text-blue-600" />
              Performance Monitor
            </CardTitle>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={collectMetrics}
                title="Refresh Metrics"
              >
                <RefreshCw size={16} />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsVisible(false)}
                title="Hide Monitor"
              >
                ×
              </Button>
            </div>
          </div>
          
          <div className="flex items-center gap-2 text-sm">
            <Badge variant={autoRefresh ? 'default' : 'secondary'}>
              {autoRefresh ? 'Auto-refresh ON' : 'Auto-refresh OFF'}
            </Badge>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setAutoRefresh(!autoRefresh)}
              className="h-6 px-2 text-xs"
            >
              Toggle
            </Button>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Core Web Vitals */}
          <div>
            <h4 className="font-semibold text-sm mb-2 flex items-center gap-1">
              <Zap className="h-4 w-4" />
              Core Web Vitals
            </h4>
            <div className="grid grid-cols-2 gap-2 text-xs">
              {metrics.lcp && (
                <div className="bg-gray-50 p-2 rounded">
                  <div className="font-medium">LCP</div>
                  <div className={getScoreColor(metrics.lcp, { good: 2500, needs: 4000 })}>
                    {formatDuration(metrics.lcp)}
                  </div>
                </div>
              )}
              
              {metrics.fid && (
                <div className="bg-gray-50 p-2 rounded">
                  <div className="font-medium">FID</div>
                  <div className={getScoreColor(metrics.fid, { good: 100, needs: 300 })}>
                    {formatDuration(metrics.fid)}
                  </div>
                </div>
              )}
              
              {metrics.fcp && (
                <div className="bg-gray-50 p-2 rounded">
                  <div className="font-medium">FCP</div>
                  <div className={getScoreColor(metrics.fcp, { good: 1800, needs: 3000 })}>
                    {formatDuration(metrics.fcp)}
                  </div>
                </div>
              )}
              
              {metrics.ttfb && (
                <div className="bg-gray-50 p-2 rounded">
                  <div className="font-medium">TTFB</div>
                  <div className={getScoreColor(metrics.ttfb, { good: 800, needs: 1800 })}>
                    {formatDuration(metrics.ttfb)}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Cache Performance */}
          <div>
            <h4 className="font-semibold text-sm mb-2 flex items-center gap-1">
              <Database className="h-4 w-4" />
              Cache Performance
            </h4>
            <div className="space-y-2">
              {metrics.cacheHitRate && (
                <div className="flex items-center justify-between">
                  <span className="text-sm">Hit Rate</span>
                  <Badge variant="default">{metrics.cacheHitRate}</Badge>
                </div>
              )}
              
              {metrics.preloadSuccessRate && (
                <div className="flex items-center justify-between">
                  <span className="text-sm">Preload Success</span>
                  <Badge variant="default">{metrics.preloadSuccessRate}</Badge>
                </div>
              )}
              
              {metrics.renderOptimizations && (
                <div className="flex items-center justify-between">
                  <span className="text-sm">Render Optimizations</span>
                  <Badge variant="secondary">{metrics.renderOptimizations}</Badge>
                </div>
              )}
            </div>
          </div>

          {/* Memory Usage */}
          {metrics.memoryUsage && (
            <div>
              <h4 className="font-semibold text-sm mb-2 flex items-center gap-1">
                <TrendingUp className="h-4 w-4" />
                Memory Usage
              </h4>
              <div className="space-y-2">
                <Progress value={metrics.memoryUsage} className="h-2" />
                <div className="flex items-center justify-between text-xs">
                  <span>Heap Usage</span>
                  <span className={metrics.memoryUsage > 80 ? 'text-red-600' : 'text-green-600'}>
                    {metrics.memoryUsage}%
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Component Metrics */}
          <div>
            <h4 className="font-semibold text-sm mb-2 flex items-center gap-1">
              <Clock className="h-4 w-4" />
              Component Performance
            </h4>
            <div className="space-y-2 max-h-32 overflow-y-auto">
              {componentMetrics.map((metric, index) => (
                <div key={index} className="bg-gray-50 p-2 rounded text-xs">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium">{metric.name}</span>
                    <Badge 
                      variant={getBadgeVariant(parseFloat(metric.duration), { good: 16, needs: 50 })}
                      className="text-xs"
                    >
                      {metric.duration}ms
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between text-gray-600">
                    <span>Memory: {metric.memoryUsage}MB</span>
                    <span>{new Date(metric.timestamp).toLocaleTimeString()}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Performance Recommendations */}
          <div>
            <h4 className="font-semibold text-sm mb-2 flex items-center gap-1">
              <AlertTriangle className="h-4 w-4" />
              Recommendations
            </h4>
            <div className="space-y-1 text-xs">
              {metrics.lcp && metrics.lcp > 2500 && (
                <div className="flex items-center gap-1 text-yellow-600">
                  <AlertTriangle size={12} />
                  <span>Consider optimizing LCP</span>
                </div>
              )}
              
              {metrics.memoryUsage && metrics.memoryUsage > 80 && (
                <div className="flex items-center gap-1 text-red-600">
                  <AlertTriangle size={12} />
                  <span>High memory usage detected</span>
                </div>
              )}
              
              {metrics.cacheHitRate && parseFloat(metrics.cacheHitRate) < 70 && (
                <div className="flex items-center gap-1 text-yellow-600">
                  <AlertTriangle size={12} />
                  <span>Low cache hit rate</span>
                </div>
              )}
              
              {(!metrics.lcp || metrics.lcp <= 2500) && 
               (!metrics.memoryUsage || metrics.memoryUsage <= 80) && 
               (!metrics.cacheHitRate || parseFloat(metrics.cacheHitRate) >= 70) && (
                <div className="flex items-center gap-1 text-green-600">
                  <CheckCircle size={12} />
                  <span>Performance looks good!</span>
                </div>
              )}
            </div>
          </div>

          {/* Controls */}
          <div className="pt-2 border-t">
            <div className="flex items-center justify-between text-xs">
              <span>Refresh Interval:</span>
              <select 
                value={refreshInterval}
                onChange={(e) => setRefreshInterval(Number(e.target.value))}
                className="text-xs border rounded px-1"
              >
                <option value={1000}>1s</option>
                <option value={5000}>5s</option>
                <option value={10000}>10s</option>
                <option value={30000}>30s</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};