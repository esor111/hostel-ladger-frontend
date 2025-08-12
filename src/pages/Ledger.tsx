import { useState, useEffect, Suspense, lazy } from "react";
import { Sidebar } from "@/components/ledger/Sidebar";
import { Dashboard } from "@/components/ledger/Dashboard";
import { PerformanceMonitor } from "@/components/common/PerformanceMonitor";

// Lazy load heavy components for better performance
const StudentManagement = lazy(() => import("@/components/ledger/StudentManagement").then(module => ({ default: module.StudentManagement })));
const PaymentRecording = lazy(() => import("@/components/ledger/PaymentRecording"));
const StudentLedgerView = lazy(() => import("@/components/ledger/StudentLedgerView").then(module => ({ default: module.StudentLedgerView })));
const DiscountManagement = lazy(() => import("@/components/ledger/DiscountManagement").then(module => ({ default: module.DiscountManagement })));
const BillingManagement = lazy(() => import("@/components/ledger/BillingManagement").then(module => ({ default: module.BillingManagement })));
const AdminCharging = lazy(() => import("@/components/ledger/AdminCharging").then(module => ({ default: module.AdminCharging })));
const StudentCheckoutManagement = lazy(() => import("@/components/ledger/StudentCheckoutManagement").then(module => ({ default: module.StudentCheckoutManagement })));

import { useLanguage } from "@/hooks/useLanguage";
import { Button } from "@/components/ui/button";
import { useNavigate, useLocation } from "react-router-dom";
import { KahaLogo } from "@/components/common/KahaLogo";

// Loading component for lazy-loaded sections
const SectionLoader = ({ sectionName }: { sectionName: string }) => (
  <div className="flex items-center justify-center h-64">
    <div className="text-center space-y-4">
      <KahaLogo size="md" animated className="mx-auto" />
      <div className="space-y-2">
        <div className="h-4 bg-gray-200 rounded animate-pulse w-32 mx-auto"></div>
        <div className="h-3 bg-gray-100 rounded animate-pulse w-24 mx-auto"></div>
      </div>
      <p className="text-sm text-gray-500">Loading {sectionName}...</p>
    </div>
  </div>
);

const Ledger = () => {
  const [activeTab, setActiveTab] = useState("dashboard");
  const { language, translations } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();

  // Handle URL parameters for direct navigation
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const section = params.get('section');
    if (section) {
      const sectionMap: Record<string, string> = {
        'dashboard': 'dashboard',
        'students': 'students',
        'payments': 'payments',
        'ledger': 'ledger',
        'ledgers': 'ledger',
        'discounts': 'discounts',
        'billing': 'billing',
        'admin-charging': 'admin-charging',
        'checkout': 'checkout'
      };
      if (sectionMap[section]) {
        setActiveTab(sectionMap[section]);
      }
    }
  }, [location.search]);

  const renderContent = () => {
    switch (activeTab) {
      case "dashboard":
        return <Dashboard />;
      case "students":
        return (
          <Suspense fallback={<SectionLoader sectionName="Student Management" />}>
            <StudentManagement />
          </Suspense>
        );
      case "payments":
        return (
          <Suspense fallback={<SectionLoader sectionName="Payment Recording" />}>
            <PaymentRecording />
          </Suspense>
        );
      case "ledger":
        return (
          <Suspense fallback={<SectionLoader sectionName="Student Ledger" />}>
            <StudentLedgerView />
          </Suspense>
        );
      case "discounts":
        return (
          <Suspense fallback={<SectionLoader sectionName="Discount Management" />}>
            <DiscountManagement />
          </Suspense>
        );
      case "billing":
        return (
          <Suspense fallback={<SectionLoader sectionName="Billing Management" />}>
            <BillingManagement />
          </Suspense>
        );
      case "admin-charging":
        return (
          <Suspense fallback={<SectionLoader sectionName="Admin Charging" />}>
            <AdminCharging />
          </Suspense>
        );
      case "checkout":
        return (
          <Suspense fallback={<SectionLoader sectionName="Student Checkout" />}>
            <StudentCheckoutManagement />
          </Suspense>
        );
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 flex relative overflow-hidden">
      {/* Ambient Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-[#07A64F]/10 to-[#1295D0]/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-[#1295D0]/10 to-[#07A64F]/10 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-[#07A64F]/5 to-[#1295D0]/5 rounded-full blur-3xl"></div>
      </div>

      <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />
      
      <div className="flex-1 flex flex-col relative z-10">
        {/* Premium Glass Header */}
        <div className="bg-white/80 backdrop-blur-xl border-b border-white/20 shadow-lg shadow-black/5 px-8 py-6 relative">
          {/* Subtle gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#07A64F]/5 via-transparent to-[#1295D0]/5 pointer-events-none"></div>
          
          <div className="flex justify-between items-center relative z-10">
            <div className="flex items-center space-x-6">
              {/* Enhanced Logo with Glow Effect */}
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-[#07A64F]/20 to-[#1295D0]/20 rounded-2xl blur-lg"></div>
                <div className="relative w-14 h-14 bg-white rounded-2xl shadow-lg shadow-black/10 p-2 border border-white/50">
                  <KahaLogo size="sm" />
                </div>
              </div>
              
              {/* Enhanced Title Section */}
              <div className="space-y-1">
                <h1 className="text-3xl font-bold bg-gradient-to-r from-[#07A64F] via-[#1295D0] to-[#07A64F] bg-clip-text text-transparent tracking-tight">
                  Kaha KLedger
                </h1>
                <p className="text-slate-600 font-medium">
                  Advanced Hostel Financial Management System
                </p>
              </div>
            </div>

            {/* Enhanced Action Buttons */}
            <div className="flex items-center space-x-4">
              <Button
                onClick={() => navigate('/')}
                variant="outline"
                className="border-[#1295D0]/30 text-[#1295D0] hover:bg-[#1295D0]/10 hover:border-[#1295D0]/50 backdrop-blur-sm"
              >
                ← Back to Admin Panel
              </Button>
            </div>
          </div>

          {/* Breadcrumb Navigation */}
          <div className="mt-4 flex items-center space-x-2 text-sm relative z-10">
            <span className="text-slate-500">Admin Panel</span>
            <span className="text-[#1295D0]">›</span>
            <span className="text-[#07A64F] font-medium">Kaha KLedger</span>
            <span className="text-[#1295D0]">›</span>
            <span className="capitalize text-slate-700 font-medium">
              {activeTab === 'ledger' ? 'Student Ledgers' : activeTab}
            </span>
          </div>
        </div>

        {/* Premium Content Area */}
        <div className="flex-1 p-8 bg-gradient-to-br from-white/50 via-slate-50/30 to-white/50 backdrop-blur-sm relative overflow-hidden">
          {/* Content Background Elements */}
          <div className="absolute inset-0 bg-gradient-to-br from-[#07A64F]/2 via-transparent to-[#1295D0]/2 pointer-events-none"></div>
          
          <div className="relative z-10">
            {renderContent()}
          </div>
        </div>

        {/* Performance Monitor */}
        <PerformanceMonitor />
      </div>
    </div>
  );
};

export default Ledger;