// Mock data loader utility
import { mockData } from '../data/mockData.js';

export const loadMockData = () => {
  // Store mock data in localStorage for persistence across page reloads
  
  // Store checked out students with dues
  localStorage.setItem('checkedOutWithDues', JSON.stringify(mockData.checkedOutWithDues));
  
  // Store recent checkout data
  localStorage.setItem('recentCheckouts', JSON.stringify(mockData.checkoutData));
  
  // Store billing data
  localStorage.setItem('monthlyInvoices', JSON.stringify(mockData.billingData.monthlyInvoices));
  localStorage.setItem('paymentHistory', JSON.stringify(mockData.billingData.paymentHistory));
  
  // Store dashboard stats
  localStorage.setItem('dashboardStats', JSON.stringify(mockData.dashboardStats));
  
  // Store students data
  localStorage.setItem('studentsData', JSON.stringify(mockData.students));
  
  console.log('✅ Mock data loaded into localStorage');
  console.log('📊 Mock data summary:', {
    students: mockData.students.length,
    checkedOutWithDues: mockData.checkedOutWithDues.length,
    invoices: mockData.billingData.monthlyInvoices.length,
    dashboardStats: mockData.dashboardStats
  });
};

// Initialize mock data on app start
export const initializeMockData = () => {
  // Always load mock data to ensure it's fresh
  loadMockData();
  console.log('🚀 Mock data initialized');
};

// Reset all mock data
export const resetMockData = () => {
  localStorage.removeItem('checkedOutWithDues');
  localStorage.removeItem('recentCheckouts');
  localStorage.removeItem('monthlyInvoices');
  localStorage.removeItem('paymentHistory');
  localStorage.removeItem('dashboardStats');
  
  // Reload fresh mock data
  loadMockData();
  
  console.log('🔄 Mock data reset and reloaded');
};