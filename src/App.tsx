
import { Suspense, lazy, useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AppProvider } from "@/contexts/AppContext";

// Lazy load components for better initial load performance
const Landing = lazy(() => import("./pages/Landing"));
const Index = lazy(() => import("./pages/Index"));
const Ledger = lazy(() => import("./pages/Ledger"));
const HostelProfile = lazy(() => import("./pages/HostelProfile"));
const BookingRequests = lazy(() => import("./pages/BookingRequests"));
const RoomManagement = lazy(() => import("./pages/RoomManagement"));
const Analytics = lazy(() => import("./pages/Analytics"));
const Settings = lazy(() => import("./pages/Settings"));
const AdminCharging = lazy(() => import("./pages/AdminCharging"));
const MonthlyBilling = lazy(() => import("./pages/MonthlyBilling"));
const NotFound = lazy(() => import("./pages/NotFound"));

// Optimized QueryClient configuration
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes
      retry: 3,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
    },
    mutations: {
      retry: 2,
    },
  },
});

// Loading component with skeleton
const LoadingFallback = ({ componentName }: { componentName?: string }) => (
  <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 flex items-center justify-center">
    <div className="text-center space-y-4">
      <div className="w-16 h-16 bg-gradient-to-br from-[#07A64F] to-[#1295D0] rounded-2xl flex items-center justify-center shadow-lg shadow-[#07A64F]/30 mx-auto animate-pulse">
        <span className="text-2xl">🏠</span>
      </div>
      <div className="space-y-2">
        <div className="h-4 bg-gray-200 rounded animate-pulse w-32 mx-auto"></div>
        <div className="h-3 bg-gray-100 rounded animate-pulse w-24 mx-auto"></div>
      </div>
      {componentName && (
        <p className="text-sm text-gray-500">Loading {componentName}...</p>
      )}
    </div>
  </div>
);

const App = () => {
  useEffect(() => {
    // Clear any corrupted localStorage data first
    try {
      localStorage.removeItem('clickPatterns');
      console.log('Cleared corrupted localStorage data');
    } catch (error) {
      console.warn('Error clearing localStorage:', error);
    }

    // Initialize mock data for new components
    console.log('App initialized with enhanced features');
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AppProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Suspense fallback={<LoadingFallback />}>
              <Routes>
                <Route
                  path="/"
                  element={
                    <Suspense fallback={<LoadingFallback componentName="Landing" />}>
                      <Landing />
                    </Suspense>
                  }
                />
                <Route
                  path="/admin"
                  element={
                    <Suspense fallback={<LoadingFallback componentName="Admin Dashboard" />}>
                      <Index />
                    </Suspense>
                  }
                />
                <Route
                  path="/hostel"
                  element={
                    <Suspense fallback={<LoadingFallback componentName="Hostel Profile" />}>
                      <HostelProfile />
                    </Suspense>
                  }
                />
                <Route
                  path="/bookings"
                  element={
                    <Suspense fallback={<LoadingFallback componentName="Booking Requests" />}>
                      <BookingRequests />
                    </Suspense>
                  }
                />
                <Route
                  path="/rooms"
                  element={
                    <Suspense fallback={<LoadingFallback componentName="Room Management" />}>
                      <RoomManagement />
                    </Suspense>
                  }
                />
                <Route
                  path="/ledger"
                  element={
                    <Suspense fallback={<LoadingFallback componentName="Ledger" />}>
                      <Ledger />
                    </Suspense>
                  }
                />
                <Route
                  path="/checkout"
                  element={
                    <Suspense fallback={<LoadingFallback componentName="Checkout" />}>
                      <Ledger />
                    </Suspense>
                  }
                />
                <Route
                  path="/analytics"
                  element={
                    <Suspense fallback={<LoadingFallback componentName="Analytics" />}>
                      <Analytics />
                    </Suspense>
                  }
                />
                <Route
                  path="/settings"
                  element={
                    <Suspense fallback={<LoadingFallback componentName="Settings" />}>
                      <Settings />
                    </Suspense>
                  }
                />
                <Route
                  path="/admin/charging"
                  element={
                    <Suspense fallback={<LoadingFallback componentName="Admin Charging" />}>
                      <AdminCharging />
                    </Suspense>
                  }
                />
                <Route
                  path="/billing"
                  element={
                    <Suspense fallback={<LoadingFallback componentName="Monthly Billing" />}>
                      <MonthlyBilling />
                    </Suspense>
                  }
                />
                <Route
                  path="*"
                  element={
                    <Suspense fallback={<LoadingFallback componentName="404 Page" />}>
                      <NotFound />
                    </Suspense>
                  }
                />
              </Routes>
            </Suspense>
          </BrowserRouter>
        </AppProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
