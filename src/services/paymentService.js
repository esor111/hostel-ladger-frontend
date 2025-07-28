import { studentService } from "./studentService.js";
import { ledgerService } from "./ledgerService.js";
import { notificationService } from "./notificationService.js";

const API_BASE_URL = "http://localhost:3001/api/v1";

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
    // Handle the specific API response format: { status, result: { items, pagination } }
    if (data.result && data.result.items) {
      return data.result.items;
    }
    // For single item responses, return the result directly
    if (data.result && !data.result.items) {
      return data.result;
    }
    // Fallback for other formats
    return data.data || data;
  } catch (error) {
    console.error("Payment API Request Error:", error);
    throw error;
  }
}

export const paymentService = {
  // Get all payments with filtering and pagination
  async getPayments(filters = {}) {
    try {
      console.log("💰 Fetching payments from API...");
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
      const response = await apiRequest(endpoint);
      console.log("✅ Payments API response:", response);

      return response.result?.items || response || []; // Handle different response formats
    } catch (error) {
      console.error("❌ Error fetching payments:", error);
      throw error;
    }
  },

  // Get payment statistics from API
  async getPaymentStats() {
    try {
      console.log("📊 Fetching payment statistics from API...");
      const response = await fetch(`${API_BASE_URL}/payments/stats`);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      console.log("✅ Payment stats API response:", data);

      return data.stats || data;
    } catch (error) {
      console.error("❌ Error fetching payment stats:", error);
      throw error;
    }
  },

  // Get payment by ID
  async getPaymentById(id) {
    try {
      console.log(`💰 Fetching payment ${id} from API...`);
      const response = await fetch(`${API_BASE_URL}/payments/${id}`);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      console.log("✅ Payment details fetched");

      return data.data || data;
    } catch (error) {
      console.error("❌ Error fetching payment by ID:", error);
      throw error;
    }
  },

  // Get payments by student ID
  async getPaymentsByStudentId(studentId) {
    try {
      console.log(`💰 Fetching payments for student ${studentId}...`);
      const response = await fetch(
        `${API_BASE_URL}/payments/student/${studentId}`
      );

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      console.log("✅ Student payments fetched");

      return data.data || [];
    } catch (error) {
      console.error("❌ Error fetching payments by student ID:", error);
      throw error;
    }
  },

  // Record new payment
  async recordPayment(paymentData) {
    try {
      console.log("💰 Recording new payment via API...");
      const response = await fetch(`${API_BASE_URL}/payments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...paymentData,
          paymentDate:
            paymentData.paymentDate || new Date().toISOString().split("T")[0],
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message || `HTTP ${response.status}: ${response.statusText}`
        );
      }

      const data = await response.json();
      console.log("✅ Payment recorded successfully");

      return data.data || data;
    } catch (error) {
      console.error("❌ Error recording payment:", error);
      throw error;
    }
  },

  // Update payment
  async updatePayment(id, updates) {
    try {
      console.log(`💰 Updating payment ${id} via API...`);
      const response = await fetch(`${API_BASE_URL}/payments/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updates),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message || `HTTP ${response.status}: ${response.statusText}`
        );
      }

      const data = await response.json();
      console.log("✅ Payment updated successfully");

      return data.data || data;
    } catch (error) {
      console.error("❌ Error updating payment:", error);
      throw error;
    }
  },

  // Process bulk payments
  async processBulkPayments(payments) {
    try {
      console.log("💰 Processing bulk payments via API...");
      const response = await fetch(`${API_BASE_URL}/payments/bulk`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ payments }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message || `HTTP ${response.status}: ${response.statusText}`
        );
      }

      const data = await response.json();
      console.log("✅ Bulk payments processed successfully");

      return data.data || data;
    } catch (error) {
      console.error("❌ Error processing bulk payments:", error);
      throw error;
    }
  },

  // Allocate payment to invoices
  async allocatePaymentToInvoices(paymentId, invoiceAllocations) {
    try {
      console.log(`💰 Allocating payment ${paymentId} to invoices...`);
      const response = await fetch(
        `${API_BASE_URL}/payments/${paymentId}/allocate`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ invoiceAllocations }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message || `HTTP ${response.status}: ${response.statusText}`
        );
      }

      const data = await response.json();
      console.log("✅ Payment allocated successfully");

      return data.data || data;
    } catch (error) {
      console.error("❌ Error allocating payment:", error);
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
      console.log(
        `🔍 Filtering payments by date range: ${dateFrom} to ${dateTo}`
      );
      return await this.getPayments({ dateFrom, dateTo });
    } catch (error) {
      console.error("❌ Error filtering payments by date range:", error);
      throw error;
    }
  },
};
