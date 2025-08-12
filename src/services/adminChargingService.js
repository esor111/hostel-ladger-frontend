// Admin Charging Service - Flexible admin-controlled charges
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
    // Handle NestJS API response format
    if (data.success && data.data !== undefined) return data.data;
    else if (data.data !== undefined) return data.data;
    else return data;
  } catch (error) {
    console.error("Admin Charging API Request Error:", error);
    throw error;
  }
}

export const adminChargingService = {
  // Predefined charge types and categories
  chargeTypes: [
    { value: 'one-time', label: 'One-time Charge' },
    { value: 'monthly', label: 'Monthly Charge' },
    { value: 'daily', label: 'Daily Charge' }
  ],

  chargeCategories: [
    { value: 'Penalty', label: 'Penalty' },
    { value: 'Maintenance', label: 'Maintenance' },
    { value: 'Service', label: 'Service' },
    { value: 'Guest', label: 'Guest' },
    { value: 'Miscellaneous', label: 'Miscellaneous' },
    { value: 'Late Fee', label: 'Late Fee' },
    { value: 'Damage', label: 'Damage' },
    { value: 'Administrative', label: 'Administrative' }
  ],

  // Get all admin charges with optional filters
  async getAllCharges(filters = {}) {
    try {
      console.log('📋 Fetching admin charges from API...');
      const queryParams = new URLSearchParams();
      
      if (filters.studentId) queryParams.append('studentId', filters.studentId);
      if (filters.status) queryParams.append('status', filters.status);
      if (filters.chargeType) queryParams.append('chargeType', filters.chargeType);
      if (filters.category) queryParams.append('category', filters.category);
      if (filters.page) queryParams.append('page', filters.page);
      if (filters.limit) queryParams.append('limit', filters.limit);

      const endpoint = `/admin-charges${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
      const result = await apiRequest(endpoint);
      
      console.log(`✅ Fetched ${result.length || 0} admin charges`);
      return result;
    } catch (error) {
      console.error('❌ Error fetching admin charges:', error);
      throw error;
    }
  },

  // Get admin charges statistics
  async getChargeStats() {
    try {
      console.log('📊 Fetching admin charge statistics...');
      const stats = await apiRequest('/admin-charges/stats');
      console.log('✅ Admin charge statistics fetched');
      return stats;
    } catch (error) {
      console.error('❌ Error fetching charge statistics:', error);
      return {
        totalCharges: 0,
        pendingCharges: 0,
        appliedCharges: 0,
        cancelledCharges: 0,
        totalPendingAmount: 0,
        totalAppliedAmount: 0
      };
    }
  },

  // Create a new admin charge
  async createCharge(chargeData) {
    try {
      console.log('💰 Creating admin charge via API...');
      
      const requestData = {
        studentId: chargeData.studentId,
        title: chargeData.title,
        description: chargeData.description || '',
        amount: parseFloat(chargeData.amount),
        chargeType: chargeData.chargeType || 'one-time',
        dueDate: chargeData.dueDate || null,
        category: chargeData.category || 'Miscellaneous',
        isRecurring: chargeData.isRecurring || false,
        recurringMonths: chargeData.recurringMonths || null,
        adminNotes: chargeData.adminNotes || '',
        createdBy: chargeData.createdBy || 'Admin'
      };

      const result = await apiRequest('/admin-charges', {
        method: 'POST',
        body: JSON.stringify(requestData)
      });

      console.log(`✅ Admin charge created: ${chargeData.title} - $${chargeData.amount}`);
      return result;

    } catch (error) {
      console.error('❌ Error creating admin charge:', error);
      throw error;
    }
  },

  // Update an existing admin charge
  async updateCharge(chargeId, updateData) {
    try {
      console.log(`🔄 Updating admin charge ${chargeId}...`);
      
      const result = await apiRequest(`/admin-charges/${chargeId}`, {
        method: 'PATCH',
        body: JSON.stringify(updateData)
      });

      console.log(`✅ Admin charge ${chargeId} updated successfully`);
      return result;

    } catch (error) {
      console.error('❌ Error updating admin charge:', error);
      throw error;
    }
  },

  // Get a specific admin charge
  async getCharge(chargeId) {
    try {
      console.log(`� Fdetching admin charge ${chargeId}...`);
      const charge = await apiRequest(`/admin-charges/${chargeId}`);
      console.log(`✅ Admin charge ${chargeId} fetched`);
      return charge;
    } catch (error) {
      console.error('❌ Error fetching admin charge:', error);
      throw error;
    }
  },

  // Get charges for a specific student
  async getStudentCharges(studentId) {
    try {
      console.log(`📋 Fetching charges for student ${studentId}...`);
      const charges = await apiRequest(`/admin-charges/student/${studentId}`);
      console.log(`✅ Found ${charges.length || 0} charges for student`);
      return charges;
    } catch (error) {
      console.error('❌ Error fetching student charges:', error);
      return [];
    }
  },

  // Apply a pending charge (creates ledger entry)
  async applyCharge(chargeId) {
    try {
      console.log(`⚡ Applying admin charge ${chargeId}...`);
      const result = await apiRequest(`/admin-charges/${chargeId}/apply`, {
        method: 'POST'
      });
      console.log(`✅ Admin charge ${chargeId} applied successfully`);
      return result;
    } catch (error) {
      console.error('❌ Error applying admin charge:', error);
      throw error;
    }
  },

  // Cancel a pending charge
  async cancelCharge(chargeId) {
    try {
      console.log(`❌ Cancelling admin charge ${chargeId}...`);
      const result = await apiRequest(`/admin-charges/${chargeId}/cancel`, {
        method: 'POST'
      });
      console.log(`✅ Admin charge ${chargeId} cancelled successfully`);
      return result;
    } catch (error) {
      console.error('❌ Error cancelling admin charge:', error);
      throw error;
    }
  },

  // Delete an admin charge
  async deleteCharge(chargeId) {
    try {
      console.log(`�️ eDeleting admin charge ${chargeId}...`);
      const result = await apiRequest(`/admin-charges/${chargeId}`, {
        method: 'DELETE'
      });
      console.log(`✅ Admin charge ${chargeId} deleted successfully`);
      return result;
    } catch (error) {
      console.error('❌ Error deleting admin charge:', error);
      throw error;
    }
  },

  // Bulk create charges for multiple students
  async createBulkCharges(studentIds, chargeData) {
    try {
      console.log('� Creating  bulk admin charges...');
      const results = [];
      
      for (const studentId of studentIds) {
        try {
          const result = await this.createCharge({
            ...chargeData,
            studentId: studentId
          });
          results.push({ studentId, success: true, charge: result });
        } catch (error) {
          results.push({ studentId, success: false, error: error.message });
        }
      }
      
      const successful = results.filter(r => r.success);
      const failed = results.filter(r => !r.success);
      
      console.log(`✅ Bulk charges created: ${successful.length} successful, ${failed.length} failed`);
      return { successful, failed, results };
    } catch (error) {
      console.error('❌ Error creating bulk charges:', error);
      throw error;
    }
  },

  // Get formatted charge status
  getChargeStatusLabel(status) {
    const statusLabels = {
      'pending': 'Pending',
      'applied': 'Applied',
      'cancelled': 'Cancelled'
    };
    return statusLabels[status] || status;
  },

  // Get formatted charge type
  getChargeTypeLabel(chargeType) {
    const typeLabels = {
      'one-time': 'One-time',
      'monthly': 'Monthly',
      'daily': 'Daily'
    };
    return typeLabels[chargeType] || chargeType;
  },

  // Format amount for display
  formatAmount(amount) {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(amount);
  }
};