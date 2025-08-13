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
    console.error("Student API Request Error:", error);
    throw error;
  }
}

export const studentService = {
  // Get all students with filtering and pagination
  async getStudents(filters = {}) {
    try {
      console.log("👥 Fetching students from API...");
      const queryParams = new URLSearchParams();

      // Add filters as query parameters
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
          queryParams.append(key, value);
        }
      });

      const endpoint = `/students${
        queryParams.toString() ? `?${queryParams.toString()}` : ""
      }`;
      const result = await apiRequest(endpoint);
      console.log("✅ Students API response:", result);

      return result;
    } catch (error) {
      console.error("❌ Error fetching students:", error);
      throw error;
    }
  },

  // Get student by ID
  async getStudentById(studentId) {
    try {
      console.log(`👤 Fetching student ${studentId} from API...`);
      const result = await apiRequest(`/students/${studentId}`);
      console.log("✅ Student fetched successfully");
      return result;
    } catch (error) {
      console.error("❌ Error fetching student:", error);
      throw error;
    }
  },

  // Create new student
  async createStudent(studentData) {
    try {
      console.log("👤 Creating new student via API...");
      const result = await apiRequest("/students", {
        method: "POST",
        body: JSON.stringify(studentData),
      });
      console.log("✅ Student created successfully");
      return result;
    } catch (error) {
      console.error("❌ Error creating student:", error);
      throw error;
    }
  },

  // Update student
  async updateStudent(studentId, updateData) {
    try {
      console.log(`👤 Updating student ${studentId} via API...`);
      const result = await apiRequest(`/students/${studentId}`, {
        method: "PUT",
        body: JSON.stringify(updateData),
      });
      console.log("✅ Student updated successfully");
      return result;
    } catch (error) {
      console.error("❌ Error updating student:", error);
      throw error;
    }
  },

  // Delete student
  async deleteStudent(studentId) {
    try {
      console.log(`👤 Deleting student ${studentId} via API...`);
      const result = await apiRequest(`/students/${studentId}`, {
        method: "DELETE",
      });
      console.log("✅ Student deleted successfully");
      return result;
    } catch (error) {
      console.error("❌ Error deleting student:", error);
      throw error;
    }
  },

  // Get student statistics
  async getStudentStats() {
    try {
      console.log("📊 Fetching student statistics from API...");
      const result = await apiRequest("/students/stats");
      console.log("✅ Student stats fetched successfully");
      return result;
    } catch (error) {
      console.error("❌ Error fetching student stats:", error);
      throw error;
    }
  },

  // Get student balance
  async getStudentBalance(studentId) {
    try {
      console.log(`💰 Fetching balance for student ${studentId}...`);
      const result = await apiRequest(`/students/${studentId}/balance`);
      console.log("✅ Student balance fetched successfully");
      return result;
    } catch (error) {
      console.error("❌ Error fetching student balance:", error);
      throw error;
    }
  },

  // Get student ledger entries
  async getStudentLedger(studentId) {
    try {
      console.log(`📋 Fetching ledger for student ${studentId}...`);
      const result = await apiRequest(`/students/${studentId}/ledger`);
      console.log("✅ Student ledger fetched successfully");
      return result;
    } catch (error) {
      console.error("❌ Error fetching student ledger:", error);
      throw error;
    }
  },

  // Get student payments
  async getStudentPayments(studentId) {
    try {
      console.log(`💳 Fetching payments for student ${studentId}...`);
      const result = await apiRequest(`/students/${studentId}/payments`);
      console.log("✅ Student payments fetched successfully");
      return result;
    } catch (error) {
      console.error("❌ Error fetching student payments:", error);
      throw error;
    }
  },

  // Get student invoices
  async getStudentInvoices(studentId) {
    try {
      console.log(`🧾 Fetching invoices for student ${studentId}...`);
      const result = await apiRequest(`/students/${studentId}/invoices`);
      console.log("✅ Student invoices fetched successfully");
      return result;
    } catch (error) {
      console.error("❌ Error fetching student invoices:", error);
      throw error;
    }
  },

  // Process student checkout
  async processCheckout(studentId, checkoutDetails) {
    try {
      console.log(`🚪 Processing checkout for student ${studentId}...`);
      const result = await apiRequest(`/students/${studentId}/checkout`, {
        method: "POST",
        body: JSON.stringify(checkoutDetails),
      });
      console.log("✅ Student checkout processed successfully");
      return result;
    } catch (error) {
      console.error("❌ Error processing student checkout:", error);
      throw error;
    }
  },

  // Advanced search for students
  async searchStudents(searchCriteria) {
    try {
      console.log("🔍 Performing advanced student search...");
      const result = await apiRequest("/students/search", {
        method: "POST",
        body: JSON.stringify(searchCriteria),
      });
      console.log("✅ Student search completed successfully");
      return result;
    } catch (error) {
      console.error("❌ Error searching students:", error);
      throw error;
    }
  },

  // Bulk update students
  async bulkUpdateStudents(bulkUpdateData) {
    try {
      console.log("📝 Performing bulk student update...");
      const result = await apiRequest("/students/bulk", {
        method: "PUT",
        body: JSON.stringify(bulkUpdateData),
      });
      console.log("✅ Bulk student update completed successfully");
      return result;
    } catch (error) {
      console.error("❌ Error performing bulk student update:", error);
      throw error;
    }
  },

  // Get active students only
  async getActiveStudents() {
    try {
      console.log("👥 Fetching active students...");
      const result = await this.getStudents({ status: 'Active' });
      return result;
    } catch (error) {
      console.error("❌ Error fetching active students:", error);
      throw error;
    }
  },

  // Get inactive students only
  async getInactiveStudents() {
    try {
      console.log("👥 Fetching inactive students...");
      const result = await this.getStudents({ status: 'Inactive' });
      return result;
    } catch (error) {
      console.error("❌ Error fetching inactive students:", error);
      throw error;
    }
  },

  // Search students by name
  async searchStudentsByName(name) {
    try {
      console.log(`🔍 Searching students by name: ${name}`);
      const result = await this.getStudents({ search: name });
      return result;
    } catch (error) {
      console.error("❌ Error searching students by name:", error);
      throw error;
    }
  },

  // Get students by room number
  async getStudentsByRoom(roomNumber) {
    try {
      console.log(`🏠 Fetching students in room: ${roomNumber}`);
      const result = await this.getStudents({ roomNumber });
      return result;
    } catch (error) {
      console.error("❌ Error fetching students by room:", error);
      throw error;
    }
  }
};