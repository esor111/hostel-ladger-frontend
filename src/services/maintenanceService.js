// Maintenance Service - Handle room and facility maintenance
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

let maintenanceRequests = [];

export const maintenanceService = {
  // READ Operations
  async getAllMaintenanceRequests(filters = {}) {
    try {
      const queryParams = new URLSearchParams();
      if (filters.status) queryParams.append('status', filters.status);
      if (filters.priority) queryParams.append('priority', filters.priority);
      if (filters.type) queryParams.append('type', filters.type);
      if (filters.roomId) queryParams.append('roomId', filters.roomId);
      
      const response = await fetch(`${API_BASE_URL}/maintenance?${queryParams}`);
      const result = await response.json();
      
      if (result.success) {
        maintenanceRequests = result.data;
        return result.data;
      } else {
        throw new Error(result.message || 'Failed to fetch maintenance requests');
      }
    } catch (error) {
      console.error('Error fetching maintenance requests:', error);
      throw error;
    }
  },

  async getMaintenanceRequestById(id) {
    try {
      const response = await fetch(`${API_BASE_URL}/maintenance/${id}`);
      const result = await response.json();
      
      if (result.success) {
        return result.data;
      } else {
        throw new Error(result.message || 'Failed to fetch maintenance request');
      }
    } catch (error) {
      console.error('Error fetching maintenance request:', error);
      throw error;
    }
  },

  async getMaintenanceRequestsByRoom(roomId) {
    return new Promise((resolve) => {
      const roomRequests = maintenanceRequests.filter(r => r.roomId === roomId);
      setTimeout(() => resolve(roomRequests), 100);
    });
  },

  async getMaintenanceRequestsByStatus(status) {
    return new Promise((resolve) => {
      const statusRequests = maintenanceRequests.filter(r => r.status === status);
      setTimeout(() => resolve(statusRequests), 100);
    });
  },

  async getMaintenanceRequestsByType(type) {
    return new Promise((resolve) => {
      const typeRequests = maintenanceRequests.filter(r => r.type === type);
      setTimeout(() => resolve(typeRequests), 100);
    });
  },

  async getMaintenanceRequestsByPriority(priority) {
    return new Promise((resolve) => {
      const priorityRequests = maintenanceRequests.filter(r => r.priority === priority);
      setTimeout(() => resolve(priorityRequests), 100);
    });
  },

  async getMaintenanceRequestsByAssignee(assignedTo) {
    return new Promise((resolve) => {
      const assigneeRequests = maintenanceRequests.filter(r => r.assignedTo === assignedTo);
      setTimeout(() => resolve(assigneeRequests), 100);
    });
  },

  async getPendingMaintenanceRequests() {
    return new Promise((resolve) => {
      const pendingRequests = maintenanceRequests.filter(r => 
        r.status === 'pending' || r.status === 'in-progress'
      );
      setTimeout(() => resolve(pendingRequests), 100);
    });
  },

  async getUrgentMaintenanceRequests() {
    return new Promise((resolve) => {
      const urgentRequests = maintenanceRequests.filter(r => 
        r.priority === 'urgent' || r.priority === 'high'
      );
      setTimeout(() => resolve(urgentRequests), 100);
    });
  },

  // CREATE Operations
  async createMaintenanceRequest(requestData) {
    try {
      const response = await fetch(`${API_BASE_URL}/maintenance`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      });
      
      const result = await response.json();
      
      if (result.success) {
        console.log(`🔧 Maintenance request created: ${result.data.title}`);
        return result.data;
      } else {
        throw new Error(result.message || 'Failed to create maintenance request');
      }
    } catch (error) {
      console.error('Error creating maintenance request:', error);
      throw error;
    }
  },

  async bulkCreateMaintenanceRequests(requestsArray) {
    return new Promise((resolve) => {
      const newRequests = requestsArray.map((requestData, index) => ({
        id: `MNT${String(maintenanceRequests.length + index + 1).padStart(3, '0')}`,
        ...requestData,
        status: 'pending',
        reportedAt: new Date().toISOString(),
        scheduledAt: null,
        completedAt: null,
        cost: 0,
        notes: requestData.notes || '',
        images: requestData.images || []
      }));
      
      maintenanceRequests.push(...newRequests);
      
      console.log(`🔧 ${newRequests.length} maintenance requests created`);
      
      setTimeout(() => resolve(newRequests), 100);
    });
  },

  // UPDATE Operations
  async updateMaintenanceRequest(id, updateData) {
    try {
      const response = await fetch(`${API_BASE_URL}/maintenance/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      });
      
      const result = await response.json();
      
      if (result.success) {
        return result.data;
      } else {
        throw new Error(result.message || 'Failed to update maintenance request');
      }
    } catch (error) {
      console.error('Error updating maintenance request:', error);
      throw error;
    }
  },

  async assignMaintenanceRequest(id, assignedTo, scheduledAt) {
    try {
      const response = await fetch(`${API_BASE_URL}/maintenance/${id}/assign`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ assignedTo, scheduledAt }),
      });
      
      const result = await response.json();
      
      if (result.success) {
        return result.data;
      } else {
        throw new Error(result.message || 'Failed to assign maintenance request');
      }
    } catch (error) {
      console.error('Error assigning maintenance request:', error);
      throw error;
    }
  },

  async scheduleMaintenanceRequest(id, scheduledAt) {
    return new Promise((resolve, reject) => {
      const index = maintenanceRequests.findIndex(r => r.id === id);
      if (index === -1) {
        setTimeout(() => reject(new Error('Maintenance request not found')), 100);
        return;
      }

      maintenanceRequests[index].scheduledAt = scheduledAt;
      maintenanceRequests[index].status = 'in-progress';
      
      setTimeout(() => resolve(maintenanceRequests[index]), 100);
    });
  },

  async completeMaintenanceRequest(id, cost, notes) {
    try {
      const response = await fetch(`${API_BASE_URL}/maintenance/${id}/complete`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ cost, notes }),
      });
      
      const result = await response.json();
      
      if (result.success) {
        console.log(`✅ Maintenance request completed: ${result.data.title}`);
        return result.data;
      } else {
        throw new Error(result.message || 'Failed to complete maintenance request');
      }
    } catch (error) {
      console.error('Error completing maintenance request:', error);
      throw error;
    }
  },

  async updateMaintenanceCost(id, cost, notes) {
    return new Promise((resolve, reject) => {
      const index = maintenanceRequests.findIndex(r => r.id === id);
      if (index === -1) {
        setTimeout(() => reject(new Error('Maintenance request not found')), 100);
        return;
      }

      maintenanceRequests[index].cost = cost;
      if (notes) {
        maintenanceRequests[index].notes = notes;
      }
      
      setTimeout(() => resolve(maintenanceRequests[index]), 100);
    });
  },

  // DELETE Operations
  async deleteMaintenanceRequest(id) {
    return new Promise((resolve, reject) => {
      const index = maintenanceRequests.findIndex(r => r.id === id);
      if (index === -1) {
        setTimeout(() => reject(new Error('Maintenance request not found')), 100);
        return;
      }

      const deletedRequest = maintenanceRequests.splice(index, 1)[0];
      setTimeout(() => resolve(deletedRequest), 100);
    });
  },

  async cancelMaintenanceRequest(id, reason) {
    return new Promise((resolve, reject) => {
      const index = maintenanceRequests.findIndex(r => r.id === id);
      if (index === -1) {
        setTimeout(() => reject(new Error('Maintenance request not found')), 100);
        return;
      }

      maintenanceRequests[index].status = 'cancelled';
      maintenanceRequests[index].notes += `\nCancelled: ${reason}`;
      
      setTimeout(() => resolve(maintenanceRequests[index]), 100);
    });
  },

  // SEARCH Operations
  async searchMaintenanceRequests(criteria) {
    return new Promise((resolve) => {
      const searchTerm = criteria.toLowerCase();
      const filteredRequests = maintenanceRequests.filter(request => 
        request.title.toLowerCase().includes(searchTerm) ||
        request.description.toLowerCase().includes(searchTerm) ||
        request.type.toLowerCase().includes(searchTerm) ||
        request.notes.toLowerCase().includes(searchTerm)
      );
      setTimeout(() => resolve(filteredRequests), 100);
    });
  },

  async filterMaintenanceRequests(filters) {
    return new Promise((resolve) => {
      let filteredRequests = [...maintenanceRequests];
      
      if (filters.status) {
        filteredRequests = filteredRequests.filter(r => r.status === filters.status);
      }
      
      if (filters.type) {
        filteredRequests = filteredRequests.filter(r => r.type === filters.type);
      }
      
      if (filters.priority) {
        filteredRequests = filteredRequests.filter(r => r.priority === filters.priority);
      }
      
      if (filters.assignedTo) {
        filteredRequests = filteredRequests.filter(r => r.assignedTo === filters.assignedTo);
      }
      
      if (filters.roomId) {
        filteredRequests = filteredRequests.filter(r => r.roomId === filters.roomId);
      }
      
      if (filters.dateRange) {
        const startDate = new Date(filters.dateRange.start);
        const endDate = new Date(filters.dateRange.end);
        filteredRequests = filteredRequests.filter(r => {
          const requestDate = new Date(r.reportedAt);
          return requestDate >= startDate && requestDate <= endDate;
        });
      }
      
      setTimeout(() => resolve(filteredRequests), 100);
    });
  },

  // STATISTICS Operations
  async getMaintenanceStats() {
    try {
      const response = await fetch(`${API_BASE_URL}/maintenance/stats`);
      const result = await response.json();
      
      if (result.success) {
        return result.data;
      } else {
        throw new Error(result.message || 'Failed to fetch maintenance statistics');
      }
    } catch (error) {
      console.error('Error fetching maintenance statistics:', error);
      throw error;
    }
  },

  async getMaintenanceSummary() {
    return new Promise((resolve) => {
      const now = new Date();
      const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const thisWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      
      const summary = {
        totalRequests: maintenanceRequests.length,
        pendingRequests: maintenanceRequests.filter(r => r.status === 'pending').length,
        completedRequests: maintenanceRequests.filter(r => r.status === 'completed').length,
        urgentRequests: maintenanceRequests.filter(r => r.priority === 'urgent').length,
        thisMonthRequests: maintenanceRequests.filter(r => 
          new Date(r.reportedAt) >= thisMonth
        ).length,
        thisWeekRequests: maintenanceRequests.filter(r => 
          new Date(r.reportedAt) >= thisWeek
        ).length,
        totalCost: maintenanceRequests.reduce((sum, r) => sum + (r.cost || 0), 0),
        mostCommonType: '',
        mostCommonPriority: ''
      };
      
      // Find most common type and priority
      const typeCounts = {};
      const priorityCounts = {};
      
      maintenanceRequests.forEach(request => {
        typeCounts[request.type] = (typeCounts[request.type] || 0) + 1;
        priorityCounts[request.priority] = (priorityCounts[request.priority] || 0) + 1;
      });
      
      summary.mostCommonType = Object.keys(typeCounts).reduce((a, b) => 
        typeCounts[a] > typeCounts[b] ? a : b, ''
      );
      
      summary.mostCommonPriority = Object.keys(priorityCounts).reduce((a, b) => 
        priorityCounts[a] > priorityCounts[b] ? a : b, ''
      );
      
      setTimeout(() => resolve(summary), 100);
    });
  },

  // UTILITY Operations
  async getMaintenanceTypes() {
    return new Promise((resolve) => {
      const types = [
        { value: 'repair', label: 'Repair', description: 'Fix broken or damaged items' },
        { value: 'cleaning', label: 'Cleaning', description: 'Deep cleaning and sanitization' },
        { value: 'inspection', label: 'Inspection', description: 'Routine inspections and checks' },
        { value: 'upgrade', label: 'Upgrade', description: 'Improvements and upgrades' }
      ];
      
      setTimeout(() => resolve(types), 100);
    });
  },

  async getMaintenancePriorities() {
    return new Promise((resolve) => {
      const priorities = [
        { value: 'low', label: 'Low', description: 'Can be scheduled for later', color: 'green' },
        { value: 'medium', label: 'Medium', description: 'Should be addressed soon', color: 'yellow' },
        { value: 'high', label: 'High', description: 'Needs immediate attention', color: 'orange' },
        { value: 'urgent', label: 'Urgent', description: 'Critical issue requiring immediate action', color: 'red' }
      ];
      
      setTimeout(() => resolve(priorities), 100);
    });
  },

  async addMaintenanceImage(id, imagePath) {
    return new Promise((resolve, reject) => {
      const index = maintenanceRequests.findIndex(r => r.id === id);
      if (index === -1) {
        setTimeout(() => reject(new Error('Maintenance request not found')), 100);
        return;
      }

      if (!maintenanceRequests[index].images) {
        maintenanceRequests[index].images = [];
      }
      
      maintenanceRequests[index].images.push(imagePath);
      
      setTimeout(() => resolve(maintenanceRequests[index]), 100);
    });
  }
};