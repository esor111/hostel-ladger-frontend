import { getEnvironmentConfig } from '../config/environment.ts';

const API_BASE_URL = 'http://localhost:3001/hostel/api/v1';

// Helper function to handle API requests
async function apiRequest(endpoint, options = {}) {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
      ...options,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.message || `HTTP ${response.status}: ${response.statusText}`
      );
    }

    const data = await response.json();
    return data; // API now returns data directly
  } catch (error) {
    console.error("Dashboard API Request Error:", error);
    throw error;
  }
}

export const dashboardService = {
  // Get dashboard statistics
  async getStats() {
    return apiRequest('/dashboard/stats');
  },

  // Get recent activity
  async getRecentActivity(limit = 10) {
    return apiRequest(`/dashboard/recent-activity?limit=${limit}`);
  },

  // Get monthly revenue
  async getMonthlyRevenue(year, month) {
    const params = new URLSearchParams();
    if (year) params.append('year', year);
    if (month) params.append('month', month);
    
    const queryString = params.toString();
    return apiRequest(`/dashboard/monthly-revenue${queryString ? '?' + queryString : ''}`);
  },

  // Get current month revenue
  async getCurrentMonthRevenue() {
    const now = new Date();
    return this.getMonthlyRevenue(now.getFullYear(), now.getMonth() + 1);
  },

  // Get checked out students with dues
  async getCheckedOutWithDues() {
    const response = await apiRequest('/dashboard/checked-out-dues');
    return response.data || response; // Handle both formats
  }
};
