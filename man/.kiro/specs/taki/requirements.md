# API Integration Requirements

## Project Overview
Transform `kaha-hostel-control-center` from mock data to real API integration while maintaining exact UI/UX and leveraging patterns from `hostel-ladger-frontend` reference implementation.

## Core Principles
- **UI Unchanged**: Keep exact same design, layout, and user flows
- **Reference-Based**: Use `hostel-ladger-frontend` API patterns and data structures
- **Module-by-Module**: Complete one module 100% before moving to next
- **Test-First**: Write comprehensive tests before implementation
- **Quality Assured**: Zero regressions, bulletproof error handling

## User Stories

### Epic 1: Students Module (Priority 1)
**As a hostel administrator, I want to manage student data through real APIs**

#### US-1.1: View Students List
- **Given** I am on the students page
- **When** the page loads
- **Then** I should see real student data from `/students` API
- **And** the UI should look exactly the same as current mock version
- **And** loading states should be shown during API calls
- **And** error messages should be user-friendly if API fails

#### US-1.2: Search Students
- **Given** I am viewing the students list
- **When** I type in the search box
- **Then** the system should call `/students?search={term}` API
- **And** results should filter in real-time
- **And** search should work on name, phone, email fields

#### US-1.3: Create New Student
- **Given** I click "Add Student" button
- **When** I fill the form and submit
- **Then** the system should POST to `/students` API
- **And** the new student should appear in the list
- **And** success message should be shown

#### US-1.4: Update Student Information
- **Given** I click edit on a student
- **When** I modify data and save
- **Then** the system should PUT to `/students/{id}` API
- **And** changes should be reflected immediately
- **And** optimistic updates should be implemented

#### US-1.5: Delete Student
- **Given** I click delete on a student
- **When** I confirm the deletion
- **Then** the system should DELETE to `/students/{id}` API
- **And** student should be removed from list
- **And** confirmation dialog should be shown

### Epic 2: Dashboard Module (Priority 2)
**As a hostel administrator, I want to see real-time dashboard statistics**

#### US-2.1: Dashboard Statistics
- **Given** I am on the dashboard
- **When** the page loads
- **Then** I should see real statistics from `/dashboard/stats` API
- **And** student count should be clickable and navigate to students page
- **And** all metrics should update in real-time

#### US-2.2: Recent Activity
- **Given** I am viewing the dashboard
- **When** the page loads
- **Then** I should see recent activities from `/dashboard/recent-activity` API
- **And** activities should be properly formatted and timestamped

### Epic 3: Payments Module (Priority 3)
**As a hostel administrator, I want to manage payments through real APIs**

#### US-3.1: View Payments
- **Given** I am on the payments page
- **When** the page loads
- **Then** I should see real payment data from `/payments` API
- **And** payments should be properly formatted with currency

#### US-3.2: Record Payment
- **Given** I want to record a new payment
- **When** I fill the payment form and submit
- **Then** the system should POST to `/payments` API
- **And** payment should appear in the list immediately

### Epic 4: Ledger Module (Priority 4)
**As a hostel administrator, I want to view financial ledger data**

#### US-4.1: View Ledger Entries
- **Given** I am on the ledger page
- **When** the page loads
- **Then** I should see real ledger data from `/ledger` API
- **And** entries should be properly categorized and calculated

### Epic 5: Admin Charges Module (Priority 5)
**As a hostel administrator, I want to manage administrative charges**

#### US-5.1: View Admin Charges
- **Given** I am on the admin charges page
- **When** the page loads
- **Then** I should see real charges from `/admin/charges` API

### Epic 6: Analytics Module (Priority 6)
**As a hostel administrator, I want to view analytics and reports**

#### US-6.1: Monthly Analytics
- **Given** I am on the analytics page
- **When** the page loads
- **Then** I should see real analytics data with proper visualizations

### Epic 7: Booking Requests Module (Priority 7)
**As a hostel administrator, I want to manage booking requests**

