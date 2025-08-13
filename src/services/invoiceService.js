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
    console.error("Invoice API Request Error:", error);
    throw error;
  }
}

export const invoiceService = {
  // Get all invoices with filtering and pagination
  async getInvoices(filters = {}) {
    try {
      console.log("🧾 Fetching invoices from API...");
      const queryParams = new URLSearchParams();

      // Add filters as query parameters
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
          queryParams.append(key, value);
        }
      });

      const endpoint = `/invoices${
        queryParams.toString() ? `?${queryParams.toString()}` : ""
      }`;
      const result = await apiRequest(endpoint);
      console.log("✅ Invoices API response:", result);

      return result;
    } catch (error) {
      console.error("❌ Error fetching invoices:", error);
      throw error;
    }
  },

  // Get invoice by ID
  async getInvoiceById(invoiceId) {
    try {
      console.log(`🧾 Fetching invoice ${invoiceId} from API...`);
      const result = await apiRequest(`/invoices/${invoiceId}`);
      console.log("✅ Invoice fetched successfully");
      return result;
    } catch (error) {
      console.error("❌ Error fetching invoice:", error);
      throw error;
    }
  },

  // Create new invoice
  async createInvoice(invoiceData) {
    try {
      console.log("🧾 Creating new invoice via API...");
      const result = await apiRequest("/invoices", {
        method: "POST",
        body: JSON.stringify(invoiceData),
      });
      console.log("✅ Invoice created successfully");
      return result;
    } catch (error) {
      console.error("❌ Error creating invoice:", error);
      throw error;
    }
  },

  // Update invoice
  async updateInvoice(invoiceId, updateData) {
    try {
      console.log(`🧾 Updating invoice ${invoiceId} via API...`);
      const result = await apiRequest(`/invoices/${invoiceId}`, {
        method: "PUT",
        body: JSON.stringify(updateData),
      });
      console.log("✅ Invoice updated successfully");
      return result;
    } catch (error) {
      console.error("❌ Error updating invoice:", error);
      throw error;
    }
  },

  // Delete invoice
  async deleteInvoice(invoiceId) {
    try {
      console.log(`🧾 Deleting invoice ${invoiceId} via API...`);
      const result = await apiRequest(`/invoices/${invoiceId}`, {
        method: "DELETE",
      });
      console.log("✅ Invoice deleted successfully");
      return result;
    } catch (error) {
      console.error("❌ Error deleting invoice:", error);
      throw error;
    }
  },

  // Get invoice statistics
  async getInvoiceStats() {
    try {
      console.log("📊 Fetching invoice statistics from API...");
      const result = await apiRequest("/invoices/stats");
      console.log("✅ Invoice stats fetched successfully");
      return result;
    } catch (error) {
      console.error("❌ Error fetching invoice stats:", error);
      throw error;
    }
  },

  // Get invoices for a specific student
  async getStudentInvoices(studentId) {
    try {
      console.log(`🧾 Fetching invoices for student ${studentId}...`);
      const result = await apiRequest(`/invoices/student/${studentId}`);
      console.log("✅ Student invoices fetched successfully");
      return result;
    } catch (error) {
      console.error("❌ Error fetching student invoices:", error);
      throw error;
    }
  },

  // Create multiple invoices
  async createBulkInvoices(invoicesData) {
    try {
      console.log("🧾 Creating bulk invoices via API...");
      const result = await apiRequest("/invoices/bulk", {
        method: "POST",
        body: JSON.stringify({ invoices: invoicesData }),
      });
      console.log("✅ Bulk invoices created successfully");
      return result;
    } catch (error) {
      console.error("❌ Error creating bulk invoices:", error);
      throw error;
    }
  },

  // Update invoice status
  async updateInvoiceStatus(invoiceId, status, notes) {
    try {
      console.log(`🧾 Updating invoice ${invoiceId} status to ${status}...`);
      const result = await apiRequest(`/invoices/${invoiceId}/status`, {
        method: "PUT",
        body: JSON.stringify({ status, notes }),
      });
      console.log("✅ Invoice status updated successfully");
      return result;
    } catch (error) {
      console.error("❌ Error updating invoice status:", error);
      throw error;
    }
  },

  // Send invoice to student
  async sendInvoice(invoiceId) {
    try {
      console.log(`🧾 Sending invoice ${invoiceId}...`);
      const result = await apiRequest(`/invoices/${invoiceId}/send`, {
        method: "POST",
      });
      console.log("✅ Invoice sent successfully");
      return result;
    } catch (error) {
      console.error("❌ Error sending invoice:", error);
      throw error;
    }
  },

  // Get overdue invoices
  async getOverdueInvoices() {
    try {
      console.log("🧾 Fetching overdue invoices from API...");
      const result = await apiRequest("/invoices/overdue/list");
      console.log("✅ Overdue invoices fetched successfully");
      return result;
    } catch (error) {
      console.error("❌ Error fetching overdue invoices:", error);
      throw error;
    }
  },

  // Get monthly invoice summary
  async getMonthlyInvoiceSummary(months = 12) {
    try {
      console.log(`📊 Fetching monthly invoice summary for ${months} months...`);
      const result = await apiRequest(`/invoices/summary/monthly?months=${months}`);
      console.log("✅ Monthly invoice summary fetched successfully");
      return result;
    } catch (error) {
      console.error("❌ Error fetching monthly invoice summary:", error);
      throw error;
    }
  },

  // Search invoices
  async searchInvoices(searchTerm, filters = {}) {
    try {
      console.log(`🔍 Searching invoices: ${searchTerm}`);
      return await this.getInvoices({ search: searchTerm, ...filters });
    } catch (error) {
      console.error("❌ Error searching invoices:", error);
      throw error;
    }
  },

  // Filter invoices by status
  async filterInvoicesByStatus(status) {
    try {
      console.log(`🔍 Filtering invoices by status: ${status}`);
      return await this.getInvoices({ status });
    } catch (error) {
      console.error("❌ Error filtering invoices by status:", error);
      throw error;
    }
  },

  // Filter invoices by month
  async filterInvoicesByMonth(month) {
    try {
      console.log(`🔍 Filtering invoices by month: ${month}`);
      return await this.getInvoices({ month });
    } catch (error) {
      console.error("❌ Error filtering invoices by month:", error);
      throw error;
    }
  },

  // Get recent invoices
  async getRecentInvoices(limit = 10) {
    try {
      console.log(`🧾 Fetching ${limit} recent invoices...`);
      return await this.getInvoices({ limit, page: 1 });
    } catch (error) {
      console.error("❌ Error fetching recent invoices:", error);
      throw error;
    }
  },

  // Get paid invoices
  async getPaidInvoices() {
    try {
      console.log("🧾 Fetching paid invoices...");
      return await this.getInvoices({ status: 'paid' });
    } catch (error) {
      console.error("❌ Error fetching paid invoices:", error);
      throw error;
    }
  },

  // Get unpaid invoices
  async getUnpaidInvoices() {
    try {
      console.log("🧾 Fetching unpaid invoices...");
      return await this.getInvoices({ status: 'unpaid' });
    } catch (error) {
      console.error("❌ Error fetching unpaid invoices:", error);
      throw error;
    }
  }
};