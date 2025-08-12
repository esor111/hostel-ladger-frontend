
import { cn } from "@/lib/utils";
import { KahaLogo } from "@/components/ui/KahaLogo";

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export const Sidebar = ({ activeTab, onTabChange }: SidebarProps) => {
  const menuItems = [
    {
      id: "dashboard",
      label: "📊 Dashboard",
      description: "Overview & Stats"
    },
    {
      id: "students",
      label: "👥 Student Management",
      description: "Profiles & Fee Setup"
    },
    {
      id: "payments",
      label: "💰 Payment Recording",
      description: "Log & Apply Payments"
    },
    {
      id: "ledger",
      label: "📋 Student Ledger",
      description: "Individual Ledger View"
    },
    {
      id: "billing",
      label: "⚡ Automated Billing",
      description: "Monthly & Prorated Billing"
    },
    {
      id: "discounts",
      label: "🏷️ Discount Management",
      description: "Manage Discounts & Offers"
    },
    {
      id: "admin-charging",
      label: "⚡ Admin Charging",
      description: "Manual Charge Management"
    },
    {
      id: "checkout",
      label: "🚪 Student Checkout",
      description: "Complete Checkout Process"
    }
  ];

  return (
    <div className="w-64 bg-gradient-to-b from-white to-gray-50 shadow-xl border-r border-gray-200">
      <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-green-50 to-blue-50">
        <div className="flex items-center gap-3 mb-2">
          <KahaLogo size="sm" />
          <div>
            <h2 className="font-bold text-lg bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
              KLedger
            </h2>
            <p className="text-xs text-gray-600">Financial Hub</p>
          </div>
        </div>
      </div>
      
      <nav className="p-4 space-y-3">
        {menuItems.map((item, index) => {
          const gradients = [
            'from-blue-500 to-blue-600',
            'from-purple-500 to-purple-600',
            'from-green-500 to-green-600',
            'from-orange-500 to-orange-600',
            'from-pink-500 to-pink-600',
            'from-indigo-500 to-indigo-600',
            'from-red-500 to-red-600'
          ];
          
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={cn(
                "group w-full text-left p-4 rounded-xl transition-all duration-300 transform hover:scale-102",
                activeTab === item.id
                  ? "bg-gradient-to-r from-green-50 to-blue-50 text-green-700 border border-green-200 shadow-lg scale-105"
                  : "text-gray-700 hover:bg-white hover:shadow-md"
              )}
            >
              <div className="flex items-center gap-3">
                <div className={cn(
                  "p-2 rounded-lg transition-all duration-300",
                  activeTab === item.id
                    ? `bg-gradient-to-br ${gradients[index]} text-white shadow-lg`
                    : `bg-gray-100 group-hover:bg-gradient-to-br group-hover:${gradients[index]} group-hover:text-white`
                )}>
                  <span className="text-sm">{item.label.split(' ')[0]}</span>
                </div>
                <div className="flex-1">
                  <div className="font-semibold">{item.label.substring(2)}</div>
                  <div className="text-xs text-gray-500 mt-1">{item.description}</div>
                </div>
                {activeTab === item.id && (
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                )}
              </div>
            </button>
          );
        })}
      </nav>
    </div>
  );
};
