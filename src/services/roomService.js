
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
    return data; // API returns different formats, handle in individual methods
  } catch (error) {
    console.error('Room API Request Error:', error);
    throw error;
  }
}

export const roomService = {
  // Get all rooms
  async getRooms() {
    try {
      console.log('🏠 Fetching rooms from API...');
      const response = await apiRequest('/rooms');
      console.log('✅ Rooms API response:', response);
      return response.result?.items || []; // API returns { status, result: { items, pagination } }
    } catch (error) {
      console.error('❌ Error fetching rooms:', error);
      throw error;
    }
  },

  // Get room by ID
  async getRoomById(id) {
    try {
      const response = await apiRequest(`/rooms/${id}`);
      return response.room || null; // API returns { status, room }
    } catch (error) {
      console.error('Error fetching room by ID:', error);
      throw error;
    }
  },

  // Create new room
  async createRoom(roomData) {
    try {
      const response = await apiRequest('/rooms', {
        method: 'POST',
        body: JSON.stringify(roomData),
      });
      return response.newRoom || response; // API returns { status, newRoom }
    } catch (error) {
      console.error('Error creating room:', error);
      throw error;
    }
  },

  // Update room
  async updateRoom(id, updates) {
    try {
      const response = await apiRequest(`/rooms/${id}`, {
        method: 'PUT',
        body: JSON.stringify(updates),
      });
      return response.updatedRoom || response; // API returns { status, updatedRoom }
    } catch (error) {
      console.error('Error updating room:', error);
      throw error;
    }
  },

  // Delete room (Note: No DELETE endpoint available in server API yet)
  async deleteRoom(id) {
    try {
      // For now, we'll update the room status to 'Inactive' instead of deleting
      const response = await apiRequest(`/rooms/${id}`, {
        method: 'PUT',
        body: JSON.stringify({ status: 'Inactive' }),
      });
      return response.updatedRoom || response;
    } catch (error) {
      console.error('Error deleting room:', error);
      throw error;
    }
  },

  // Get available rooms
  async getAvailableRooms() {
    try {
      const response = await apiRequest('/rooms/available');
      return response.data?.items || []; // API returns { status, data: { items, count } }
    } catch (error) {
      console.error('Error fetching available rooms:', error);
      throw error;
    }
  },

  // Vacate room (remove student from room)
  async vacateRoom(roomNumber, studentId) {
    try {
      // First, find the room by roomNumber
      const allRooms = await this.getRooms();
      const room = allRooms.find(r => r.roomNumber === roomNumber);
      
      if (!room) {
        console.log(`Room ${roomNumber} not found`);
        return null;
      }

      // Use the API endpoint to vacate the student
      const response = await apiRequest(`/rooms/${room.id}/vacate`, {
        method: 'POST',
        body: JSON.stringify({ studentId }),
      });
      
      console.log(`Room ${roomNumber} vacated by student ${studentId}`);
      return response.data || response;
    } catch (error) {
      console.error('Error vacating room:', error);
      throw error;
    }
  },

  // Assign room to student
  async assignRoom(roomNumber, studentId) {
    try {
      // First, find the room by roomNumber
      const allRooms = await this.getRooms();
      const room = allRooms.find(r => r.roomNumber === roomNumber);
      
      if (!room) {
        console.log(`Room ${roomNumber} not found`);
        return null;
      }

      if (room.availableBeds <= 0) {
        console.log(`Room ${roomNumber} has no available beds`);
        return null;
      }

      // Use the API endpoint to assign the student
      const response = await apiRequest(`/rooms/${room.id}/assign`, {
        method: 'POST',
        body: JSON.stringify({ studentId }),
      });
      
      console.log(`Student ${studentId} assigned to room ${roomNumber}`);
      return response.data || response;
    } catch (error) {
      console.error('Error assigning room:', error);
      throw error;
    }
  },

  // Get room statistics
  async getRoomStats() {
    try {
      const response = await apiRequest('/rooms/stats');
      return response.stats || response; // API returns { status, stats }
    } catch (error) {
      console.error('Error fetching room stats:', error);
      throw error;
    }
  },

  // Schedule room maintenance
  async scheduleRoomMaintenance(roomId, maintenanceData) {
    try {
      const response = await apiRequest(`/rooms/${roomId}/maintenance`, {
        method: 'POST',
        body: JSON.stringify(maintenanceData),
      });
      return response.data || response;
    } catch (error) {
      console.error('Error scheduling room maintenance:', error);
      throw error;
    }
  }
};
