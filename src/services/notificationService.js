// Notification Service for Kaha App Integration
// Handles all student notifications through the Kaha mobile app
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/hostel/api/v1';

let notifications = [];

export const notificationService = {
  // Send notification to Kaha App
  async sendKahaAppNotification(studentId, message, type = 'info', priority = 'normal') {
    return new Promise((resolve) => {
      // In a real app, this would integrate with push notification service
      // For now, we'll simulate the notification
      
      const notification = {
        id: `NOTIF-${Date.now()}`,
        studentId,
        message,
        type, // 'info', 'warning', 'success', 'payment', 'discount', 'charge'
        priority, // 'low', 'normal', 'high', 'urgent'
        timestamp: new Date().toISOString(),
        status: 'sent',
        channel: 'kaha_app'
      };

      console.log(`📱 Kaha App Notification sent:`, {
        studentId,
        type,
        priority,
        message: message.substring(0, 100) + (message.length > 100 ? '...' : '')
      });

      setTimeout(() => resolve({
        success: true,
        notificationId: notification.id,
        deliveryStatus: 'sent'
      }), 200);
    });
  },

  // Send bulk notifications
  async sendBulkKahaAppNotifications(notifications) {
    return new Promise(async (resolve) => {
      const results = [];
      
      for (const notif of notifications) {
        try {
          const result = await this.sendKahaAppNotification(
            notif.studentId, 
            notif.message, 
            notif.type, 
            notif.priority
          );
          results.push({ ...notif, success: true, result });
        } catch (error) {
          results.push({ ...notif, success: false, error: error.message });
        }
      }

      console.log(`📱 Bulk Kaha App Notifications: ${results.filter(r => r.success).length}/${results.length} sent successfully`);

      setTimeout(() => resolve({
        total: notifications.length,
        successful: results.filter(r => r.success).length,
        failed: results.filter(r => !r.success).length,
        results
      }), 500);
    });
  },

  // Notification templates
  templates: {
    // Enrollment notifications
    welcome: (studentName, roomNumber) => 
      `🎉 Welcome to Kaha Hostel, ${studentName}! Your room ${roomNumber} is ready. Check the app for your invoice and payment options.`,
    
    // Payment notifications
    paymentReceived: (amount, balance) => 
      `✅ Payment of NPR ${amount.toLocaleString()} received successfully! ${balance > 0 ? `Remaining balance: NPR ${balance.toLocaleString()}` : 'Your account is now up to date!'}`,
    
    paymentOverdue: (amount, daysOverdue) => 
      `⚠️ Payment overdue! NPR ${amount.toLocaleString()} is ${daysOverdue} days past due. Please pay through the Kaha app to avoid late fees.`,
    
    // Invoice notifications
    newInvoice: (month, amount) => 
      `📋 New invoice for ${month}: NPR ${amount.toLocaleString()}. View details and pay conveniently through the Kaha app.`,
    
    // Discount notifications
    discountApplied: (amount, reason) => 
      `🎁 Great news! A discount of NPR ${amount.toLocaleString()} has been applied to your account for ${reason}. Check your updated balance in the app.`,
    
    // Admin charge notifications
    adminCharge: (amount, reason) => 
      `💳 An admin charge of NPR ${amount.toLocaleString()} has been added to your account for ${reason}. View details in the Kaha app.`,
    
    // Late fee notifications
    lateFee: (amount, reason) => 
      `⏰ Late fee of NPR ${amount.toLocaleString()} applied: ${reason}. Please ensure timely payments to avoid future charges.`,
    
    // Checkout notifications
    checkoutApproved: (refundAmount) => 
      `✅ Checkout approved! ${refundAmount > 0 ? `Refund of NPR ${refundAmount.toLocaleString()} will be processed within 3-5 business days.` : 'Thank you for staying with Kaha Hostel!'}`,
    
    // General notifications
    balanceUpdate: (newBalance) => 
      `💰 Account balance updated: ${newBalance > 0 ? `NPR ${newBalance.toLocaleString()} due` : 'Account is up to date'}. View transaction history in the app.`,
    
    // Maintenance notifications
    maintenance: (roomNumber, date, description) => 
      `🔧 Scheduled maintenance for Room ${roomNumber} on ${date}: ${description}. Please plan accordingly.`,
    
    // Event notifications
    event: (title, date, description) => 
      `🎪 Hostel Event: ${title} on ${date}. ${description} Check the events section in the app for more details.`
  },

  // Quick notification methods
  async notifyPaymentReceived(studentId, amount, remainingBalance) {
    return this.sendKahaAppNotification(
      studentId,
      this.templates.paymentReceived(amount, remainingBalance),
      'payment',
      'normal'
    );
  },

  async notifyNewInvoice(studentId, month, amount) {
    return this.sendKahaAppNotification(
      studentId,
      this.templates.newInvoice(month, amount),
      'info',
      'normal'
    );
  },

  async notifyDiscountApplied(studentId, amount, reason) {
    return this.sendKahaAppNotification(
      studentId,
      this.templates.discountApplied(amount, reason),
      'success',
      'normal'
    );
  },

  async notifyAdminCharge(studentId, amount, reason) {
    return this.sendKahaAppNotification(
      studentId,
      this.templates.adminCharge(amount, reason),
      'warning',
      'high'
    );
  },

  async notifyPaymentOverdue(studentId, amount, daysOverdue) {
    return this.sendKahaAppNotification(
      studentId,
      this.templates.paymentOverdue(amount, daysOverdue),
      'warning',
      'high'
    );
  },

  async notifyWelcome(studentId, studentName, roomNumber) {
    return this.sendKahaAppNotification(
      studentId,
      this.templates.welcome(studentName, roomNumber),
      'success',
      'high'
    );
  },

  async notifyCheckoutApproved(studentId, refundAmount) {
    return this.sendKahaAppNotification(
      studentId,
      this.templates.checkoutApproved(refundAmount),
      'success',
      'normal'
    );
  },

  // CRUD Operations for notification history
  async getAllNotifications(filters = {}) {
    try {
      const queryParams = new URLSearchParams();
      if (filters.recipientId) queryParams.append('recipientId', filters.recipientId);
      if (filters.recipientType) queryParams.append('recipientType', filters.recipientType);
      if (filters.isRead !== undefined) queryParams.append('isRead', filters.isRead);
      if (filters.category) queryParams.append('category', filters.category);
      if (filters.priority) queryParams.append('priority', filters.priority);
      
      const response = await fetch(`${API_BASE_URL}/notifications?${queryParams}`);
      const result = await response.json();
      
      if (result.success) {
        notifications = result.data;
        return result.data;
      } else {
        throw new Error(result.message || 'Failed to fetch notifications');
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
      throw error;
    }
  },

  async getNotificationById(id) {
    try {
      const response = await fetch(`${API_BASE_URL}/notifications/${id}`);
      const result = await response.json();
      
      if (result.success) {
        return result.data;
      } else {
        throw new Error(result.message || 'Failed to fetch notification');
      }
    } catch (error) {
      console.error('Error fetching notification:', error);
      throw error;
    }
  },

  async getNotificationsByRecipient(recipientId, recipientType = 'student') {
    return new Promise((resolve) => {
      const userNotifications = notifications.filter(n => 
        n.recipientId === recipientId && n.recipientType === recipientType
      );
      setTimeout(() => resolve(userNotifications), 100);
    });
  },

  async getUnreadNotifications(recipientId, recipientType = 'student') {
    try {
      const response = await fetch(`${API_BASE_URL}/notifications/unread?recipientId=${recipientId}&recipientType=${recipientType}`);
      const result = await response.json();
      
      if (result.success) {
        return result.data;
      } else {
        throw new Error(result.message || 'Failed to fetch unread notifications');
      }
    } catch (error) {
      console.error('Error fetching unread notifications:', error);
      throw error;
    }
  },

  async markAsRead(notificationId) {
    try {
      const response = await fetch(`${API_BASE_URL}/notifications/${notificationId}/read`, {
        method: 'PUT',
      });
      
      const result = await response.json();
      
      if (result.success) {
        return result.data;
      } else {
        throw new Error(result.message || 'Failed to mark notification as read');
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
      throw error;
    }
  },

  async markAllAsRead(recipientId, recipientType = 'student') {
    return new Promise((resolve) => {
      const updatedNotifications = [];
      
      notifications.forEach(notification => {
        if (notification.recipientId === recipientId && 
            notification.recipientType === recipientType && 
            !notification.isRead) {
          notification.isRead = true;
          notification.readAt = new Date().toISOString();
          updatedNotifications.push(notification);
        }
      });
      
      setTimeout(() => resolve(updatedNotifications), 100);
    });
  },

  async sendNotification({ recipientId, recipientType = 'student', title, message, type = 'info', category = 'general', priority = 'medium', actionUrl = null }) {
    try {
      const response = await fetch(`${API_BASE_URL}/notifications`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          recipientId,
          recipientType,
          title,
          message,
          type,
          category,
          priority,
          actionUrl
        }),
      });
      
      const result = await response.json();
      
      if (result.success) {
        // Also send via Kaha App
        this.sendKahaAppNotification(recipientId, message, type, priority);
        
        return {
          success: true,
          notificationId: result.data.id,
          deliveredAt: result.data.sentAt
        };
      } else {
        throw new Error(result.message || 'Failed to send notification');
      }
    } catch (error) {
      console.error('Error sending notification:', error);
      throw error;
    }
  },

  // Get notification history (for admin dashboard)
  async getNotificationHistory(studentId = null, limit = 50) {
    return new Promise((resolve) => {
      let history = [...notifications];
      
      if (studentId) {
        history = history.filter(n => n.recipientId === studentId);
      }
      
      // Sort by most recent first and limit results
      history = history
        .sort((a, b) => new Date(b.sentAt) - new Date(a.sentAt))
        .slice(0, limit);

      setTimeout(() => resolve(history), 100);
    });
  },

  // Get notification statistics
  async getNotificationStats(recipientId = null) {
    try {
      const queryParams = recipientId ? `?recipientId=${recipientId}` : '';
      const response = await fetch(`${API_BASE_URL}/notifications/stats${queryParams}`);
      const result = await response.json();
      
      if (result.success) {
        return result.data;
      } else {
        throw new Error(result.message || 'Failed to fetch notification statistics');
      }
    } catch (error) {
      console.error('Error fetching notification statistics:', error);
      throw error;
    }
  }
};