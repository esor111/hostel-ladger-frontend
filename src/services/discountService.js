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
    console.error("Discount API Request Error:", error);
    throw error;
  }
}

export const discountService = {
  // Get all discounts with filtering
  async getDiscounts(filters = {}) {
    try {
      console.log("🏷️ Fetching discounts from API...");
      const queryParams = new URLSearchParams();

      // Add filters as query parameters
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
          queryParams.append(key, value);
        }
      });

      const endpoint = `/discounts${
        queryParams.toString() ? `?${queryParams.toString()}` : ""
      }`;
      const response = await apiRequest(endpoint);
      console.log("✅ Discounts API response:", response);

      return response.result?.items || response || []; // Handle different response formats
    } catch (error) {
      console.error("❌ Error fetching discounts:", error);
      throw error;
    }
  },

  // Get discount history (alias for getDiscounts)
  async getDiscountHistory() {
    try {
      console.log("🏷️ Fetching discount history from API...");
      return await this.getDiscounts();
    } catch (error) {
      console.error("❌ Error fetching discount history:", error);
      throw error;
    }
  },

  // Get discount by ID
  async getDiscountById(id) {
    try {
      console.log(`🏷️ Fetching discount ${id} from API...`);
      const response = await fetch(`${API_BASE_URL}/discounts/${id}`);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      console.log("✅ Discount details fetched");

      return data.data || data;
    } catch (error) {
      console.error("❌ Error fetching discount by ID:", error);
      throw error;
    }
  },

  // Apply discount directly to ledger
  async applyDiscount(discountData) {
    try {
      console.log("🏷️ Applying new discount via API...");
      const response = await fetch(`${API_BASE_URL}/discounts`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(discountData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message || `HTTP ${response.status}: ${response.statusText}`
        );
      }

      const data = await response.json();
      console.log("✅ Discount applied successfully");

      return data.data || data;
    } catch (error) {
      console.error("❌ Error applying discount:", error);
      throw error;
    }
  },

  // Update discount
  async updateDiscount(id, updateData) {
    try {
      console.log(`🏷️ Updating discount ${id} via API...`);
      const response = await fetch(`${API_BASE_URL}/discounts/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updateData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message || `HTTP ${response.status}: ${response.statusText}`
        );
      }

      const data = await response.json();
      console.log("✅ Discount updated successfully");

      return data.data || data;
    } catch (error) {
      console.error("❌ Error updating discount:", error);
      throw error;
    }
  },

  // Expire discount
  async expireDiscount(id, expiredBy = 'Admin', reason = 'Expired by admin') {
    try {
      console.log(`🏷️ Expiring discount ${id} via API...`);
      const response = await fetch(`${API_BASE_URL}/discounts/${id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          expiredBy: expiredBy,
          reason: reason
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message || `HTTP ${response.status}: ${response.statusText}`
        );
      }

      const data = await response.json();
      console.log("✅ Discount expired successfully");

      return data.data || data;
    } catch (error) {
      console.error("❌ Error expiring discount:", error);
      throw error;
    }
  },

  // Delete discount (alias for expire)
  async deleteDiscount(id) {
    return this.expireDiscount(id, 'Admin', 'Deleted by admin');
  },

  // Get discount statistics from API
  async getDiscountStats() {
    try {
      console.log("📊 Fetching discount statistics from API...");
      const response = await fetch(`${API_BASE_URL}/discounts/stats`);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      console.log("✅ Discount stats API response:", data);

      return data.stats || data;
    } catch (error) {
      console.error("❌ Error fetching discount stats:", error);
      throw error;
    }
  },

  // Get discounts by student ID
  async getDiscountsByStudentId(studentId) {
    try {
      console.log(`🏷️ Fetching discounts for student ${studentId}...`);
      const response = await fetch(
        `${API_BASE_URL}/discounts/student/${studentId}`
      );

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      console.log("✅ Student discounts fetched");

      return data.data || [];
    } catch (error) {
      console.error("❌ Error fetching discounts by student ID:", error);
      throw error;
    }
  },

  // Search discounts
  async searchDiscounts(searchTerm, filters = {}) {
    try {
      console.log(`🔍 Searching discounts: ${searchTerm}`);
      return await this.getDiscounts({ search: searchTerm, ...filters });
    } catch (error) {
      console.error("❌ Error searching discounts:", error);
      throw error;
    }
  },

  // Filter discounts by status
  async filterDiscountsByStatus(status) {
    try {
      console.log(`🔍 Filtering discounts by status: ${status}`);
      return await this.getDiscounts({ status });
    } catch (error) {
      console.error("❌ Error filtering discounts by status:", error);
      throw error;
    }
  },

  // Filter discounts by date range
  async filterDiscountsByDateRange(dateFrom, dateTo) {
    try {
      console.log(
        `🔍 Filtering discounts by date range: ${dateFrom} to ${dateTo}`
      );
      return await this.getDiscounts({ dateFrom, dateTo });
    } catch (error) {
      console.error("❌ Error filtering discounts by date range:", error);
      throw error;
    }
  },
};