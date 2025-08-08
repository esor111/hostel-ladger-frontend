import { cn } from "@/lib/utils";
import { KahaLogo } from "@/components/ui/KahaLogo";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Home, 
  Users, 
  CreditCard, 
  FileText, 
  Settings, 
  BarChart3,
  Building2,
  Calendar,
  LogOut
} from "lucide-react";

interface ModernSidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  className?: string;
}

export const ModernSidebar = ({ activeTab, onTabChange, className }: ModernSidebarProps) => {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'students', label: 'Students', icon: Users },
    { id: 'billing', label: 'Billing', icon: CreditCard },
    { id: 'invoices', label: 'Invoices', icon: FileText },
    { id: 'payments', label: 'Payments', icon: CreditCard },
    { id: 'reports', label: 'Reports', icon: BarChart3 },
    { id: 'rooms', label: 'Rooms', icon: Building2 },
    { id: 'calendar', label: 'Calendar', icon: Calendar },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <div className={cn("w-64 bg-white border-r border-gray-200 h-full flex flex-col", className)}>
      {/* Logo Section */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <KahaLogo size="md" />
          <div>
            <h2 className="font-bold text-gray-900">Kaha Ledger</h2>
            <p className="text-xs text-gray-500">Management System</p>
          </div>
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 p-4">
        <div className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            
            return (
              <Button
                key={item.id}
                variant={isActive ? "default" : "ghost"}
                className={cn(
                  "w-full justify-start gap-3 h-11",
                  isActive 
                    ? "bg-gradient-to-r from-[#07A64F] to-[#1295D0] text-white shadow-lg" 
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                )}
                onClick={() => onTabChange(item.id)}
              >
                <Icon className="h-5 w-5" />
                {item.label}
                {item.id === 'students' && (
                  <Badge variant="secondary" className="ml-auto">
                    12
                  </Badge>
                )}
              </Button>
            );
          })}
        </div>
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200">
        <Button
          variant="ghost"
          className="w-full justify-start gap-3 text-gray-600 hover:text-gray-900"
        >
          <LogOut className="h-5 w-5" />
          Logout
        </Button>
      </div>
    </div>
  );
};