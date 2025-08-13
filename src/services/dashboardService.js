import { getEnvironmentConfig } from '../config/environment.ts';

const API_BASE_URL = getEnvironmentConfig().apiBaseUrl;

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
    return data.data; // API returns data in { status, data } format
  } catch (error) {
    console.error("Dashboard API Request Error:", error);
    throw error;
  }
}

export const dashboardService = {
  // Get comprehensive dashboard analytics data
  async getDashboardData() {
    try {
      console.log("📡 Making API request to:", `${API_BASE_URL}/dashboard/summary`);
      const result = await apiRequest("/dashboard/summary");
      console.log("📊 Dashboard API response:", result);
      return result;
    } catch (error) {
      console.error("❌ Error fetching dashboard data:", error);
      throw error;
    }
  },

  // Get dashboard statistics
  async getDashboardStats() {
    try {
      console.log("📡 Making API request to:", `${API_BASE_URL}/dashboard/stats`);
      const result = await apiRequest("/dashboard/stats");
      console.log("📊 Dashboard stats API response:", result);
      return result;
    } catch (error) {
      console.error("❌ Error fetching dashboard stats:", error);
      throw error;
    }
  },

  // Get recent activities
  async getRecentActivity(limit = 10) {
    try {
      console.log("📡 Making API request to:", `${API_BASE_URL}/dashboard/recent-activity?limit=${limit}`);
      const result = await apiRequest(`/dashboard/recent-activity?limit=${limit}`);
      console.log("📊 Recent activity API response:", result);
      return result;
    } catch (error) {
      console.error("❌ Error fetching recent activity:", error);
      throw error;
    }
  },

  // Get students with outstanding dues after checkout
  async getCheckedOutWithDues() {
    try {
      console.log("📡 Making API request to:", `${API_BASE_URL}/dashboard/checked-out-dues`);
      const result = await apiRequest("/dashboard/checked-out-dues");
      console.log("📊 Checked out with dues API response:", result);
      return result;
    } catch (error) {
      console.error("❌ Error fetching checked out students with dues:", error);
      throw error;
    }
  },

  // Get monthly revenue data
  async getMonthlyRevenue(months = 12) {
    try {
      console.log("📡 Making API request to:", `${API_BASE_URL}/dashboard/monthly-revenue?months=${months}`);
      const result = await apiRequest(`/dashboard/monthly-revenue?months=${months}`);
      console.log("📊 Monthly revenue API response:", result);
      return result;
    } catch (error) {
      console.error("❌ Error fetching monthly revenue:", error);
      throw error;
    }
  },

  // Get overdue invoices
  async getOverdueInvoices() {
    try {
      console.log("📡 Making API request to:", `${API_BASE_URL}/dashboard/overdue-invoices`);
      const result = await apiRequest("/dashboard/overdue-invoices");
      console.log("📊 Overdue invoices API response:", result);
      return result;
    } catch (error) {
      console.error("❌ Error fetching overdue invoices:", error);
      throw error;
    }
  }
};
