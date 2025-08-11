
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
    console.error('Invoice API Request Error:', error);
    throw error;
  }
}

export const invoiceService = {
  // Get all invoices with filtering and pagination
  async getInvoices(filters = {}) {
    try {
      console.log('📄 Fetching invoices from API...');
      const queryParams = new URLSearchParams();
      
      // Add filters as query parameters
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          queryParams.append(key, value);
        }
      });
      
      const endpoint = `/invoices${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      const response = await apiRequest(endpoint);
      console.log('✅ Invoices API response:', response);
      
      const invoices = response.result?.items || response || [];
      
      // Convert string numbers to actual numbers for frontend compatibility
      return invoices.map(invoice => ({
        ...invoice,
        total: parseFloat(invoice.total) || 0,
        subtotal: parseFloat(invoice.subtotal) || 0,
        discountTotal: parseFloat(invoice.discountTotal) || 0,
        paymentTotal: parseFloat(invoice.paymentTotal) || 0,
        balanceDue: parseFloat(invoice.balanceDue) || 0,
        items: invoice.items?.map(item => ({
          ...item,
          amount: parseFloat(item.amount) || 0
        })) || [],
        payments: invoice.payments?.map(payment => ({
          ...payment,
          amount: parseFloat(payment.amount) || 0
        })) || []
      }));
    } catch (error) {
      console.error('❌ Error fetching invoices:', error);
      throw error;
    }
  },

  // Get invoice statistics from API
  async getInvoiceStats() {
    try {
      console.log('📊 Fetching invoice statistics from API...');
      const response = await fetch(`${API_BASE_URL}/invoices/stats`);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log('✅ Invoice stats API response:', data);
      
      const stats = data.stats || data;
      
      // Map NestJS response fields to frontend expected fields
      return {
        ...stats,
        paidAmount: stats.totalPaid || 0,
        outstandingAmount: stats.totalOutstanding || 0,
        totalAmount: stats.totalAmount || 0
      };
    } catch (error) {
      console.error('❌ Error fetching invoice stats:', error);
      throw error;
    }
  },

  // Get invoice by ID
  async getInvoiceById(id) {
    try {
      console.log(`📄 Fetching invoice ${id} from API...`);
      const response = await fetch(`${API_BASE_URL}/invoices/${id}`);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log('✅ Invoice details fetched');
      
      const invoice = data.data || data;
      
      // Convert string numbers to actual numbers for frontend compatibility
      return {
        ...invoice,
        total: parseFloat(invoice.total) || 0,
        subtotal: parseFloat(invoice.subtotal) || 0,
        discountTotal: parseFloat(invoice.discountTotal) || 0,
        paymentTotal: parseFloat(invoice.paymentTotal) || 0,
        balanceDue: parseFloat(invoice.balanceDue) || 0,
        items: invoice.items?.map(item => ({
          ...item,
          amount: parseFloat(item.amount) || 0
        })) || [],
        payments: invoice.payments?.map(payment => ({
          ...payment,
          amount: parseFloat(payment.amount) || 0
        })) || []
      };
    } catch (error) {
      console.error('❌ Error fetching invoice by ID:', error);
      throw error;
    }
  },

  // Get invoices by student ID
  async getInvoicesByStudentId(studentId) {
    try {
      console.log(`📄 Fetching invoices for student ${studentId}...`);
      return await this.getInvoices({ studentId });
    } catch (error) {
      console.error('❌ Error fetching invoices by student ID:', error);
      throw error;
    }
  },

  // Create new invoice
  async createInvoice(invoiceData) {
    try {
      console.log('📝 Creating new invoice via API...');
      const response = await fetch(`${API_BASE_URL}/invoices`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(invoiceData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('✅ Invoice created successfully');
      
      return data.data || data;
    } catch (error) {
      console.error('❌ Error creating invoice:', error);
      throw error;
    }
  },

  // Update invoice
  async updateInvoice(id, updates) {
    try {
      console.log(`📝 Updating invoice ${id} via API...`);
      const response = await fetch(`${API_BASE_URL}/invoices/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('✅ Invoice updated successfully');
      
      return data.data || data;
    } catch (error) {
      console.error('❌ Error updating invoice:', error);
      throw error;
    }
  },

  // Generate monthly invoices for all active students
  async generateMonthlyInvoices(month, studentIds = null) {
    try {
      console.log(`📅 Generating monthly invoices for ${month}...`);
      const response = await fetch(`${API_BASE_URL}/invoices/generate-monthly`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ month, studentIds }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('✅ Monthly invoices generated successfully');
      
      return data.data || data;
    } catch (error) {
      console.error('❌ Error generating monthly invoices:', error);
      throw error;
    }
  },

  // Send invoice to student
  async sendInvoice(invoiceId, method = 'email') {
    try {
      console.log(`📧 Sending invoice ${invoiceId} via ${method}...`);
      const response = await fetch(`${API_BASE_URL}/invoices/${invoiceId}/send`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ method }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('✅ Invoice sent successfully');
      
      return data.data || data;
    } catch (error) {
      console.error('❌ Error sending invoice:', error);
      throw error;
    }
  },

  // Filter invoices by status
  async filterInvoicesByStatus(status) {
    try {
      console.log(`🔍 Filtering invoices by status: ${status}`);
      return await this.getInvoices({ status });
    } catch (error) {
      console.error('❌ Error filtering invoices by status:', error);
      throw error;
    }
  },

  // Search invoices
  async searchInvoices(searchTerm, filters = {}) {
    try {
      console.log(`🔍 Searching invoices: ${searchTerm}`);
      return await this.getInvoices({ search: searchTerm, ...filters });
    } catch (error) {
      console.error('❌ Error searching invoices:', error);
      throw error;
    }
  }
};
