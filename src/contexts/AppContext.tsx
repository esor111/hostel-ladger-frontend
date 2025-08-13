
import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { studentService } from '@/services/studentService';
import { bookingService } from '@/services/bookingService';
import { ledgerService } from '@/services/ledgerService';
import { invoiceService } from '@/services/invoiceService';

interface Student {
  id: string;
  name: string;
  phone: string;
  email: string;
  roomNumber: string;
  guardianName: string;
  guardianPhone: string;
  address: string;
  baseMonthlyFee: number;
  laundryFee: number;
  foodFee: number;
  enrollmentDate: string;
  status: 'Active' | 'Inactive';
  currentBalance: number;
  advanceBalance: number;
  emergencyContact: string;
  course: string;
  institution: string;
}

interface BookingRequest {
  id: string;
  name: string;
  phone: string;
  email: string;
  guardianName: string;
  guardianPhone: string;
  preferredRoom: string;
  course: string;
  institution: string;
  requestDate: string;
  checkInDate: string;
  duration: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  notes: string;
  emergencyContact: string;
  address: string;
  idProofType: string;
  idProofNumber: string;
}

interface Invoice {
  id: string;
  studentId: string;
  month: string;
  total: number;
  status: 'Paid' | 'Unpaid' | 'Partially Paid';
  dueDate: string;
}

interface AppState {
  students: Student[];
  bookingRequests: BookingRequest[];
  invoices: Invoice[];
  loading: boolean;
  lastUpdate: number;
}

type AppAction = 
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_STUDENTS'; payload: Student[] }
  | { type: 'SET_BOOKING_REQUESTS'; payload: BookingRequest[] }
  | { type: 'SET_INVOICES'; payload: Invoice[] }
  | { type: 'ADD_STUDENT'; payload: Student }
  | { type: 'UPDATE_BOOKING_STATUS'; payload: { id: string; status: string } }
  | { type: 'REFRESH_DATA' };

const initialState: AppState = {
  students: [],
  bookingRequests: [],
  invoices: [],
  loading: true,
  lastUpdate: Date.now()
};

function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_STUDENTS':
      return { ...state, students: action.payload };
    case 'SET_BOOKING_REQUESTS':
      return { ...state, bookingRequests: action.payload };
    case 'SET_INVOICES':
      return { ...state, invoices: action.payload };
    case 'ADD_STUDENT':
      return { ...state, students: [...state.students, action.payload] };
    case 'UPDATE_BOOKING_STATUS':
      return {
        ...state,
        bookingRequests: state.bookingRequests.map(req =>
          req.id === action.payload.id 
            ? { ...req, status: action.payload.status as any }
            : req
        )
      };
    case 'REFRESH_DATA':
      return { ...state, lastUpdate: Date.now() };
    default:
      return state;
  }
}

interface AppContextType {
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
  refreshAllData: () => Promise<void>;
  approveBooking: (bookingId: string, roomAssignment: string) => Promise<boolean>;
  getStudentById: (id: string) => Student | undefined;
  getStudentInvoices: (studentId: string) => Invoice[];
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  const refreshAllData = async () => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const [students, bookings, invoices] = await Promise.all([
        studentService.getStudents(),
        bookingService.getBookingRequests(),
        invoiceService.getInvoices()
      ]);
      
      dispatch({ type: 'SET_STUDENTS', payload: students });
      dispatch({ type: 'SET_BOOKING_REQUESTS', payload: bookings });
      dispatch({ type: 'SET_INVOICES', payload: invoices });
      dispatch({ type: 'REFRESH_DATA' });
    } catch (error) {
      console.error('Error refreshing data:', error);
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const approveBooking = async (bookingId: string, roomAssignment: string): Promise<boolean> => {
    try {
      const result = await bookingService.approveBookingRequest(bookingId, roomAssignment);
      if (result) {
        dispatch({ type: 'UPDATE_BOOKING_STATUS', payload: { id: bookingId, status: 'Approved' } });
        dispatch({ type: 'ADD_STUDENT', payload: result.student });
        await refreshAllData(); // Refresh to get the latest invoices
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error approving booking:', error);
      return false;
    }
  };

  const getStudentById = (id: string): Student | undefined => {
    return Array.isArray(state.students) ? state.students.find(student => student.id === id) : undefined;
  };

  const getStudentInvoices = (studentId: string): Invoice[] => {
    return state.invoices.filter(invoice => invoice.studentId === studentId);
  };

  useEffect(() => {
    refreshAllData();
  }, []);

  const contextValue: AppContextType = {
    state,
    dispatch,
    refreshAllData,
    approveBooking,
    getStudentById,
    getStudentInvoices
  };

  return (
    <AppContext.Provider value={contextValue}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (context === undefined) {
    console.error('useAppContext called outside of AppProvider. Component tree:', new Error().stack);
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
}
