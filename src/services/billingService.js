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
    console.error("Billing API Request Error:", error);
    throw error;
  }
}

export const billingService = {
  // Get monthly billing statistics
  async getMonthlyStats() {
    try {
      console.log("📊 Fetching monthly billing stats from API...");
      const result = await apiRequest("/billing/monthly-stats");
      console.log("✅ Monthly billing stats fetched successfully");
      return result;
    } catch (error) {
      console.error("❌ Error fetching monthly billing stats:", error);
      throw error;
    }
  },

  // Generate monthly invoices for all active students
  async generateMonthlyInvoices(month, year, dueDate) {
    try {
      console.log(`📋 Generating monthly invoices for ${month}/${year}...`);
      const result = await apiRequest("/billing/generate-monthly", {
        method: "POST",
        body: JSON.stringify({ month, year, dueDate }),
      });
      console.log("✅ Monthly invoices generated successfully");
      return result;
    } catch (error) {
      console.error("❌ Error generating monthly invoices:", error);
      throw error;
    }
  },

  // Get billing schedule for upcoming months
  async getBillingSchedule(months = 6) {
    try {
      console.log(`📅 Fetching billing schedule for ${months} months...`);
      const result = await apiRequest(`/billing/schedule?months=${months}`);
      console.log("✅ Billing schedule fetched successfully");
      return result;
    } catch (error) {
      console.error("❌ Error fetching billing schedule:", error);
      throw error;
    }
  },

  // Preview billing for a specific month
  async previewMonthlyBilling(month, year) {
    try {
      console.log(`👀 Previewing billing for ${month}/${year}...`);
      const result = await apiRequest(`/billing/preview/${month}/${year}`);
      console.log("✅ Billing preview fetched successfully");
      return result;
    } catch (error) {
      console.error("❌ Error fetching billing preview:", error);
      throw error;
    }
  },

  // Get students ready for billing
  async getStudentsReadyForBilling() {
    try {
      console.log("👥 Fetching students ready for billing...");
      const result = await apiRequest("/billing/students-ready");
      console.log("✅ Students ready for billing fetched successfully");
      return result;
    } catch (error) {
      console.error("❌ Error fetching students ready for billing:", error);
      throw error;
    }
  },

  // Get billing history
  async getBillingHistory(page = 1, limit = 20) {
    try {
      console.log(`📜 Fetching billing history (page ${page})...`);
      const result = await apiRequest(`/billing/history?page=${page}&limit=${limit}`);
      console.log("✅ Billing history fetched successfully");
      return result;
    } catch (error) {
      console.error("❌ Error fetching billing history:", error);
      throw error;
    }
  },

  // Generate current month invoices
  async generateCurrentMonthInvoices() {
    const currentDate = new Date();
    const month = currentDate.getMonth();
    const year = currentDate.getFullYear();
    const dueDate = new Date(year, month, 15); // Due on 15th of the month

    return await this.generateMonthlyInvoices(month, year, dueDate);
  },

  // Generate next month invoices
  async generateNextMonthInvoices() {
    const nextMonth = new Date();
    nextMonth.setMonth(nextMonth.getMonth() + 1);
    const month = nextMonth.getMonth();
    const year = nextMonth.getFullYear();
    const dueDate = new Date(year, month, 15); // Due on 15th of the month

    return await this.generateMonthlyInvoices(month, year, dueDate);
  },

  // Preview current month billing
  async previewCurrentMonthBilling() {
    const currentDate = new Date();
    const month = currentDate.getMonth();
    const year = currentDate.getFullYear();

    return await this.previewMonthlyBilling(month, year);
  },

  // Preview next month billing
  async previewNextMonthBilling() {
    const nextMonth = new Date();
    nextMonth.setMonth(nextMonth.getMonth() + 1);
    const month = nextMonth.getMonth();
    const year = nextMonth.getFullYear();

    return await this.previewMonthlyBilling(month, year);
  }
};