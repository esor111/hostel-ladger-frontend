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
      console.log(
        "📡 Making API request to:",
        `${API_BASE_URL}/analytics/dashboard`
      );
      const result = await apiRequest("/analytics/dashboard");
      console.log("📊 Dashboard API response:", result);
      return result;
    } catch (error) {
      console.error("❌ Error fetching dashboard data:", error);
      throw error;
    }
  },
};
