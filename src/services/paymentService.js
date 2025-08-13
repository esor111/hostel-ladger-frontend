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
    console.error("Payment API Request Error:", error);
    throw error;
  }
}

export const paymentService = {
  // Get all payments with filtering and pagination
  async getPayments(filters = {}) {
    try {
      console.log("💳 Fetching payments from API...");
      const queryParams = new URLSearchParams();

      // Add filters as query parameters
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
          queryParams.append(key, value);
        }
      });

      const endpoint = `/payments${
        queryParams.toString() ? `?${queryParams.toString()}` : ""
      }`;
      const result = await apiRequest(endpoint);
      console.log("✅ Payments API response:", result);

      return result;
    } catch (error) {
      console.error("❌ Error fetching payments:", error);
      throw error;
    }
  },

  // Get payment by ID
  async getPaymentById(paymentId) {
    try {
      console.log(`💳 Fetching payment ${paymentId} from API...`);
      const result = await apiRequest(`/payments/${paymentId}`);
      console.log("✅ Payment fetched successfully");
      return result;
    } catch (error) {
      console.error("❌ Error fetching payment:", error);
      throw error;
    }
  },

  // Record new payment
  async recordPayment(paymentData) {
    try {
      console.log("💳 Recording new payment via API...");
      const result = await apiRequest("/payments", {
        method: "POST",
        body: JSON.stringify(paymentData),
      });
      console.log("✅ Payment recorded successfully");
      return result;
    } catch (error) {
      console.error("❌ Error recording payment:", error);
      throw error;
    }
  },

  // Update payment
  async updatePayment(paymentId, updateData) {
    try {
      console.log(`💳 Updating payment ${paymentId} via API...`);
      const result = await apiRequest(`/payments/${paymentId}`, {
        method: "PUT",
        body: JSON.stringify(updateData),
      });
      console.log("✅ Payment updated successfully");
      return result;
    } catch (error) {
      console.error("❌ Error updating payment:", error);
      throw error;
    }
  },

  // Delete payment
  async deletePayment(paymentId) {
    try {
      console.log(`💳 Deleting payment ${paymentId} via API...`);
      const result = await apiRequest(`/payments/${paymentId}`, {
        method: "DELETE",
      });
      console.log("✅ Payment deleted successfully");
      return result;
    } catch (error) {
      console.error("❌ Error deleting payment:", error);
      throw error;
    }
  },

  // Get payment statistics
  async getPaymentStats() {
    try {
      console.log("📊 Fetching payment statistics from API...");
      const result = await apiRequest("/payments/stats");
      console.log("✅ Payment stats fetched successfully");
      return result;
    } catch (error) {
      console.error("❌ Error fetching payment stats:", error);
      throw error;
    }
  },

  // Get available payment methods
  async getPaymentMethods() {
    try {
      console.log("💳 Fetching payment methods from API...");
      const result = await apiRequest("/payments/methods");
      console.log("✅ Payment methods fetched successfully");
      return result;
    } catch (error) {
      console.error("❌ Error fetching payment methods:", error);
      throw error;
    }
  },

  // Get payments for a specific student
  async getStudentPayments(studentId) {
    try {
      console.log(`💳 Fetching payments for student ${studentId}...`);
      const result = await apiRequest(`/payments/student/${studentId}`);
      console.log("✅ Student payments fetched successfully");
      return result;
    } catch (error) {
      console.error("❌ Error fetching student payments:", error);
      throw error;
    }
  },

  // Record multiple payments
  async recordBulkPayments(paymentsData) {
    try {
      console.log("💳 Recording bulk payments via API...");
      const result = await apiRequest("/payments/bulk", {
        method: "POST",
        body: JSON.stringify({ payments: paymentsData }),
      });
      console.log("✅ Bulk payments recorded successfully");
      return result;
    } catch (error) {
      console.error("❌ Error recording bulk payments:", error);
      throw error;
    }
  },

  // Get monthly payment summary
  async getMonthlyPaymentSummary(months = 12) {
    try {
      console.log(`📊 Fetching monthly payment summary for ${months} months...`);
      const result = await apiRequest(`/payments/summary/monthly?months=${months}`);
      console.log("✅ Monthly payment summary fetched successfully");
      return result;
    } catch (error) {
      console.error("❌ Error fetching monthly payment summary:", error);
      throw error;
    }
  },

  // Search payments
  async searchPayments(searchTerm, filters = {}) {
    try {
      console.log(`🔍 Searching payments: ${searchTerm}`);
      return await this.getPayments({ search: searchTerm, ...filters });
    } catch (error) {
      console.error("❌ Error searching payments:", error);
      throw error;
    }
  },

  // Filter payments by method
  async filterPaymentsByMethod(paymentMethod) {
    try {
      console.log(`🔍 Filtering payments by method: ${paymentMethod}`);
      return await this.getPayments({ paymentMethod });
    } catch (error) {
      console.error("❌ Error filtering payments by method:", error);
      throw error;
    }
  },

  // Filter payments by date range
  async filterPaymentsByDateRange(dateFrom, dateTo) {
    try {
      console.log(`🔍 Filtering payments by date range: ${dateFrom} to ${dateTo}`);
      return await this.getPayments({ dateFrom, dateTo });
    } catch (error) {
      console.error("❌ Error filtering payments by date range:", error);
      throw error;
    }
  },

  // Get recent payments
  async getRecentPayments(limit = 10) {
    try {
      console.log(`💳 Fetching ${limit} recent payments...`);
      return await this.getPayments({ limit, page: 1 });
    } catch (error) {
      console.error("❌ Error fetching recent payments:", error);
      throw error;
    }
  }
};