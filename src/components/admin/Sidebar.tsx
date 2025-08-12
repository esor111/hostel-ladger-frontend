
import { 
  LayoutDashboard, 
  Building2, 
  CalendarCheck, 
  Bed, 
  BarChart3, 
  Settings,
  Mountain,
  BookOpen,
  Users,
  Receipt,
  CreditCard,
  FileText,
  TrendingUp,
  Zap
} from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { KahaLogo } from "@/components/ui/KahaLogo";

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export const Sidebar = ({ activeTab, onTabChange }: SidebarProps) => {
  const { translations } = useLanguage();
  const [expandedSection, setExpandedSection] = useState<string | null>(null);

  const mainMenuItems = [
    { id: "dashboard", label: translations.dashboard, icon: LayoutDashboard },
    { id: "profile", label: translations.hostelProfile, icon: Building2 },
    { id: "bookings", label: translations.bookings, icon: CalendarCheck },
    { id: "rooms", label: translations.rooms, icon: Bed },
    { id: "analytics", label: translations.analytics, icon: BarChart3 },
  ];

  const adminMenuItems = [
    { id: "charging", label: "Admin Charging", icon: Zap, path: "/admin/charging" },
  ];

  const ledgerSubItems = [
    { id: "ledger-dashboard", label: "📊 Dashboard", icon: TrendingUp },
    { id: "ledger-students", label: "👥 Student Profiles", icon: Users },
    { id: "ledger-invoices", label: "📋 Invoices", icon: Receipt },
    { id: "ledger-payments", label: "💰 Payments", icon: CreditCard },
    { id: "ledger-ledgers", label: "📚 Ledgers", icon: FileText },
    { id: "ledger-discounts", label: "🏷️ Discounts", icon: Settings },
  ];

  const handleLedgerToggle = () => {
    if (expandedSection === "ledger") {
      setExpandedSection(null);
    } else {
      setExpandedSection("ledger");
    }
  };

  const handleLedgerSubItemClick = (subId: string) => {
    // Navigate to the ledger page with the specific section
    window.location.href = `/ledger?section=${subId.replace('ledger-', '')}`;
  };

  return (
    <div className="w-64 bg-gradient-to-b from-white to-gray-50 shadow-xl border-r border-gray-200 min-h-screen">
      <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-[#07A64F]/10 to-[#1295D0]/10">
        <div className="flex items-center gap-3">
          <KahaLogo size="md" />
          <div>
            <h2 className="text-xl font-bold bg-gradient-to-r from-[#07A64F] to-[#1295D0] bg-clip-text text-transparent">
              Kaha
            </h2>
            <p className="text-xs text-gray-600 font-medium">Control Center</p>
          </div>
        </div>
      </div>
      
      <nav className="p-4 space-y-3">
        {/* Enhanced Main Menu Items */}
        {mainMenuItems.map((item, index) => {
          const Icon = item.icon;
          const gradients = [
            'from-[#1295D0] to-[#1295D0]/80',
            'from-[#07A64F] to-[#07A64F]/80',
            'from-[#1295D0] to-[#07A64F]',
            'from-[#07A64F] to-[#1295D0]',
            'from-[#1295D0]/80 to-[#07A64F]/80'
          ];
          
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`group w-full flex items-center gap-4 px-4 py-3 rounded-xl text-left transition-all duration-300 ${
                activeTab === item.id
                  ? "bg-gradient-to-r from-[#1295D0]/10 to-[#07A64F]/10 text-[#1295D0] border border-[#1295D0]/30 shadow-md transform scale-105"
                  : "text-gray-600 hover:bg-white hover:text-gray-900 hover:shadow-md hover:scale-102"
              }`}
            >
              <div className={`p-2 rounded-lg transition-all duration-300 ${
                activeTab === item.id 
                  ? `bg-gradient-to-br ${gradients[index]} text-white shadow-lg` 
                  : `bg-gray-100 group-hover:bg-gradient-to-br group-hover:${gradients[index]} group-hover:text-white`
              }`}>
                <Icon className="h-4 w-4" />
              </div>
              <span className="font-semibold">{item.label}</span>
              {activeTab === item.id && (
                <div className="ml-auto w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
              )}
            </button>
          );
        })}

        {/* Enhanced Admin Tools Section */}
        {adminMenuItems.length > 0 && (
          <div className="border-t border-gray-200 pt-6 mt-6">
            <div className="mb-3">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-4">Admin Tools</p>
            </div>
            {adminMenuItems.map((item, index) => {
              const Icon = item.icon;
              const adminGradients = [
                'from-[#07A64F] to-[#07A64F]/80',
                'from-[#1295D0] to-[#1295D0]/80'
              ];
              
              return (
                <button
                  key={item.id}
                  onClick={() => window.location.href = item.path}
                  className={`group w-full flex items-center gap-4 px-4 py-3 rounded-xl text-left transition-all duration-300 mb-2 ${
                    activeTab === item.id
                      ? "bg-gradient-to-r from-purple-50 to-indigo-50 text-purple-700 border border-purple-200 shadow-md transform scale-105"
                      : "text-gray-600 hover:bg-white hover:text-gray-900 hover:shadow-md hover:scale-102"
                  }`}
                >
                  <div className={`p-2 rounded-lg transition-all duration-300 ${
                    activeTab === item.id 
                      ? `bg-gradient-to-br ${adminGradients[index]} text-white shadow-lg` 
                      : `bg-gray-100 group-hover:bg-gradient-to-br group-hover:${adminGradients[index]} group-hover:text-white`
                  }`}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <span className="font-semibold">{item.label}</span>
                  {activeTab === item.id && (
                    <div className="ml-auto w-2 h-2 bg-purple-500 rounded-full animate-pulse"></div>
                  )}
                </button>
              );
            })}
          </div>
        )}

        {/* Enhanced Kaha Ledger Section */}
        <div className="border-t border-gray-200 pt-6 mt-6">
          <div className="mb-3">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-4">Financial Hub</p>
          </div>
          <button
            onClick={handleLedgerToggle}
            className={cn(
              "group w-full flex items-center gap-4 px-4 py-3 rounded-xl text-left transition-all duration-300",
              expandedSection === "ledger"
                ? "bg-gradient-to-r from-green-50 to-emerald-50 text-green-700 border border-green-200 shadow-md"
                : "text-gray-600 hover:bg-white hover:text-gray-900 hover:shadow-md"
            )}
          >
            <div className={`p-2 rounded-lg transition-all duration-300 ${
              expandedSection === "ledger"
                ? "bg-gradient-to-br from-green-500 to-green-600 text-white shadow-lg"
                : "bg-gray-100 group-hover:bg-gradient-to-br group-hover:from-green-500 group-hover:to-green-600 group-hover:text-white"
            }`}>
              <BookOpen className="h-4 w-4" />
            </div>
            <div className="flex-1">
              <span className="font-semibold">Kaha KLedger</span>
              <p className="text-xs text-gray-500">Financial Management</p>
            </div>
            <svg
              className={cn(
                "h-4 w-4 transition-transform duration-300",
                expandedSection === "ledger" ? "rotate-180" : ""
              )}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {/* Enhanced Ledger Sub-items */}
          {expandedSection === "ledger" && (
            <div className="mt-3 space-y-2 bg-gradient-to-b from-green-50/50 to-transparent rounded-xl p-2">
              {ledgerSubItems.map((item, index) => {
                const Icon = item.icon;
                const subGradients = [
                  'from-blue-400 to-blue-500',
                  'from-purple-400 to-purple-500',
                  'from-green-400 to-green-500',
                  'from-orange-400 to-orange-500',
                  'from-pink-400 to-pink-500',
                  'from-indigo-400 to-indigo-500'
                ];
                
                return (
                  <button
                    key={item.id}
                    onClick={() => handleLedgerSubItemClick(item.id)}
                    className="group w-full flex items-center gap-3 px-4 py-2 rounded-lg text-left transition-all duration-200 text-sm text-gray-600 hover:bg-white hover:text-gray-900 hover:shadow-sm"
                  >
                    <div className={`p-1.5 rounded-md transition-all duration-200 bg-gray-100 group-hover:bg-gradient-to-br group-hover:${subGradients[index]} group-hover:text-white`}>
                      <Icon className="h-3 w-3" />
                    </div>
                    <span className="font-medium">{item.label}</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Enhanced Settings */}
        <div className="border-t border-gray-200 pt-6 mt-6">
          <button
            onClick={() => onTabChange("settings")}
            className={`group w-full flex items-center gap-4 px-4 py-3 rounded-xl text-left transition-all duration-300 ${
              activeTab === "settings"
                ? "bg-gradient-to-r from-gray-50 to-slate-50 text-gray-700 border border-gray-200 shadow-md transform scale-105"
                : "text-gray-600 hover:bg-white hover:text-gray-900 hover:shadow-md hover:scale-102"
            }`}
          >
            <div className={`p-2 rounded-lg transition-all duration-300 ${
              activeTab === "settings"
                ? "bg-gradient-to-br from-gray-500 to-gray-600 text-white shadow-lg"
                : "bg-gray-100 group-hover:bg-gradient-to-br group-hover:from-gray-500 group-hover:to-gray-600 group-hover:text-white"
            }`}>
              <Settings className="h-4 w-4" />
            </div>
            <span className="font-semibold">{translations.settings}</span>
            {activeTab === "settings" && (
              <div className="ml-auto w-2 h-2 bg-gray-500 rounded-full animate-pulse"></div>
            )}
          </button>
        </div>
      </nav>
    </div>
  );
};
