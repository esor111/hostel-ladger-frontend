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
    console.error("Ledger API Request Error:", error);
    throw error;
  }
}

export const ledgerService = {
  // Get all ledger entries with filtering and pagination
  async getLedgerEntries(filters = {}) {
    try {
      console.log("📊 Fetching ledger entries from API...");
      const queryParams = new URLSearchParams();

      // Add filters as query parameters
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
          queryParams.append(key, value);
        }
      });

      const endpoint = `/ledgers${
        queryParams.toString() ? `?${queryParams.toString()}` : ""
      }`;
      const response = await apiRequest(endpoint);
      console.log("✅ Ledger entries API response:", response);

      const entries = response.result?.items || response || [];
      
      // Convert string numbers to actual numbers for frontend compatibility
      return entries.map(entry => ({
        ...entry,
        debit: parseFloat(entry.debit) || 0,
        credit: parseFloat(entry.credit) || 0,
        balance: parseFloat(entry.balance) || 0
      }));
    } catch (error) {
      console.error("❌ Error fetching ledger entries:", error);
      throw error;
    }
  },

  // Get ledger statistics from API
  async getLedgerStats() {
    try {
      console.log("📊 Fetching ledger statistics from API...");
      const response = await fetch(`${API_BASE_URL}/ledgers/stats`);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      console.log("✅ Ledger stats API response:", data);

      const stats = data.stats || data;
      
      // Map NestJS response fields to frontend expected fields
      return {
        ...stats,
        outstandingAmount: Math.max(stats.netBalance || 0, 0), // Only positive balances are outstanding
        advanceAmount: Math.abs(Math.min(stats.netBalance || 0, 0)), // Only negative balances are advances
        studentsWithDebit: stats.activeStudents || 0,
        studentsWithCredit: 0, // We don't have this data from NestJS, so default to 0
        totalDebits: stats.totalDebits || 0,
        totalCredits: stats.totalCredits || 0
      };
    } catch (error) {
      console.error("❌ Error fetching ledger stats:", error);
      throw error;
    }
  },

  // Get ledger entries by student ID
  async getLedgerByStudentId(studentId) {
    try {
      console.log(`📊 Fetching ledger for student ${studentId}...`);
      const response = await fetch(
        `${API_BASE_URL}/ledgers/student/${studentId}`
      );

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      console.log("✅ Student ledger fetched");

      const entries = data.data || [];
      
      // Convert string numbers to actual numbers for frontend compatibility
      return entries.map(entry => ({
        ...entry,
        debit: parseFloat(entry.debit) || 0,
        credit: parseFloat(entry.credit) || 0,
        balance: parseFloat(entry.balance) || 0
      }));
    } catch (error) {
      console.error("❌ Error fetching student ledger:", error);
      throw error;
    }
  },

  // Get student balance summary
  async getStudentBalance(studentId) {
    try {
      console.log(`📊 Fetching balance for student ${studentId}...`);
      const response = await fetch(
        `${API_BASE_URL}/ledgers/balance/${studentId}`
      );

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      console.log("✅ Student balance fetched");

      return data.data || {};
    } catch (error) {
      console.error("❌ Error fetching student balance:", error);
      throw error;
    }
  },

  // Add/Create ledger entry
  async addLedgerEntry(entryData) {
    try {
      console.log("📊 Creating new ledger entry via API...");
      const response = await fetch(`${API_BASE_URL}/ledgers`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(entryData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message || `HTTP ${response.status}: ${response.statusText}`
        );
      }

      const data = await response.json();
      console.log("✅ Ledger entry created successfully");

      return data.data || data;
    } catch (error) {
      console.error("❌ Error creating ledger entry:", error);
      throw error;
    }
  },

  // Update ledger entry
  async updateLedgerEntry(entryId, updateData) {
    try {
      console.log(`📊 Updating ledger entry ${entryId} via API...`);
      const response = await fetch(`${API_BASE_URL}/ledgers/${entryId}`, {
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
      console.log("✅ Ledger entry updated successfully");

      return data.data || data;
    } catch (error) {
      console.error("❌ Error updating ledger entry:", error);
      throw error;
    }
  },

  // Generate ledger entries from invoices and payments
  async generateLedgerEntries(options = {}) {
    try {
      console.log("📊 Generating ledger entries from invoices/payments...");
      const response = await fetch(`${API_BASE_URL}/ledgers/generate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(options),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message || `HTTP ${response.status}: ${response.statusText}`
        );
      }

      const data = await response.json();
      console.log("✅ Ledger entries generated successfully");

      return data.data || data;
    } catch (error) {
      console.error("❌ Error generating ledger entries:", error);
      throw error;
    }
  },

  // Calculate student balance (using API)
  async calculateStudentBalance(studentId) {
    try {
      const balanceData = await this.getStudentBalance(studentId);
      return {
        balance: balanceData.currentBalance,
        balanceType: balanceData.balanceType,
        rawBalance: balanceData.rawBalance,
      };
    } catch (error) {
      console.error("❌ Error calculating student balance:", error);
      throw error;
    }
  },

  // Get ledger summary (dashboard data)
  async getLedgerSummary() {
    try {
      console.log("📊 Fetching ledger dashboard data from API...");
      const response = await fetch(`${API_BASE_URL}/ledgers/stats`);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      console.log("✅ Ledger stats data fetched");

      const stats = data.stats || data;
      
      // Map backend stats to frontend dashboard format
      return {
        // Summary data mapped from backend stats
        totalStudents: stats.activeStudents || 0,
        totalCollected: stats.totalCredits || 0,
        outstandingDues: stats.netBalance || 0,
        thisMonthCollection: stats.totalCredits || 0,
        advanceBalances: 0, // Not available in current stats
        collectionRate: stats.activeStudents > 0 ? ((stats.totalCredits / (stats.totalDebits + stats.totalCredits)) * 100).toFixed(1) : 0,
        
        // Mock detailed data since not available in stats endpoint
        highestDueStudents: [],
        
        recentActivities: Object.entries(stats.entryTypeBreakdown || {}).map(([type, breakdown]) => ({
          student: `${breakdown.count} ${type} entries`,
          type: type,
          amount: breakdown.totalDebits - breakdown.totalCredits,
          timeAgo: new Date().toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
          })
        }))
      };
    } catch (error) {
      console.error("❌ Error fetching ledger dashboard:", error);
      throw error;
    }
  },

  // Search ledger entries
  async searchLedgerEntries(searchTerm, filters = {}) {
    try {
      console.log(`🔍 Searching ledger entries: ${searchTerm}`);
      return await this.getLedgerEntries({ search: searchTerm, ...filters });
    } catch (error) {
      console.error("❌ Error searching ledger entries:", error);
      throw error;
    }
  },

  // Filter ledger entries by type
  async filterLedgerEntriesByType(type) {
    try {
      console.log(`🔍 Filtering ledger entries by type: ${type}`);
      return await this.getLedgerEntries({ type });
    } catch (error) {
      console.error("❌ Error filtering ledger entries by type:", error);
      throw error;
    }
  },

  // Filter ledger entries by date range
  async filterLedgerEntriesByDateRange(dateFrom, dateTo) {
    try {
      console.log(
        `🔍 Filtering ledger entries by date range: ${dateFrom} to ${dateTo}`
      );
      return await this.getLedgerEntries({ dateFrom, dateTo });
    } catch (error) {
      console.error("❌ Error filtering ledger entries by date range:", error);
      throw error;
    }
  },
};
