
/**
 * Analytics and performance monitoring utilities
 */
export const Analytics = {
  /**
   * Measure and report core web vitals
   */
  measureWebVitals: () => {
    if (typeof window !== 'undefined' && 'performance' in window) {
      // Only run in production to avoid development noise
      if (process.env.NODE_ENV === 'production') {
        // Record LCP (Largest Contentful Paint)
        const observer = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const lcpEntry = entries[entries.length - 1];
          console.log('LCP:', lcpEntry.startTime / 1000, 'seconds');
        });
        observer.observe({ type: 'largest-contentful-paint', buffered: true });
        
        // Record FID (First Input Delay)
        const fidObserver = new PerformanceObserver((list) => {
          list.getEntries().forEach((entry) => {
            console.log('FID:', entry.processingStart - entry.startTime, 'ms');
          });
        });
        fidObserver.observe({ type: 'first-input', buffered: true });
        
        // Record CLS (Cumulative Layout Shift)
        let clsValue = 0;
        const clsObserver = new PerformanceObserver((list) => {
          list.getEntries().forEach((entry) => {
            if (!entry.hadRecentInput) {
              clsValue += entry.value;
              console.log('CLS current value:', clsValue);
            }
          });
        });
        clsObserver.observe({ type: 'layout-shift', buffered: true });
      }
    }
  },
  
  /**
   * Track page load performance
   */
  trackPageLoad: () => {
    if (typeof window !== 'undefined' && 'performance' in window) {
      window.addEventListener('load', () => {
        // Use Navigation Timing API
        const perfData = window.performance.timing;
        const pageLoadTime = perfData.loadEventEnd - perfData.navigationStart;
        console.log('Page load time:', pageLoadTime, 'ms');
        
        // Track network requests
        const resources = performance.getEntriesByType('resource');
        let totalTransferSize = 0;
        resources.forEach(resource => {
          if ('transferSize' in resource) {
            totalTransferSize += (resource as any).transferSize;
          }
        });
        
        console.log('Total transfer size:', (totalTransferSize / 1024 / 1024).toFixed(2), 'MB');
      });
    }
  }
};

// Initialize analytics if in browser
if (typeof window !== 'undefined') {
  Analytics.measureWebVitals();
  Analytics.trackPageLoad();
}
