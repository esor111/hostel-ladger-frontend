import { studentService } from "./studentService.js";
import { ledgerService } from "./ledgerService.js";
import { billingService } from "./billingService.js";
import { notificationService } from "./notificationService.js";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/hostel/api/v1';

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
    console.error("API Request Error:", error);
    throw error;
  }
}

export const bookingService = {
  // Get all booking requests with filtering and pagination
  async getBookingRequests(filters = {}) {
    try {
      console.log('📝 Fetching booking requests from API...');
      const queryParams = new URLSearchParams();
      
      // Add filters as query parameters
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          queryParams.append(key, value);
        }
      });
      
      const endpoint = `/booking-requests${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      const response = await fetch(`${API_BASE_URL}${endpoint}`);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log('✅ Booking requests API response:', data);
      
      // Handle different response formats - ensure we return an array
      if (data.data && data.data.items) {
        return data.data.items; // Paginated response
      } else if (data.data && Array.isArray(data.data)) {
        return data.data; // Direct array response
      } else if (Array.isArray(data)) {
        return data; // Direct array
      } else {
        return []; // Fallback to empty array
      }
    } catch (error) {
      console.error('❌ Error fetching booking requests:', error);
      throw error;
    }
  },

  // Get booking request by ID
  async getBookingRequestById(id) {
    try {
      return await apiRequest(`/booking-requests/${id}`);
    } catch (error) {
      console.error("Error fetching booking request by ID:", error);
      throw error;
    }
  },

  // Create new booking request
  async createBookingRequest(requestData) {
    try {
      return await apiRequest("/booking-requests", {
        method: "POST",
        body: JSON.stringify(requestData),
      });
    } catch (error) {
      console.error("Error creating booking request:", error);
      throw error;
    }
  },

  // Approve booking and trigger student profile creation
  async approveBookingRequest(bookingId, roomAssignment) {
    try {
      // Call the API to approve the booking
      const result = await apiRequest(
        `/booking-requests/${bookingId}/approve`,
        {
          method: "POST",
          body: JSON.stringify({ roomAssignment }),
        }
      );

      // The API returns { booking, student } - we'll use the booking data
      // and create our own student profile using existing services
      const request = await this.getBookingRequestById(bookingId);

      // Create student profile using existing services
      const studentData = {
        name: request.name,
        phone: request.phone,
        email: request.email,
        roomNumber: roomAssignment,
        guardianName: request.guardianName,
        guardianPhone: request.guardianPhone,
        address: request.address,
        emergencyContact: request.emergencyContact,
        idProofType: request.idProofType,
        idProofNumber: request.idProofNumber,
        course: request.course,
        institution: request.institution,
        baseMonthlyFee: this.calculateBaseFee(request.preferredRoom),
        laundryFee: 500,
        foodFee: 0,
        bookingRequestId: bookingId,
      };

      // Create student profile
      const newStudent = await studentService.createStudent(studentData);

      // Create initial ledger entry for enrollment
      await ledgerService.addLedgerEntry({
        studentId: newStudent.id,
        type: "Enrollment",
        description: "Student enrollment - Welcome to hostel",
        debit: 0,
        credit: 0,
        referenceId: bookingId,
      });

      // Generate prorated initial invoice using billing service
      const initialInvoice = await billingService.generateInitialInvoice(
        newStudent
      );

      // Update student balance with initial invoice amount
      await studentService.updateStudent(newStudent.id, {
        currentBalance: initialInvoice.total,
      });

      // Send welcome notification via Kaha App
      await notificationService.notifyWelcome(
        newStudent.id,
        newStudent.name,
        roomAssignment
      );

      console.log(`✅ Student approved and enrolled: ${newStudent.name}`);
      console.log(
        `📋 Initial invoice generated: ₨${initialInvoice.total.toLocaleString()} ${
          initialInvoice.isProrated ? "(Prorated)" : "(Full Month)"
        }`
      );
      console.log(`🏠 Room assigned: ${roomAssignment}`);
      console.log(
        `⚙️ Next step: Configure detailed charges for ${newStudent.name}`
      );

      return {
        booking: result.booking,
        student: newStudent,
      };
    } catch (error) {
      console.error("Error in approval workflow:", error);
      throw error;
    }
  },

  // Reject booking request
  async rejectBookingRequest(bookingId, reason = "") {
    try {
      return await apiRequest(`/booking-requests/${bookingId}/reject`, {
        method: "POST",
        body: JSON.stringify({ reason }),
      });
    } catch (error) {
      console.error("Error rejecting booking request:", error);
      throw error;
    }
  },

  // Update booking status (generic method - kept for compatibility)
  async updateBookingStatus(id, status, notes = "") {
    try {
      if (status.toLowerCase() === "rejected") {
        return await this.rejectBookingRequest(id, notes);
      }
      // For other status updates, we'd need to implement specific API endpoints
      // For now, just return the current booking data
      return await this.getBookingRequestById(id);
    } catch (error) {
      console.error("Error updating booking status:", error);
      throw error;
    }
  },

  // Calculate base fee based on room type
  calculateBaseFee(roomType) {
    const feeMap = {
      "Single Room": 15000,
      "Shared Room": 12000,
      Dormitory: 8000,
    };
    return feeMap[roomType] || 10000;
  },

  // Get booking statistics
  async getBookingStats() {
    try {
      return await apiRequest("/booking-requests/stats");
    } catch (error) {
      console.error("Error fetching booking stats:", error);
      throw error;
    }
  },

  // Filter requests by status
  async filterRequestsByStatus(status) {
    try {
      return await this.getBookingRequests({ status });
    } catch (error) {
      console.error("Error filtering booking requests:", error);
      throw error;
    }
  },

  // Search booking requests
  async searchBookingRequests(searchTerm, filters = {}) {
    try {
      console.log(`🔍 Searching booking requests: ${searchTerm}`);
      return await this.getBookingRequests({ search: searchTerm, ...filters });
    } catch (error) {
      console.error('❌ Error searching booking requests:', error);
      throw error;
    }
  },

  // Get booking requests with pagination
  async getBookingRequestsPaginated(page = 1, limit = 10, filters = {}) {
    try {
      console.log(`📄 Fetching booking requests page ${page}`);
      return await this.getBookingRequests({ page, limit, ...filters });
    } catch (error) {
      console.error('❌ Error fetching paginated booking requests:', error);
      throw error;
    }
  },
};