#### US-7.1: View Booking Requests
- **Given** I am on the booking requests page
- **When** the page loads
- **Then** I should see real booking data from booking APIs

### Epic 8: Notifications Module (Priority 8)
**As a hostel administrator, I want to manage notifications**

#### US-8.1: View Notifications
- **Given** I am on the notifications page
- **When** the page loads
- **Then** I should see real notification data

### Epic 9: Room Management Module (Priority 9)
**As a hostel administrator, I want to manage room information**

#### US-9.1: View Rooms
- **Given** I am on the room management page
- **When** the page loads
- **Then** I should see real room data from `/rooms` API

## Technical Requirements

### API Integration Patterns (From Reference)
- Use centralized `ApiService` class for all HTTP requests
- Implement proper error handling with user-friendly messages
- Handle different NestJS response formats: `{ status, data }`, `{ status, result }`, `{ status, stats }`
- Use environment-based configuration for API endpoints
- Implement request/response logging for debugging

### Data Handling
- Maintain exact same data structures as current mock data
- Transform API responses to match current component expectations
- Implement proper TypeScript interfaces for all data models
- Handle pagination, filtering, and sorting consistently

### Error Handling
- Network errors should show "Connection failed" messages
- API errors should show server-provided error messages
- Validation errors should highlight specific form fields
- Implement retry mechanisms for failed requests
- Graceful degradation when APIs are unavailable

### Performance Requirements
- API calls should not be slower than current mock data loading
- Implement loading states for all async operations
- Use optimistic updates where appropriate
- Implement proper caching strategies
- Debounce search inputs to avoid excessive API calls

### Testing Requirements
- Unit tests for all service classes (90% coverage)
- Integration tests for API endpoints
- Component tests for UI interactions
- End-to-end tests for critical user flows
- Performance tests to ensure no regressions

## Acceptance Criteria

### Module Completion Criteria
A module is considered complete when:
- ✅ All API integrations work correctly
- ✅ UI looks and behaves exactly the same
- ✅ All tests pass (unit, integration, e2e)
- ✅ Error handling is comprehensive
- ✅ Performance is maintained or improved
- ✅ Code quality meets standards (TypeScript, ESLint)
- ✅ Documentation is updated

### Quality Gates
- Zero console errors in browser
- Zero TypeScript compilation errors
- All ESLint rules pass
- 90%+ test coverage
- No visual regressions
- API response times < 500ms
- Proper loading states implemented
- User-friendly error messages

## Reference Implementation Patterns

### API Service Structure (From hostel-ladger-frontend)
```typescript
// Centralized API service with proper error handling
class ApiService {
  async request<T>(endpoint: string, options: RequestInit): Promise<T>
  async get<T>(endpoint: string, params?: Record<string, any>): Promise<T>
  async post<T>(endpoint: string, data?: any): Promise<T>
  async put<T>(endpoint: string, data?: any): Promise<T>
  async delete<T>(endpoint: string): Promise<T>
}
```

### Service Layer Pattern
```typescript
// Module-specific service classes
export const studentsApiService = {
  async getStudents(filters = {}): Promise<Student[]>
  async getStudentById(id: string): Promise<Student>
  async createStudent(data: CreateStudentDto): Promise<Student>
  async updateStudent(id: string, data: UpdateStudentDto): Promise<Student>
  async deleteStudent(id: string): Promise<void>
}
```

### Environment Configuration
```typescript
// Environment-based API configuration
export const API_CONFIG = {
  BASE_URL: 'http://localhost:3001/hostel/api/v1',
  TIMEOUT: 30000,
  RETRY_ATTEMPTS: 3
}
```

## Success Metrics
- All 9 modules successfully integrated with real APIs
- Zero UI/UX changes from current implementation
- 100% test pass rate
- Zero production bugs
- API response times within acceptable limits
- User satisfaction maintained or improved