// Report Service - Generate and manage system reports
import { getEnvironmentConfig } from '../config/environment.ts';

const API_BASE_URL = getEnvironmentConfig().apiBaseUrl;

// Helper function to handle API requests
async function apiRequest(endpoint, options = {}) {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
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
    console.error('Report API Request Error:', error);
    throw error;
  }
}

export const reportService = {
  // Get all reports with filtering and pagination
  async getAllReports(filters = {}) {
    try {
      console.log('📊 Fetching reports from API...');
      const queryParams = new URLSearchParams();
      
      // Add filters as query parameters
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          queryParams.append(key, value);
        }
      });
      
      const endpoint = `/reports${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      const response = await apiRequest(endpoint);
      console.log('✅ Reports API response:', response);
      
      return response.result?.items || response || []; // Handle different response formats
    } catch (error) {
      console.error('❌ Error fetching reports:', error);
      throw error;
    }
  },

  // Get report by ID
  async getReportById(id) {
    try {
      console.log(`📊 Fetching report ${id} from API...`);
      const response = await fetch(`${API_BASE_URL}/reports/${id}`);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log('✅ Report details fetched');
      
      return data.data || data;
    } catch (error) {
      console.error('❌ Error fetching report by ID:', error);
      throw error;
    }
  },

  // Get reports by type
  async getReportsByType(type) {
    try {
      console.log(`📊 Fetching reports by type: ${type}`);
      return await this.getAllReports({ type });
    } catch (error) {
      console.error('❌ Error fetching reports by type:', error);
      throw error;
    }
  },

  // Get reports by user
  async getReportsByUser(userId) {
    try {
      console.log(`📊 Fetching reports by user: ${userId}`);
      return await this.getAllReports({ generatedBy: userId });
    } catch (error) {
      console.error('❌ Error fetching reports by user:', error);
      throw error;
    }
  },

  // Get scheduled reports
  async getScheduledReports() {
    try {
      console.log('📊 Fetching scheduled reports...');
      const reports = await this.getAllReports();
      return reports.filter(r => r.isScheduled);
    } catch (error) {
      console.error('❌ Error fetching scheduled reports:', error);
      throw error;
    }
  },

  // Generate new report
  async generateReport(reportData) {
    try {
      console.log('📊 Generating new report via API...');
      const response = await fetch(`${API_BASE_URL}/reports/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(reportData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('✅ Report generated successfully');
      
      return data.data || data;
    } catch (error) {
      console.error('❌ Error generating report:', error);
      throw error;
    }
  },

  async generateFinancialReport(parameters) {
    const reportData = {
      name: `Financial Report - ${parameters.month}`,
      type: 'financial',
      description: 'Monthly financial summary including revenue, expenses, and outstanding dues',
      generatedBy: parameters.generatedBy || 'system',
      parameters,
      data: {
        // This would be calculated from actual data
        totalRevenue: 450000,
        totalExpenses: 125000,
        netIncome: 325000,
        outstandingDues: 85000,
        collectionRate: 84.2
      },
      format: parameters.format || 'pdf'
    };
    
    return this.generateReport(reportData);
  },

  async generateOccupancyReport(parameters) {
    const reportData = {
      name: `Occupancy Report - ${parameters.month}`,
      type: 'occupancy',
      description: 'Room occupancy statistics and utilization analysis',
      generatedBy: parameters.generatedBy || 'system',
      parameters,
      data: {
        totalRooms: 180,
        occupiedRooms: 157,
        availableRooms: 23,
        occupancyRate: 87.2,
        averageStayDuration: 8.5
      },
      format: parameters.format || 'excel'
    };
    
    return this.generateReport(reportData);
  },

  async generateStudentReport(parameters) {
    const reportData = {
      name: `Student Report - ${parameters.type}`,
      type: 'student',
      description: 'Student demographics and statistics analysis',
      generatedBy: parameters.generatedBy || 'system',
      parameters,
      data: {
        totalStudents: 156,
        activeStudents: 142,
        averageAge: 21.5,
        maleStudents: 89,
        femaleStudents: 67
      },
      format: parameters.format || 'excel'
    };
    
    return this.generateReport(reportData);
  },

  // UPDATE Operations
  async updateReport(id, updateData) {
    return new Promise((resolve, reject) => {
      const index = reports.findIndex(r => r.id === id);
      if (index === -1) {
        setTimeout(() => reject(new Error('Report not found')), 100);
        return;
      }

      reports[index] = { ...reports[index], ...updateData };
      setTimeout(() => resolve(reports[index]), 100);
    });
  },

  async updateReportSchedule(id, scheduleConfig) {
    return new Promise((resolve, reject) => {
      const index = reports.findIndex(r => r.id === id);
      if (index === -1) {
        setTimeout(() => reject(new Error('Report not found')), 100);
        return;
      }

      reports[index].scheduleConfig = scheduleConfig;
      reports[index].isScheduled = true;
      
      setTimeout(() => resolve(reports[index]), 100);
    });
  },

  // Delete report via API
  async deleteReport(id) {
    try {
      console.log(`📊 Deleting report ${id} via API...`);
      const response = await fetch(`${API_BASE_URL}/reports/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('✅ Report deleted successfully');
      
      return data.data || data;
    } catch (error) {
      console.error('❌ Error deleting report:', error);
      throw error;
    }
  },

  // SEARCH Operations
  async searchReports(criteria) {
    return new Promise((resolve) => {
      const searchTerm = criteria.toLowerCase();
      const filteredReports = reports.filter(report => 
        report.name.toLowerCase().includes(searchTerm) ||
        report.description.toLowerCase().includes(searchTerm) ||
        report.type.toLowerCase().includes(searchTerm)
      );
      setTimeout(() => resolve(filteredReports), 100);
    });
  },

  async filterReports(filters) {
    return new Promise((resolve) => {
      let filteredReports = [...reports];
      
      if (filters.type) {
        filteredReports = filteredReports.filter(r => r.type === filters.type);
      }
      
      if (filters.generatedBy) {
        filteredReports = filteredReports.filter(r => r.generatedBy === filters.generatedBy);
      }
      
      if (filters.isScheduled !== undefined) {
        filteredReports = filteredReports.filter(r => r.isScheduled === filters.isScheduled);
      }
      
      if (filters.format) {
        filteredReports = filteredReports.filter(r => r.format === filters.format);
      }
      
      if (filters.dateRange) {
        const startDate = new Date(filters.dateRange.start);
        const endDate = new Date(filters.dateRange.end);
        filteredReports = filteredReports.filter(r => {
          const reportDate = new Date(r.generatedAt);
          return reportDate >= startDate && reportDate <= endDate;
        });
      }
      
      setTimeout(() => resolve(filteredReports), 100);
    });
  },

  // Get report statistics from API
  async getReportStats() {
    try {
      console.log('📊 Fetching report statistics from API...');
      const response = await fetch(`${API_BASE_URL}/reports/stats`);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log('✅ Report stats API response:', data);
      
      return data.stats || data;
    } catch (error) {
      console.error('❌ Error fetching report stats:', error);
      throw error;
    }
  },

  async getReportSummary() {
    return new Promise((resolve) => {
      const summary = {
        totalReports: reports.length,
        financialReports: reports.filter(r => r.type === 'financial').length,
        occupancyReports: reports.filter(r => r.type === 'occupancy').length,
        studentReports: reports.filter(r => r.type === 'student').length,
        maintenanceReports: reports.filter(r => r.type === 'maintenance').length,
        systemReports: reports.filter(r => r.type === 'system').length,
        scheduledReports: reports.filter(r => r.isScheduled).length,
        recentReports: reports.filter(r => {
          const reportDate = new Date(r.generatedAt);
          const monthAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
          return reportDate > monthAgo;
        }).length
      };
      
      setTimeout(() => resolve(summary), 100);
    });
  },

  // Get report download information via API
  async downloadReport(id) {
    try {
      console.log(`📊 Getting download info for report ${id}...`);
      const response = await fetch(`${API_BASE_URL}/reports/download/${id}`);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log('✅ Download info retrieved');
      
      return data.data || data;
    } catch (error) {
      console.error('❌ Error getting download info:', error);
      throw error;
    }
  },

  // Schedule report via API
  async scheduleReport(reportConfig) {
    try {
      console.log('📊 Scheduling report via API...');
      const response = await fetch(`${API_BASE_URL}/reports/schedule`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(reportConfig),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('✅ Report scheduled successfully');
      
      return data.data || data;
    } catch (error) {
      console.error('❌ Error scheduling report:', error);
      throw error;
    }
  },

  // Get available report types from API
  async getReportTypes() {
    try {
      console.log('📊 Fetching report types from API...');
      const response = await fetch(`${API_BASE_URL}/reports/types`);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log('✅ Report types fetched');
      
      return data.data || data;
    } catch (error) {
      console.error('❌ Error fetching report types:', error);
      throw error;
    }
  },

  // Search reports
  async searchReports(searchTerm, filters = {}) {
    try {
      console.log(`🔍 Searching reports: ${searchTerm}`);
      return await this.getAllReports({ search: searchTerm, ...filters });
    } catch (error) {
      console.error('❌ Error searching reports:', error);
      throw error;
    }
  },

  // Filter reports by various criteria
  async filterReports(filters) {
    try {
      console.log('🔍 Filtering reports:', filters);
      return await this.getAllReports(filters);
    } catch (error) {
      console.error('❌ Error filtering reports:', error);
      throw error;
    }
  }
};