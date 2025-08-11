
import { getEnvironmentConfig } from '../config/environment.ts';

const API_BASE_URL = getEnvironmentConfig().apiBaseUrl;

// Helper function to handle API requests
async function apiRequest(endpoint, options = {}) {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    return data.data; // API returns data in { status, data } format
  } catch (error) {
    console.error('Analytics API Request Error:', error);
    throw error;
  }
}

// Cache for dashboard data to avoid repeated API calls
let dashboardDataCache = null;
let cacheTimestamp = null;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

async function getDashboardData() {
  // Check if we have valid cached data
  if (dashboardDataCache && cacheTimestamp && (Date.now() - cacheTimestamp < CACHE_DURATION)) {
    return dashboardDataCache;
  }

  try {
    const data = await apiRequest('/analytics/dashboard');
    dashboardDataCache = data;
    cacheTimestamp = Date.now();
    return data;
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    throw error;
  }
}

export const analyticsService = {
  // Get monthly revenue data
  async getMonthlyRevenue() {
    try {
      const dashboardData = await getDashboardData();
      return dashboardData.monthlyData || [];
    } catch (error) {
      console.error('Error fetching monthly revenue:', error);
      throw error;
    }
  },

  // Get guest type distribution
  async getGuestTypeData() {
    try {
      const dashboardData = await getDashboardData();
      return dashboardData.guestTypeData || [];
    } catch (error) {
      console.error('Error fetching guest type data:', error);
      throw error;
    }
  },

  // Get performance metrics
  async getPerformanceMetrics() {
    try {
      const dashboardData = await getDashboardData();
      return dashboardData.performanceMetrics || {};
    } catch (error) {
      console.error('Error fetching performance metrics:', error);
      throw error;
    }
  },

  // Get collection statistics (mock data since not in API yet)
  async getCollectionStats() {
    try {
      // This data is not provided by the current API, so we'll return mock data
      // In a real implementation, this would come from a separate endpoint
      return {
        totalCollected: 450000,
        outstandingDues: 85000,
        collectionRate: 84,
        overdueInvoices: 12
      };
    } catch (error) {
      console.error('Error fetching collection stats:', error);
      throw error;
    }
  },

  // Get comprehensive analytics data
  async getAllAnalytics() {
    try {
      const dashboardData = await getDashboardData();
      
      // Combine API data with mock collection stats for backward compatibility
      return {
        monthlyRevenue: dashboardData.monthlyData || [],
        guestTypeData: dashboardData.guestTypeData || [],
        performanceMetrics: dashboardData.performanceMetrics || {},
        collectionStats: {
          totalCollected: 450000,
          outstandingDues: 85000,
          collectionRate: 84,
          overdueInvoices: 12
        },
        summary: dashboardData.summary || {}
      };
    } catch (error) {
      console.error('Error fetching all analytics:', error);
      throw error;
    }
  },

  // Calculate trends (now uses API data)
  async calculateTrends() {
    try {
      const dashboardData = await getDashboardData();
      
      if (dashboardData.summary) {
        // Use pre-calculated trends from API
        return {
          revenueGrowth: dashboardData.summary.revenueGrowth || 0,
          bookingGrowth: dashboardData.summary.bookingsGrowth || 0,
          occupancyGrowth: dashboardData.summary.occupancyGrowth || 0
        };
      }
      
      // Fallback: calculate from monthly data if summary not available
      const revenue = dashboardData.monthlyData || [];
      if (revenue.length < 2) {
        return { revenueGrowth: 0, bookingGrowth: 0, occupancyGrowth: 0 };
      }
      
      const lastMonth = revenue[revenue.length - 1];
      const previousMonth = revenue[revenue.length - 2];
      
      return {
        revenueGrowth: ((lastMonth.revenue - previousMonth.revenue) / previousMonth.revenue * 100).toFixed(1),
        bookingGrowth: ((lastMonth.bookings - previousMonth.bookings) / previousMonth.bookings * 100).toFixed(1),
        occupancyGrowth: ((lastMonth.occupancy - previousMonth.occupancy) / previousMonth.occupancy * 100).toFixed(1)
      };
    } catch (error) {
      console.error('Error calculating trends:', error);
      throw error;
    }
  },

  // Get dashboard summary data (new method)
  async getDashboardSummary() {
    try {
      const dashboardData = await getDashboardData();
      return dashboardData.summary || {};
    } catch (error) {
      console.error('Error fetching dashboard summary:', error);
      throw error;
    }
  },

  // Clear cache (useful for forcing refresh)
  clearCache() {
    dashboardDataCache = null;
    cacheTimestamp = null;
  }
};
