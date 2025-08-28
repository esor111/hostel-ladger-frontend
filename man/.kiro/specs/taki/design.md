# API Integration Design Document

## Architecture Overview

This document outlines the technical design for integrating `kaha-hostel-control-center` with real APIs while maintaining exact UI/UX and leveraging proven patterns from `hostel-ladger-frontend`.

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Frontend (React + TypeScript)            │
├─────────────────────────────────────────────────────────────┤
│  Components Layer (Unchanged UI)                           │
│  ├── Dashboard Components                                   │
│  ├── Student Management Components                          │
│  ├── Payment Components                                     │
│  └── Analytics Components                                   │
├─────────────────────────────────────────────────────────────┤
│  Service Layer (New API Integration)                       │
│  ├── ApiService (Centralized HTTP Client)                  │
│  ├── StudentsApiService                                     │
│  ├── PaymentsApiService                                     │
│  ├── DashboardApiService                                    │
│  └── [Other Module Services]                               │
├─────────────────────────────────────────────────────────────┤
│  Configuration Layer                                        │
│  ├── Environment Config                                     │
│  ├── API Endpoints                                          │
│  └── Error Handling                                         │
└─────────────────────────────────────────────────────────────┘
                              │
                              │ HTTP/REST
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    Backend (NestJS)                         │
│  http://localhost:3001/hostel/api/v1                       │
└─────────────────────────────────────────────────────────────┘
```

## Core Design Principles

### 1. **Reference-Based Implementation**
- Use `hostel-ladger-frontend` as the authoritative reference for API patterns
- Adopt proven service layer architecture and error handling
- Leverage existing environment configuration patterns
- Maintain consistency with backend API contracts

### 2. **UI Preservation**
- Zero changes to existing component interfaces
- Maintain exact same props and state structures
- Keep all styling and layout unchanged
- Preserve user interaction patterns

### 3. **Service Layer Architecture**
- Centralized `ApiService` for all HTTP operations
- Module-specific service classes for business logic
- Consistent error handling across all services
- Proper TypeScript interfaces for all data models

## Technical Implementation

### API Service Layer

#### Core ApiService (Based on Reference)
```typescript
// src/services/apiService.ts
export class ApiService {
  private static instance: ApiService;
  
