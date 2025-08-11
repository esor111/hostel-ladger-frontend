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
    // Handle different response formats
    if (data.data !== undefined) return data.data;
    else if (data.result !== undefined) return data.result;
    else if (data.stats !== undefined) return data.stats;
    else return data;
  } catch (error) {
    console.error("Admin Charging API Request Error:", error);
    throw error;
  }
}

export const adminChargingService = {
  // Charge types will be loaded from API
  chargeTypes: [],

  // Load charge types from API
  async loadChargeTypes() {
    try {
      console.log('📋 Loading charge types from API...');
      const chargeTypes = await apiRequest('/admin/charge-types');
      
      // Transform to frontend format
      this.chargeTypes = chargeTypes.map(ct => ({
        value: ct.code,
        label: ct.label,
        description: ct.description,
        category: ct.category,
        defaultAmount: ct.defaultAmount,
        maxAmount: ct.maxAmount,
        requiresApproval: ct.requiresApproval
      }));
      
      console.log(`✅ Loaded ${this.chargeTypes.length} charge types`);
      return this.chargeTypes;
    } catch (error) {
      console.error('❌ Error loading charge types:', error);
      // Fallback to static types if API fails
      this.chargeTypes = [
        { value: 'late_fee_overdue', label: 'Late Fee - Payment Overdue' },
        { value: 'late_fee_partial', label: 'Late Fee - Partial Payment' },
        { value: 'penalty_rule', label: 'Penalty - Rule Violation' },
        { value: 'penalty_noise', label: 'Penalty - Noise Complaint' },
        { value: 'penalty_damage', label: 'Penalty - Damage Charge' },
        { value: 'admin_fee', label: 'Administrative Fee' },
        { value: 'processing_fee', label: 'Processing Fee' },
        { value: 'service_charge', label: 'Service Charge' },
        { value: 'custom', label: 'Custom - Enter Manually' }
      ];
      return this.chargeTypes;
    }
  },

  // Add charge to student ledger
  async addChargeToStudent(studentId, chargeData, adminId = 'Admin') {
    try {
      console.log('💰 Adding charge to student via API...');
      
      // Find charge type ID if not custom
      let chargeTypeId = null;
      if (chargeData.type !== 'custom') {
        const chargeType = this.chargeTypes.find(ct => ct.value === chargeData.type);
        if (chargeType) {
          // We need to get the actual ID from the API
          const allChargeTypes = await apiRequest('/admin/charge-types');
          const apiChargeType = allChargeTypes.find(ct => ct.code === chargeData.type);
          chargeTypeId = apiChargeType?.id;
        }
      }

      // Get charge description
      let description = chargeData.description;
      if (chargeData.type !== 'custom') {
        const chargeType = this.chargeTypes.find(ct => ct.value === chargeData.type);
        description = chargeType ? chargeType.label : chargeData.description;
      }

      // Prepare API request data
      const requestData = {
        studentId: studentId,
        chargeTypeId: chargeTypeId,
        amount: parseFloat(chargeData.amount),
        description: description,
        customDescription: chargeData.type === 'custom' ? chargeData.description : null,
        adminNotes: chargeData.notes || '',
        appliedBy: adminId,
        sendNotification: chargeData.sendNotification !== false
      };

      const result = await apiRequest('/admin/charges', {
        method: 'POST',
        body: JSON.stringify(requestData)
      });

      console.log(`✅ Charge added: NPR ${chargeData.amount} (${description}) to student ${studentId}`);
      
      return {
        success: true,
        charge: result,
        student: { name: result.studentName },
        chargeAmount: parseFloat(chargeData.amount),
        description: description
      };

    } catch (error) {
      console.error('❌ Error adding charge to student:', error);
      return {
        success: false,
        error: error.message
      };
    }
  },

  // Add charges to multiple students (bulk operation)
  async addBulkCharges(studentIds, chargeData, adminId = 'Admin') {
    try {
      console.log('💰 Adding bulk charges via API...');
      
      // Find charge type ID if not custom
      let chargeTypeId = null;
      if (chargeData.type !== 'custom') {
        const chargeType = this.chargeTypes.find(ct => ct.value === chargeData.type);
        if (chargeType) {
          const allChargeTypes = await apiRequest('/admin/charge-types');
          const apiChargeType = allChargeTypes.find(ct => ct.code === chargeData.type);
          chargeTypeId = apiChargeType?.id;
        }
      }

      // Get charge description
      let description = chargeData.description;
      if (chargeData.type !== 'custom') {
        const chargeType = this.chargeTypes.find(ct => ct.value === chargeData.type);
        description = chargeType ? chargeType.label : chargeData.description;
      }

      // Prepare API request data
      const requestData = {
        studentIds: studentIds,
        chargeTypeId: chargeTypeId,
        amount: parseFloat(chargeData.amount),
        description: description,
        customDescription: chargeData.type === 'custom' ? chargeData.description : null,
        adminNotes: chargeData.notes || '',
        appliedBy: adminId,
        sendNotification: chargeData.sendNotification !== false
      };

      const result = await apiRequest('/admin/charges/bulk', {
        method: 'POST',
        body: JSON.stringify(requestData)
      });

      console.log(`✅ Bulk charges applied: ${result.successful.length} successful, ${result.failed.length} failed`);
      
      return result;

    } catch (error) {
      console.error('❌ Error in bulk charging:', error);
      throw error;
    }
  },



  // Get students with overdue payments
  async getOverdueStudents() {
    try {
      console.log('📋 Fetching overdue students from API...');
      const overdueStudents = await apiRequest('/admin/charges/overdue-students');
      
      console.log(`✅ Found ${overdueStudents.length} overdue students`);
      return overdueStudents;

    } catch (error) {
      console.error('❌ Error getting overdue students:', error);
      return [];
    }
  },

  // Get charge history for a student
  async getStudentChargeHistory(studentId) {
    try {
      console.log(`📋 Fetching charge history for student ${studentId}...`);
      const history = await apiRequest(`/admin/charges/history/${studentId}`);
      
      console.log(`✅ Found ${history.items?.length || 0} charge records`);
      return history.items || [];

    } catch (error) {
      console.error('❌ Error getting charge history:', error);
      return [];
    }
  },

  // Remove/reverse a charge
  async reverseCharge(chargeId, reason, adminId = 'Admin') {
    try {
      console.log(`🔄 Reversing charge ${chargeId}...`);
      
      const requestData = {
        reversedBy: adminId,
        reversalReason: reason
      };

      const result = await apiRequest(`/admin/charges/${chargeId}`, {
        method: 'DELETE',
        body: JSON.stringify(requestData)
      });

      console.log(`✅ Charge ${chargeId} reversed successfully`);
      return result;

    } catch (error) {
      console.error('❌ Error reversing charge:', error);
      return {
        success: false,
        error: error.message
      };
    }
  },

  // Get today's charge summary
  async getTodayChargeSummary() {
    try {
      console.log('📊 Fetching today\'s charge summary from API...');
      const summary = await apiRequest('/admin/charges/summary/today');
      
      console.log('✅ Today\'s charge summary fetched');
      return summary;

    } catch (error) {
      console.error('❌ Error getting charge summary:', error);
      return {
        totalCharges: 0,
        totalAmount: 0,
        studentsCharged: 0,
        averageCharge: 0,
        activeCharges: 0,
        reversedCharges: 0
      };
    }
  }
};