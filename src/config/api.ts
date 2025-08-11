// API Configuration
export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/hostel/api/v1',
  TIMEOUT: 30000,
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000,
};

// API Endpoints
export const API_ENDPOINTS = {
  // Students
  STUDENTS: {
    BASE: '/students',
    BY_ID: (id: string) => `/students/${id}`,
    STATS: '/students/stats',
    CHECKOUT: (id: string) => `/students/${id}/checkout`,
  },
  
  // Ledger
  LEDGER: {
    BASE: '/ledger',
    BY_STUDENT: (studentId: string) => `/ledger/student/${studentId}`,
  },
  
  // Payments
  PAYMENTS: {
    BASE: '/payments',
    BY_ID: (id: string) => `/payments/${id}`,
  },
  
  // Billing
  BILLING: {
    BASE: '/billing',
    MONTHLY: '/billing/monthly',
  },
  
  // Rooms
  ROOMS: {
    BASE: '/rooms',
    AVAILABLE: '/rooms/available',
  },
  
  // Admin Charges
  ADMIN_CHARGES: {
    BASE: '/admin/charges',
    TYPES: '/admin/charge-types',
    BULK: '/admin/charges/bulk',
    OVERDUE_STUDENTS: '/admin/charges/overdue-students',
    HISTORY: (studentId: string) => `/admin/charges/history/${studentId}`,
    SUMMARY_TODAY: '/admin/charges/summary/today',
  },
  
  // Discounts
  DISCOUNTS: {
    BASE: '/discounts',
    BY_ID: (id: string) => `/discounts/${id}`,
    STATS: '/discounts/stats',
    BY_STUDENT: (studentId: string) => `/discounts/student/${studentId}`,
  },
  
  // Users
  USERS: {
    BASE: '/users',
    BY_ID: (id: string) => `/users/${id}`,
    STATS: '/users/stats',
    BY_ROLE: (role: string) => `/users/role/${role}`,
    BY_DEPARTMENT: (department: string) => `/users/department/${department}`,
    VALIDATE: '/users/validate',
    BULK: '/users/bulk',
  },
  
  // Settings
  SETTINGS: {
    BASE: '/settings',
    BY_KEY: (key: string) => `/settings/${key}`,
    BY_CATEGORY: (category: string) => `/settings/category/${category}`,
  },
};

// Helper function to build full API URLs
export const buildApiUrl = (endpoint: string): string => {
  return `${API_CONFIG.BASE_URL}${endpoint}`;
};

// HTTP Methods
export const HTTP_METHODS = {
  GET: 'GET',
  POST: 'POST',
  PUT: 'PUT',
  DELETE: 'DELETE',
  PATCH: 'PATCH',
} as const;

// Response status codes
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  INTERNAL_SERVER_ERROR: 500,
} as const;

// Request headers
export const DEFAULT_HEADERS = {
  'Content-Type': 'application/json',
  'Accept': 'application/json',
};

export default {
  API_CONFIG,
  API_ENDPOINTS,
  buildApiUrl,
  HTTP_METHODS,
  HTTP_STATUS,
  DEFAULT_HEADERS,
};