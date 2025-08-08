// Optimized data service with advanced caching and batching
class OptimizedDataService {
  constructor() {
    this.cache = new Map();
    this.subscriptions = new Map();
    this.realTimeConnections = new Map();
    this.initializeOptimizations();
  }

  async initializeOptimizations() {
    // Initialize optimizations
    console.log('Optimized data service initialized');
  }

  // Optimized student data fetching
  async getStudents(options = {}) {
    const { 
      page = 0, 
      limit = 50, 
      filters = {}, 
      sortBy = 'name',
      useCache = true 
    } = options;

    const cacheKey = `students-${JSON.stringify({ page, limit, filters, sortBy })}`;
    
    if (useCache && this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    try {
      // Simulate API call - replace with actual endpoint
      const response = await fetch('/src/data/students.json');
      const allStudents = await response.json();
      
      // Apply filters
      let filteredStudents = allStudents;
      if (filters.status) {
        filteredStudents = filteredStudents.filter(s => s.status === filters.status);
      }
      if (filters.search) {
        const searchTerm = filters.search.toLowerCase();
        filteredStudents = filteredStudents.filter(s => 
          s.name.toLowerCase().includes(searchTerm) ||
          s.roomNumber.toLowerCase().includes(searchTerm) ||
          s.course.toLowerCase().includes(searchTerm)
        );
      }

      // Apply sorting
      filteredStudents.sort((a, b) => {
        if (sortBy === 'name') return a.name.localeCompare(b.name);
        if (sortBy === 'roomNumber') return a.roomNumber.localeCompare(b.roomNumber);
        if (sortBy === 'joinDate') return new Date(a.joinDate) - new Date(b.joinDate);
        return 0;
      });

      // Apply pagination
      const startIndex = page * limit;
      const paginatedStudents = filteredStudents.slice(startIndex, startIndex + limit);

      const result = {
        data: paginatedStudents,
        total: filteredStudents.length,
        page,
        limit,
        hasMore: startIndex + limit < filteredStudents.length
      };

      // Cache result
      this.cache.set(cacheKey, result);
      
      return result;
    } catch (error) {
      console.error('Error fetching students:', error);
      return { data: [], total: 0, page, limit, hasMore: false };
    }
  }

  // Optimized ledger data fetching with batching
  async getLedgerEntries(studentIds, options = {}) {
    const { useCache = true } = options;

    if (!Array.isArray(studentIds)) {
      studentIds = [studentIds];
    }

    const results = {};

    try {
      const response = await fetch('/src/data/ledger.json');
      const allLedgerEntries = await response.json();
      
      studentIds.forEach(studentId => {
        const cacheKey = `ledger-${studentId}`;
        
        if (useCache && this.cache.has(cacheKey)) {
          results[studentId] = this.cache.get(cacheKey);
        } else {
          const studentEntries = allLedgerEntries
            .filter(entry => entry.studentId === studentId)
            .sort((a, b) => new Date(a.date) - new Date(b.date));
          
          results[studentId] = studentEntries;
          this.cache.set(cacheKey, studentEntries);
        }
      });

      return studentIds.length === 1 ? results[studentIds[0]] : results;
    } catch (error) {
      console.error('Error fetching ledger entries:', error);
      return studentIds.length === 1 ? [] : {};
    }
  }

  // Optimized dashboard stats with smart caching
  async getDashboardStats(options = {}) {
    const { useCache = true } = options;
    const cacheKey = 'dashboard-stats';

    if (useCache && this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    try {
      // Parallel data fetching for better performance
      const [studentsData, ledgerResponse, paymentsData] = await Promise.all([
        this.getStudents({ useCache: true }),
        fetch('/src/data/ledger.json'),
        this.getRecentPayments()
      ]);

      const ledgerData = await ledgerResponse.json();
      const stats = this.calculateDashboardStats(studentsData, ledgerData, paymentsData);
      
      // Cache result
      this.cache.set(cacheKey, stats);
      
      return stats;
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      return this.getDefaultStats();
    }
  }

  calculateDashboardStats(studentsData, ledgerData, paymentsData) {
    const students = studentsData.data || studentsData;
    
    const totalStudents = students.length;
    const activeStudents = students.filter(s => s.status === 'active').length;
    const checkedOutStudents = students.filter(s => s.isCheckedOut).length;
    
    const totalCollected = ledgerData
      .filter(entry => entry.type === 'Payment')
      .reduce((sum, entry) => sum + (entry.credit || 0), 0);
    
    const totalDues = ledgerData
      .reduce((sum, entry) => sum + (entry.debit || 0) - (entry.credit || 0), 0);

    const thisMonth = new Date().getMonth();
    const thisYear = new Date().getFullYear();
    
    const thisMonthCollection = ledgerData
      .filter(entry => {
        const entryDate = new Date(entry.date);
        return entry.type === 'Payment' && 
               entryDate.getMonth() === thisMonth && 
               entryDate.getFullYear() === thisYear;
      })
      .reduce((sum, entry) => sum + (entry.credit || 0), 0);

    return {
      totalStudents,
      activeStudents,
      checkedOutStudents,
      totalCollected,
      totalDues: Math.max(0, totalDues),
      thisMonthCollection,
      occupancyRate: totalStudents > 0 ? (activeStudents / totalStudents * 100).toFixed(1) : 0,
      averageMonthlyFee: students.length > 0 ? students.reduce((sum, s) => sum + (s.baseMonthlyFee || 0), 0) / students.length : 0,
      lastUpdated: new Date().toISOString()
    };
  }

  getDefaultStats() {
    return {
      totalStudents: 0,
      activeStudents: 0,
      checkedOutStudents: 0,
      totalCollected: 0,
      totalDues: 0,
      thisMonthCollection: 0,
      occupancyRate: 0,
      averageMonthlyFee: 0,
      lastUpdated: new Date().toISOString()
    };
  }

  // Subscription system for real-time updates
  subscribe(key, callback) {
    if (!this.subscriptions.has(key)) {
      this.subscriptions.set(key, new Set());
    }
    this.subscriptions.get(key).add(callback);

    // Return unsubscribe function
    return () => {
      const callbacks = this.subscriptions.get(key);
      if (callbacks) {
        callbacks.delete(callback);
        if (callbacks.size === 0) {
          this.subscriptions.delete(key);
        }
      }
    };
  }

  notifySubscribers(key, data) {
    const callbacks = this.subscriptions.get(key);
    if (callbacks) {
      callbacks.forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error('Subscriber callback error:', error);
        }
      });
    }
  }

  // Utility methods
  invalidateCache(pattern) {
    if (pattern.includes('*')) {
      const prefix = pattern.replace('*', '');
      for (const key of this.cache.keys()) {
        if (key.startsWith(prefix)) {
          this.cache.delete(key);
        }
      }
    } else {
      this.cache.delete(pattern);
    }
  }

  async getRecentPayments() {
    // Placeholder for recent payments data
    return [];
  }

  // Performance metrics
  getPerformanceMetrics() {
    return {
      cacheSize: this.cache.size,
      subscriptions: this.subscriptions.size,
      realTimeConnections: this.realTimeConnections.size
    };
  }
}

// Export singleton instance
export const optimizedDataService = new OptimizedDataService();