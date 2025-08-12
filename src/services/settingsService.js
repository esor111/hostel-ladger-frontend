// Settings Service - System configuration management
import settingsData from '../data/settings.json';

let settings = [...settingsData];

export const settingsService = {
  // READ Operations
  async getAllSettings() {
    return new Promise((resolve) => {
      setTimeout(() => resolve([...settings]), 100);
    });
  },

  async getSettingById(id) {
    return new Promise((resolve) => {
      const setting = settings.find(s => s.id === id);
      setTimeout(() => resolve(setting), 100);
    });
  },

  async getSettingByKey(key) {
    return new Promise((resolve) => {
      const setting = settings.find(s => s.key === key);
      setTimeout(() => resolve(setting), 100);
    });
  },

  async getSettingsByCategory(category) {
    return new Promise((resolve) => {
      const categorySettings = settings.filter(s => s.category === category);
      setTimeout(() => resolve(categorySettings), 100);
    });
  },

  // CREATE Operations
  async createSetting(settingData) {
    return new Promise((resolve, reject) => {
      // Check if key already exists
      const existingSetting = settings.find(s => s.key === settingData.key);
      if (existingSetting) {
        setTimeout(() => reject(new Error('Setting key already exists')), 100);
        return;
      }

      const newSetting = {
        id: `SET${String(settings.length + 1).padStart(3, '0')}`,
        ...settingData,
        lastModified: new Date().toISOString(),
        modifiedBy: 'system'
      };
      
      settings.push(newSetting);
      setTimeout(() => resolve(newSetting), 100);
    });
  },

  async bulkCreateSettings(settingsArray) {
    return new Promise((resolve, reject) => {
      try {
        const newSettings = settingsArray.map((settingData, index) => ({
          id: `SET${String(settings.length + index + 1).padStart(3, '0')}`,
          ...settingData,
          lastModified: new Date().toISOString(),
          modifiedBy: 'system'
        }));
        
        settings.push(...newSettings);
        setTimeout(() => resolve(newSettings), 100);
      } catch (error) {
        setTimeout(() => reject(error), 100);
      }
    });
  },

  // UPDATE Operations
  async updateSetting(id, updateData) {
    return new Promise((resolve, reject) => {
      const index = settings.findIndex(s => s.id === id);
      if (index === -1) {
        setTimeout(() => reject(new Error('Setting not found')), 100);
        return;
      }

      settings[index] = {
        ...settings[index],
        ...updateData,
        lastModified: new Date().toISOString(),
        modifiedBy: updateData.modifiedBy || 'system'
      };
      
      setTimeout(() => resolve(settings[index]), 100);
    });
  },

  async updateSettingByKey(key, value, modifiedBy = 'system') {
    return new Promise((resolve, reject) => {
      const index = settings.findIndex(s => s.key === key);
      if (index === -1) {
        setTimeout(() => reject(new Error('Setting not found')), 100);
        return;
      }

      settings[index] = {
        ...settings[index],
        value,
        lastModified: new Date().toISOString(),
        modifiedBy
      };
      
      setTimeout(() => resolve(settings[index]), 100);
    });
  },

  async bulkUpdateSettings(updates) {
    return new Promise((resolve, reject) => {
      try {
        const updatedSettings = [];
        
        updates.forEach(({ id, ...updateData }) => {
          const index = settings.findIndex(s => s.id === id);
          if (index !== -1) {
            settings[index] = {
              ...settings[index],
              ...updateData,
              lastModified: new Date().toISOString(),
              modifiedBy: updateData.modifiedBy || 'system'
            };
            updatedSettings.push(settings[index]);
          }
        });
        
        setTimeout(() => resolve(updatedSettings), 100);
      } catch (error) {
        setTimeout(() => reject(error), 100);
      }
    });
  },

  // DELETE Operations
  async deleteSetting(id) {
    return new Promise((resolve, reject) => {
      const index = settings.findIndex(s => s.id === id);
      if (index === -1) {
        setTimeout(() => reject(new Error('Setting not found')), 100);
        return;
      }

      const deletedSetting = settings.splice(index, 1)[0];
      setTimeout(() => resolve(deletedSetting), 100);
    });
  },

  async bulkDeleteSettings(ids) {
    return new Promise((resolve) => {
      const deletedSettings = [];
      
      ids.forEach(id => {
        const index = settings.findIndex(s => s.id === id);
        if (index !== -1) {
          deletedSettings.push(settings.splice(index, 1)[0]);
        }
      });
      
      setTimeout(() => resolve(deletedSettings), 100);
    });
  },

  // SEARCH Operations
  async searchSettings(criteria) {
    return new Promise((resolve) => {
      const searchTerm = criteria.toLowerCase();
      const filteredSettings = settings.filter(setting => 
        setting.displayName.toLowerCase().includes(searchTerm) ||
        setting.description.toLowerCase().includes(searchTerm) ||
        setting.key.toLowerCase().includes(searchTerm) ||
        setting.category.toLowerCase().includes(searchTerm)
      );
      setTimeout(() => resolve(filteredSettings), 100);
    });
  },

  async filterSettings(filters) {
    return new Promise((resolve) => {
      let filteredSettings = [...settings];
      
      if (filters.category) {
        filteredSettings = filteredSettings.filter(s => s.category === filters.category);
      }
      
      if (filters.type) {
        filteredSettings = filteredSettings.filter(s => s.type === filters.type);
      }
      
      if (filters.isEditable !== undefined) {
        filteredSettings = filteredSettings.filter(s => s.isEditable === filters.isEditable);
      }
      
      if (filters.isVisible !== undefined) {
        filteredSettings = filteredSettings.filter(s => s.isVisible === filters.isVisible);
      }
      
      setTimeout(() => resolve(filteredSettings), 100);
    });
  },

  // STATISTICS Operations
  async getSettingsStats() {
    return new Promise((resolve) => {
      const stats = {
        total: settings.length,
        byCategory: {},
        byType: {},
        editable: settings.filter(s => s.isEditable).length,
        visible: settings.filter(s => s.isVisible).length,
        lastModified: settings.reduce((latest, setting) => {
          const settingDate = new Date(setting.lastModified);
          return settingDate > latest ? settingDate : latest;
        }, new Date(0))
      };
      
      // Count by category
      settings.forEach(setting => {
        stats.byCategory[setting.category] = (stats.byCategory[setting.category] || 0) + 1;
      });
      
      // Count by type
      settings.forEach(setting => {
        stats.byType[setting.type] = (stats.byType[setting.type] || 0) + 1;
      });
      
      setTimeout(() => resolve(stats), 100);
    });
  },

  async getSettingsSummary() {
    return new Promise((resolve) => {
      const summary = {
        categories: [...new Set(settings.map(s => s.category))],
        types: [...new Set(settings.map(s => s.type))],
        totalSettings: settings.length,
        editableSettings: settings.filter(s => s.isEditable).length,
        systemSettings: settings.filter(s => s.category === 'system').length,
        billingSettings: settings.filter(s => s.category === 'billing').length,
        notificationSettings: settings.filter(s => s.category === 'notification').length,
        securitySettings: settings.filter(s => s.category === 'security').length
      };
      
      setTimeout(() => resolve(summary), 100);
    });
  },

  // UTILITY Operations
  async getSettingValue(key) {
    return new Promise((resolve, reject) => {
      const setting = settings.find(s => s.key === key);
      if (!setting) {
        setTimeout(() => reject(new Error('Setting not found')), 100);
        return;
      }
      setTimeout(() => resolve(setting.value), 100);
    });
  },

  async getSettingsForCategory(category) {
    return new Promise((resolve) => {
      const categorySettings = settings
        .filter(s => s.category === category && s.isVisible)
        .sort((a, b) => a.displayName.localeCompare(b.displayName));
      setTimeout(() => resolve(categorySettings), 100);
    });
  },

  async resetSettingToDefault(key) {
    return new Promise((resolve, reject) => {
      // This would typically reset to a default value from a defaults configuration
      // For now, we'll just mark it as reset
      const index = settings.findIndex(s => s.key === key);
      if (index === -1) {
        setTimeout(() => reject(new Error('Setting not found')), 100);
        return;
      }

      // Reset logic would go here - for demo, we'll just update the modified timestamp
      settings[index] = {
        ...settings[index],
        lastModified: new Date().toISOString(),
        modifiedBy: 'system_reset'
      };
      
      setTimeout(() => resolve(settings[index]), 100);
    });
  }
};