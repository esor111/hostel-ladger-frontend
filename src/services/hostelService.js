
// Hostel Service - Manage hostel profile and settings
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

let hostelProfile = null;

export const hostelService = {
  // Get hostel profile
  async getHostelProfile() {
    try {
      const response = await fetch(`${API_BASE_URL}/hostel/profile`);
      const result = await response.json();
      
      if (result.success) {
        hostelProfile = result.data;
        return result.data;
      } else {
        throw new Error(result.message || 'Failed to fetch hostel profile');
      }
    } catch (error) {
      console.error('Error fetching hostel profile:', error);
      throw error;
    }
  },

  // Update hostel profile
  async updateHostelProfile(updates) {
    try {
      const response = await fetch(`${API_BASE_URL}/hostel/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      });
      
      const result = await response.json();
      
      if (result.success) {
        hostelProfile = result.data;
        return result.data;
      } else {
        throw new Error(result.message || 'Failed to update hostel profile');
      }
    } catch (error) {
      console.error('Error updating hostel profile:', error);
      throw error;
    }
  },

  // Get hostel amenities
  async getAmenities() {
    try {
      if (!hostelProfile) {
        await this.getHostelProfile();
      }
      return hostelProfile.amenities;
    } catch (error) {
      console.error('Error fetching amenities:', error);
      throw error;
    }
  },

  // Update amenities
  async updateAmenities(amenities) {
    try {
      const updates = { amenities };
      const updatedProfile = await this.updateHostelProfile(updates);
      return updatedProfile.amenities;
    } catch (error) {
      console.error('Error updating amenities:', error);
      throw error;
    }
  },

  // Get pricing structure
  async getPricing() {
    try {
      if (!hostelProfile) {
        await this.getHostelProfile();
      }
      return hostelProfile.pricing;
    } catch (error) {
      console.error('Error fetching pricing:', error);
      throw error;
    }
  },

  // Update pricing
  async updatePricing(pricing) {
    try {
      const updates = { pricing: { ...hostelProfile?.pricing, ...pricing } };
      const updatedProfile = await this.updateHostelProfile(updates);
      return updatedProfile.pricing;
    } catch (error) {
      console.error('Error updating pricing:', error);
      throw error;
    }
  },

  // Get policies
  async getPolicies() {
    try {
      if (!hostelProfile) {
        await this.getHostelProfile();
      }
      return hostelProfile.policies;
    } catch (error) {
      console.error('Error fetching policies:', error);
      throw error;
    }
  },

  // Update policies
  async updatePolicies(policies) {
    try {
      const updates = { policies: { ...hostelProfile?.policies, ...policies } };
      const updatedProfile = await this.updateHostelProfile(updates);
      return updatedProfile.policies;
    } catch (error) {
      console.error('Error updating policies:', error);
      throw error;
    }
  }
};