  static getInstance(): ApiService {
    if (!ApiService.instance) {
      ApiService.instance = new ApiService();
    }
    return ApiService.instance;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = buildApiUrl(endpoint);
    
    try {
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        ...options,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP ${response.status}`);
      }

      const data = await response.json();
      
      // Handle NestJS response formats
      if (data.data !== undefined) return data.data;
      if (data.result !== undefined) return data.result;
      if (data.stats !== undefined) return data.stats;
      return data;
    } catch (error) {
      console.error(`[API Error] ${options.method || 'GET'} ${url}:`, error);
      throw error;
    }
  }

  async get<T>(endpoint: string, params?: Record<string, any>): Promise<T>
  async post<T>(endpoint: string, data?: any): Promise<T>
  async put<T>(endpoint: string, data?: any): Promise<T>
  async delete<T>(endpoint: string): Promise<T>
}
```

#### Module-Specific Services

##### Students API Service
```typescript
// src/services/studentsApiService.ts
export class StudentsApiService {
  private apiService = ApiService.getInstance();

  async getStudents(filters: StudentFilters = {}): Promise<Student[]> {
    const queryParams = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        queryParams.append(key, String(value));
      }
    });
    
    const endpoint = `/students${queryParams.toString() ? `?${queryParams}` : ''}`;
    const result = await this.apiService.get<Student[] | { items: Student[] }>(endpoint);
    
    // Handle both array and paginated responses
    return Array.isArray(result) ? result : result.items || [];
  }

  async getStudentById(id: string): Promise<Student> {
    return this.apiService.get<Student>(`/students/${id}`);
  }

  async createStudent(studentData: CreateStudentDto): Promise<Student> {
    return this.apiService.post<Student>('/students', studentData);
  }

  async updateStudent(id: string, updateData: UpdateStudentDto): Promise<Student> {
    return this.apiService.put<Student>(`/students/${id}`, updateData);
  }

  async deleteStudent(id: string): Promise<void> {
    return this.apiService.delete<void>(`/students/${id}`);
  }

  async getStudentStats(): Promise<StudentStats> {
    return this.apiService.get<StudentStats>('/students/stats');
  }
}

export const studentsApiService = new StudentsApiService();
```

##### Dashboard API Service
```typescript
// src/services/dashboardApiService.ts
export class DashboardApiService {
  private apiService = ApiService.getInstance();

  async getStats(): Promise<DashboardStats> {
    return this.apiService.get<DashboardStats>('/dashboard/stats');
  }

  async getRecentActivity(limit = 10): Promise<Activity[]> {
    return this.apiService.get<Activity[]>(`/dashboard/recent-activity?limit=${limit}`);
  }

  async getMonthlyRevenue(year?: number, month?: number): Promise<RevenueData> {
    const params = new URLSearchParams();
    if (year) params.append('year', year.toString());
    if (month) params.append('month', month.toString());
    
    const queryString = params.toString();
    return this.apiService.get<RevenueData>(
      `/dashboard/monthly-revenue${queryString ? '?' + queryString : ''}`
    );
  }
}

export const dashboardApiService = new DashboardApiService();
```

### Configuration Layer

#### Environment Configuration (Based on Reference)
```typescript
// src/config/environment.ts
export type Environment = 'localhost' | 'development' | 'production';

export interface EnvironmentConfig {
  apiBaseUrl: string;
  environment: Environment;
  debugMode: boolean;
  logLevel: 'debug' | 'info' | 'warn' | 'error';
}

export const ENVIRONMENT_CONFIGS: Record<Environment, EnvironmentConfig> = {
  localhost: {
    apiBaseUrl: 'http://localhost:3001/hostel/api/v1',
    environment: 'localhost',
    debugMode: true,
    logLevel: 'debug',
  },
  development: {
    apiBaseUrl: 'https://dev.kaha.com.np/hostel/api/v1',
    environment: 'development',
    debugMode: true,
    logLevel: 'info',
  },
  production: {
    apiBaseUrl: 'https://api.kaha.com.np/hostel/api/v1',
    environment: 'production',
    debugMode: false,
    logLevel: 'error',
  },
};

export const getEnvironmentConfig = (): EnvironmentConfig => {
  const currentEnv = (import.meta.env.VITE_ENVIRONMENT as Environment) || 'localhost';
  return ENVIRONMENT_CONFIGS[currentEnv];
};
```

#### API Endpoints Configuration
```typescript
// src/config/api.ts
export const API_ENDPOINTS = {
  STUDENTS: {
    BASE: '/students',
    BY_ID: (id: string) => `/students/${id}`,
    STATS: '/students/stats',
    SEARCH: '/students/search',
  },
  DASHBOARD: {
    STATS: '/dashboard/stats',
    RECENT_ACTIVITY: '/dashboard/recent-activity',
    MONTHLY_REVENUE: '/dashboard/monthly-revenue',
  },
  PAYMENTS: {
    BASE: '/payments',
    BY_ID: (id: string) => `/payments/${id}`,
    BY_STUDENT: (studentId: string) => `/payments/student/${studentId}`,
    STATS: '/payments/stats',
  },
  LEDGER: {
    BASE: '/ledger',
    BY_STUDENT: (studentId: string) => `/ledger/student/${studentId}`,
  },
  // ... other endpoints
};
```

### Data Models & Interfaces

#### Core Data Types
```typescript
// src/types/api.ts
export interface Student {
  id: string;
  name: string;
  phone: string;
  email: string;
  roomNumber?: string;
  status: 'Active' | 'Inactive';
  joinDate: string;
  balance: number;
  // ... other fields matching current mock data
}

export interface CreateStudentDto {
  name: string;
  phone: string;
  email: string;
  roomNumber?: string;
  // ... required fields for creation
}

export interface UpdateStudentDto {
  name?: string;
  phone?: string;
  email?: string;
  roomNumber?: string;
  status?: 'Active' | 'Inactive';
  // ... optional fields for updates
}

export interface DashboardStats {
  totalStudents: number;
  activeStudents: number;
  totalRevenue: number;
  pendingPayments: number;
  // ... other stats matching current dashboard
}

export interface Payment {
  id: string;
  studentId: string;
  studentName: string;
  amount: number;
  paymentMethod: string;
  date: string;
  description: string;
  // ... other fields
}
```

### Error Handling Strategy

#### Centralized Error Handling
```typescript
// src/utils/errorHandler.ts
export class ApiError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public originalError?: any
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export const handleApiError = (error: any): ApiError => {
  if (error instanceof ApiError) {
    return error;
  }
  
  if (error.name === 'TypeError' && error.message.includes('fetch')) {
    return new ApiError('Network connection failed. Please check your internet connection.');
  }
  
  if (error.message?.includes('HTTP 404')) {
    return new ApiError('The requested resource was not found.');
  }
  
  if (error.message?.includes('HTTP 500')) {
    return new ApiError('Server error occurred. Please try again later.');
  }
  
  return new ApiError(error.message || 'An unexpected error occurred.');
};
```

#### Component Error Boundaries
```typescript
// src/components/ErrorBoundary.tsx
export class ApiErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('API Error Boundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-boundary">
          <h2>Something went wrong</h2>
          <p>{this.state.error?.message}</p>
          <button onClick={() => this.setState({ hasError: false, error: null })}>
            Try Again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
```

### Component Integration Strategy

#### Hook-Based Integration
```typescript
// src/hooks/useStudents.ts
export const useStudents = (filters?: StudentFilters) => {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadStudents = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await studentsApiService.getStudents(filters);
      setStudents(data);
    } catch (err) {
      const apiError = handleApiError(err);
      setError(apiError.message);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    loadStudents();
  }, [loadStudents]);

  const createStudent = async (studentData: CreateStudentDto) => {
    try {
      setLoading(true);
      const newStudent = await studentsApiService.createStudent(studentData);
      setStudents(prev => [...prev, newStudent]);
      return newStudent;
    } catch (err) {
      const apiError = handleApiError(err);
      setError(apiError.message);
      throw apiError;
    } finally {
      setLoading(false);
    }
  };

  return {
    students,
    loading,
    error,
    loadStudents,
    createStudent,
    // ... other operations
  };
};
```

#### Component Integration Example
```typescript
// src/components/StudentsList.tsx (Modified to use API)
export const StudentsList: React.FC = () => {
  const { students, loading, error, loadStudents } = useStudents();

  if (loading) {
    return <LoadingSpinner />; // Existing loading component
  }

  if (error) {
    return (
      <ErrorMessage 
        message={error} 
        onRetry={loadStudents} 
      />
    );
  }

  // Rest of component remains exactly the same
  return (
    <div className="students-list">
      {students.map(student => (
        <StudentCard key={student.id} student={student} />
      ))}
    </div>
  );
};
```

## Testing Strategy

### Test Structure
```
src/
├── __tests__/
│   ├── services/
│   │   ├── apiService.test.ts
│   │   ├── studentsApiService.test.ts
│   │   └── dashboardApiService.test.ts
│   ├── hooks/
│   │   ├── useStudents.test.ts
│   │   └── useDashboard.test.ts
│   ├── components/
│   │   ├── StudentsList.test.tsx
│   │   └── Dashboard.test.tsx
│   └── integration/
│       ├── studentsFlow.test.ts
│       └── dashboardFlow.test.ts
```

### Test Implementation Examples

#### Service Tests
```typescript
// src/__tests__/services/studentsApiService.test.ts
describe('StudentsApiService', () => {
  beforeEach(() => {
    fetchMock.resetMocks();
  });

  test('should fetch students successfully', async () => {
    const mockStudents = [{ id: '1', name: 'John Doe' }];
    fetchMock.mockResponseOnce(JSON.stringify({ data: mockStudents }));

    const result = await studentsApiService.getStudents();
    
    expect(result).toEqual(mockStudents);
    expect(fetchMock).toHaveBeenCalledWith(
      'http://localhost:3001/hostel/api/v1/students',
      expect.objectContaining({ method: 'GET' })
    );
  });

  test('should handle API errors gracefully', async () => {
    fetchMock.mockRejectOnce(new Error('Network error'));

    await expect(studentsApiService.getStudents()).rejects.toThrow('Network error');
  });
});
```

#### Integration Tests
```typescript
// src/__tests__/integration/studentsFlow.test.ts
describe('Students Integration Flow', () => {
  test('should complete full CRUD operations', async () => {
    // Test create
    const newStudent = await studentsApiService.createStudent({
      name: 'Test Student',
      phone: '1234567890',
      email: 'test@example.com'
    });
    expect(newStudent.id).toBeDefined();

    // Test read
    const fetchedStudent = await studentsApiService.getStudentById(newStudent.id);
    expect(fetchedStudent.name).toBe('Test Student');

    // Test update
    const updatedStudent = await studentsApiService.updateStudent(newStudent.id, {
      name: 'Updated Student'
    });
    expect(updatedStudent.name).toBe('Updated Student');

    // Test delete
    await studentsApiService.deleteStudent(newStudent.id);
    await expect(studentsApiService.getStudentById(newStudent.id))
      .rejects.toThrow('not found');
  });
});
```

## Performance Considerations

### Optimization Strategies
1. **Request Debouncing**: Debounce search inputs to avoid excessive API calls
2. **Caching**: Implement intelligent caching for frequently accessed data
3. **Pagination**: Handle large datasets with proper pagination
4. **Optimistic Updates**: Update UI immediately for better user experience
5. **Loading States**: Show appropriate loading indicators during API calls

### Caching Implementation
```typescript
// src/utils/cache.ts
class ApiCache {
  private cache = new Map<string, { data: any; timestamp: number; ttl: number }>();

  set(key: string, data: any, ttl = 300000): void { // 5 minutes default
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    });
  }

  get(key: string): any | null {
    const cached = this.cache.get(key);
    if (!cached) return null;

    if (Date.now() - cached.timestamp > cached.ttl) {
      this.cache.delete(key);
      return null;
    }

    return cached.data;
  }
}

export const apiCache = new ApiCache();
```

## Migration Strategy

### Phase-by-Phase Implementation

#### Phase 1: Foundation Setup (Day 1-2)
1. Create core `ApiService` class
2. Set up environment configuration
3. Implement error handling utilities
4. Create test framework setup

#### Phase 2: Students Module (Day 3-7)
1. Implement `StudentsApiService`
2. Create `useStudents` hook
3. Update students components to use API
4. Write comprehensive tests
5. Validate UI remains unchanged

#### Phase 3: Dashboard Module (Day 8-10)
1. Implement `DashboardApiService`
2. Update dashboard components
3. Ensure real-time statistics work
4. Test navigation between dashboard and students

#### Phase 4: Remaining Modules (Day 11-35)
1. Implement remaining service classes
2. Update corresponding components
3. Maintain test coverage
4. Validate each module before proceeding

## Quality Assurance

### Code Quality Standards
- TypeScript strict mode enabled
- ESLint configuration matching reference project
- Prettier for consistent formatting
- 90%+ test coverage requirement
- Zero console errors in production

### Performance Benchmarks
- API response times < 500ms
- UI interactions remain responsive
- No memory leaks in long-running sessions
- Proper cleanup of event listeners and subscriptions

### Security Considerations
- Input validation on all form data
- Proper error message sanitization
- No sensitive data in console logs
- HTTPS enforcement in production
- Proper CORS configuration

This design ensures a systematic, reference-based approach to API integration while maintaining the exact UI/UX of the current implementation.