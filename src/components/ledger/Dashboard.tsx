
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useState, useEffect, memo } from "react";
import { useNavigate } from "react-router-dom";
import { AlertTriangle, User, Calendar, CreditCard } from "lucide-react";
import { ledgerService } from "../../services/ledgerService.js";
import { dashboardService } from "../../services/dashboardService.js";

export const Dashboard = memo(() => {
  const navigate = useNavigate();
  
  // Simple state management
  const [dashboardStats, setDashboardStats] = useState({
    totalStudents: 0,
    totalCollected: 0,
    totalDues: 0,
    thisMonthCollection: 0,
    advanceBalances: 0,
    overdueInvoices: 0
  });
  const [checkedOutWithDues, setCheckedOutWithDues] = useState([]);
  const [loading, setLoading] = useState(true);

  // Load data on mount
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        
        // Load dashboard data from API
        try {
          const [statsData, checkedOutData] = await Promise.all([
            dashboardService.getDashboardStats(),
            dashboardService.getCheckedOutWithDues()
          ]);
          
          setDashboardStats({
            totalStudents: statsData.totalStudents || 0,
            totalCollected: statsData.totalCollected || 0,
            totalDues: statsData.totalDues || 0,
            thisMonthCollection: statsData.thisMonthCollection || 0,
            advanceBalances: statsData.advanceBalances || 0,
            overdueInvoices: statsData.overdueInvoices || 0
          });
          
          setCheckedOutWithDues(checkedOutData || []);
          
        } catch (apiError) {
          console.error('Dashboard API failed, using fallback data:', apiError);
          // Fallback to basic data structure
          setDashboardStats({
            totalStudents: 0,
            totalCollected: 0,
            totalDues: 0,
            thisMonthCollection: 0,
            advanceBalances: 0,
            overdueInvoices: 0
          });
          setCheckedOutWithDues([]);
        }
        
      } catch (error) {
        console.error('Error loading dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Simple stats calculation
  const stats = {
    ...dashboardStats,
    checkedOutWithDues: checkedOutWithDues.length,
    checkedOutDuesAmount: checkedOutWithDues.reduce((sum, student) => sum + (student.outstandingDues || 0), 0)
  };

  return (
    <div className="space-y-8">
      {/* Premium Header */}
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-[#07A64F]/5 via-[#1295D0]/5 to-[#07A64F]/5 rounded-3xl blur-xl"></div>
        <div className="relative bg-white/60 backdrop-blur-xl rounded-3xl p-8 border border-white/20 shadow-2xl shadow-black/5">
          <div className="flex justify-between items-start">
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-gradient-to-br from-[#07A64F] to-[#1295D0] rounded-2xl flex items-center justify-center shadow-lg shadow-[#07A64F]/30">
                  <span className="text-2xl">📊</span>
                </div>
                <div>
                  <h1 className="text-4xl font-bold bg-gradient-to-r from-[#07A64F] via-[#1295D0] to-[#07A64F] bg-clip-text text-transparent tracking-tight">
                    Financial Dashboard
                  </h1>
                  <p className="text-slate-600 font-medium text-lg">
                    Real-time Analytics & Insights
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Premium Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <div className="group relative">
          <div className="absolute inset-0 bg-gradient-to-r from-[#1295D0]/20 to-[#0ea5e9]/20 rounded-3xl blur-xl group-hover:blur-2xl transition-all duration-500"></div>
          <Card className="relative bg-white/70 backdrop-blur-xl border border-white/20 shadow-2xl shadow-[#1295D0]/10 hover:shadow-[#1295D0]/20 transition-all duration-500 group-hover:scale-[1.02] overflow-hidden rounded-3xl">
            <div className="absolute inset-0 bg-gradient-to-br from-[#1295D0]/10 via-transparent to-[#0ea5e9]/10"></div>
            <CardHeader className="relative z-10 pb-2">
              <CardTitle className="text-sm font-semibold flex justify-between items-center text-slate-700">
                <span className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-gradient-to-br from-[#1295D0] to-[#0ea5e9] rounded-xl flex items-center justify-center">
                    <span className="text-white text-sm">👥</span>
                  </div>
                  Total Students
                </span>
                <Button size="sm" variant="ghost" className="text-[#1295D0] hover:bg-[#1295D0]/10 rounded-xl">
                  Manage
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="relative z-10">
              <div className="text-4xl font-bold text-slate-800 mb-2">{stats.totalStudents || 0}</div>
              <p className="text-slate-600 text-sm font-medium">Active residents</p>
              <div className="mt-4 flex items-center gap-2">
                <div className="w-2 h-2 bg-[#1295D0] rounded-full animate-pulse"></div>
                <span className="text-xs text-slate-500">Live count</span>
              </div>
            </CardContent>
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-white/20 to-transparent rounded-full -mr-16 -mt-16"></div>
          </Card>
        </div>

        <div className="group relative">
          <div className="absolute inset-0 bg-gradient-to-r from-[#07A64F]/20 to-[#059669]/20 rounded-3xl blur-xl group-hover:blur-2xl transition-all duration-500"></div>
          <Card className="relative bg-white/70 backdrop-blur-xl border border-white/20 shadow-2xl shadow-[#07A64F]/10 hover:shadow-[#07A64F]/20 transition-all duration-500 group-hover:scale-[1.02] overflow-hidden rounded-3xl">
            <div className="absolute inset-0 bg-gradient-to-br from-[#07A64F]/10 via-transparent to-[#059669]/10"></div>
            <CardHeader className="relative z-10 pb-2">
              <CardTitle className="text-sm font-semibold flex justify-between items-center text-slate-700">
                <span className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-gradient-to-br from-[#07A64F] to-[#059669] rounded-xl flex items-center justify-center">
                    <span className="text-white text-sm">💰</span>
                  </div>
                  Total Collected
                </span>
                <Button size="sm" variant="ghost" className="text-[#07A64F] hover:bg-[#07A64F]/10 rounded-xl">
                  Reports
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="relative z-10">
              <div className="text-4xl font-bold text-slate-800 mb-2">NPR {(stats.totalCollected || 0).toLocaleString()}</div>
              <p className="text-slate-600 text-sm font-medium">All time collection</p>
              <div className="mt-4 flex items-center gap-2">
                <div className="w-2 h-2 bg-[#07A64F] rounded-full animate-pulse"></div>
                <span className="text-xs text-slate-500">Updated now</span>
              </div>
            </CardContent>
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-white/20 to-transparent rounded-full -mr-16 -mt-16"></div>
          </Card>
        </div>

        <div className="group relative">
          <div className="absolute inset-0 bg-gradient-to-r from-red-500/20 to-red-600/20 rounded-3xl blur-xl group-hover:blur-2xl transition-all duration-500"></div>
          <Card className="relative bg-white/70 backdrop-blur-xl border border-white/20 shadow-2xl shadow-red-500/10 hover:shadow-red-500/20 transition-all duration-500 group-hover:scale-[1.02] overflow-hidden rounded-3xl">
            <div className="absolute inset-0 bg-gradient-to-br from-red-500/10 via-transparent to-red-600/10"></div>
            <CardHeader className="relative z-10 pb-2">
              <CardTitle className="text-sm font-semibold flex justify-between items-center text-slate-700">
                <span className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-gradient-to-br from-red-500 to-red-600 rounded-xl flex items-center justify-center">
                    <span className="text-white text-sm">🚨</span>
                  </div>
                  Outstanding Dues
                </span>
                <Button size="sm" variant="ghost" className="text-red-600 hover:bg-red-50 rounded-xl">
                  Follow Up
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="relative z-10">
              <div className="text-4xl font-bold text-slate-800 mb-2">NPR {(stats.totalDues || 0).toLocaleString()}</div>
              <p className="text-slate-600 text-sm font-medium">{stats.overdueInvoices || 0} overdue invoices</p>
              <div className="mt-4 flex items-center gap-2">
                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                <span className="text-xs text-slate-500">Needs attention</span>
              </div>
            </CardContent>
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-white/20 to-transparent rounded-full -mr-16 -mt-16"></div>
          </Card>
        </div>
      </div>

      {/* Students with Outstanding Dues - Compact Version */}
      {loading ? (
        <Card className="border-orange-200 bg-orange-50/30">
          <CardContent className="p-4">
            <div className="flex items-center justify-center space-x-3">
              <div className="relative">
                <svg width="24" height="36" viewBox="0 0 55 83" fill="none" xmlns="http://www.w3.org/2000/svg" className="animate-pulse">
                  <g clipPath="url(#clip0_319_901)">
                    <path d="M27.3935 0.0466309C12.2652 0.0466309 0 12.2774 0 27.3662C0 40.746 7.8608 47.9976 16.6341 59.8356C25.9039 72.3432 27.3935 74.1327 27.3935 74.1327C27.3935 74.1327 31.3013 69.0924 37.9305 59.9483C46.5812 48.0201 54.787 40.746 54.787 27.3662C54.787 12.2774 42.5218 0.0466309 27.3935 0.0466309Z" fill="#f97316"/>
                    <path d="M31.382 79.0185C31.382 81.2169 29.5957 83 27.3935 83C25.1913 83 23.4051 81.2169 23.4051 79.0185C23.4051 76.8202 25.1913 75.0371 27.3935 75.0371C29.5957 75.0371 31.382 76.8202 31.382 79.0185Z" fill="#f97316"/>
                    <path d="M14.4383 33.34C14.4383 33.34 14.0063 32.3905 14.8156 33.0214C15.6249 33.6522 27.3516 47.8399 39.7618 33.2563C39.7618 33.2563 41.0709 31.8047 40.2358 33.4816C39.4007 35.1585 28.1061 50.8718 14.4383 33.34Z" fill="#231F20"/>
                    <path d="M27.3935 47.6498C38.5849 47.6498 47.6548 38.5926 47.6548 27.424C47.6548 16.2554 38.5817 7.19824 27.3935 7.19824C16.2052 7.19824 7.12885 16.2522 7.12885 27.424C7.12885 34.9878 11.2882 41.5795 17.4465 45.0492L13.1389 55.2554C14.2029 56.6233 15.2992 58.0427 16.4083 59.5329L21.7574 46.858C23.5469 47.373 25.4363 47.6498 27.3935 47.6498Z" fill="#ea580c"/>
                    <path d="M45.2334 27.4241C45.2334 37.2602 37.2469 45.2327 27.3935 45.2327C17.5401 45.2327 9.55353 37.2602 9.55353 27.4241C9.55353 17.588 17.5401 9.61548 27.3935 9.61548C37.2437 9.61548 45.2334 17.588 45.2334 27.4241Z" fill="white"/>
                    <path d="M14.4383 33.3398C14.4383 33.3398 14.0063 32.3903 14.8156 33.0211C15.6249 33.652 27.3516 47.8396 39.7618 33.2561C39.7618 33.2561 41.0709 31.8045 40.2358 33.4814C39.4007 35.1583 28.1061 50.8716 14.4383 33.3398Z" fill="#231F20"/>
                  </g>
                  <defs>
                    <clipPath id="clip0_319_901">
                      <rect width="54.787" height="82.9534" fill="white" transform="translate(0 0.0466309)"/>
                    </clipPath>
                  </defs>
                </svg>
                <div className="absolute inset-0 animate-spin rounded-full border border-transparent border-t-orange-500"></div>
              </div>
              <span className="text-orange-700 text-sm font-medium">Loading students with dues...</span>
            </div>
          </CardContent>
        </Card>
      ) : checkedOutWithDues && checkedOutWithDues.length > 0 ? (
        <Card className="border-orange-200/50 bg-gradient-to-br from-orange-50/30 to-red-50/30 shadow-lg">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-red-500 rounded-lg flex items-center justify-center">
                  <AlertTriangle className="h-4 w-4 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-800">Students with Outstanding Dues</h3>
                  <p className="text-slate-600 text-xs">Checked out but payment pending</p>
                </div>
                <Badge className="bg-gradient-to-r from-orange-500 to-red-500 text-white border-0 px-2 py-1 text-xs">
                  {checkedOutWithDues?.length || 0} Student{(checkedOutWithDues?.length || 0) !== 1 ? 's' : ''}
                </Badge>
              </div>
              <div className="text-right">
                <div className="text-xl font-bold text-red-600">
                  NPR {(checkedOutWithDues || []).reduce((sum, student) => sum + (student.outstandingDues || 0), 0).toLocaleString()}
                </div>
                <div className="text-xs text-slate-500">Total Outstanding</div>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {(checkedOutWithDues || []).map((student, index) => (
              <div key={student.studentId || index} className="bg-white/60 backdrop-blur-sm rounded-lg border border-white/50 p-4 hover:shadow-md transition-all duration-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-red-500 rounded-lg flex items-center justify-center text-white font-bold text-sm">
                      {student.studentName?.charAt(0) || 'S'}
                    </div>
                    <div>
                      <h4 className="font-semibold text-slate-800 text-sm">{student.studentName}</h4>
                      <div className="flex items-center gap-4 text-xs text-slate-600">
                        <span className="flex items-center gap-1">
                          <User className="h-3 w-3" />
                          {student.studentId}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {student.roomNumber}
                        </span>
                        <span>
                          Checkout: {new Date(student.checkoutDate).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <div className="text-lg font-bold text-red-600">
                        NPR {student.outstandingDues?.toLocaleString() || '0'}
                      </div>
                      <div className="text-xs text-slate-500">Outstanding</div>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        className="bg-gradient-to-r from-[#07A64F] to-[#059669] hover:from-[#07A64F]/90 hover:to-[#059669]/90 text-white border-0 text-xs px-3 py-1 h-8"
                        onClick={() => {
                          // Navigate to payment recording page with student pre-selected
                          navigate(`/ledger?student=${encodeURIComponent(student.studentId)}&section=payments&amount=${student.outstandingDues}&type=outstanding`);
                        }}
                      >
                        <CreditCard className="h-3 w-3 mr-1" />
                        Pay
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-[#1295D0]/30 text-[#1295D0] hover:bg-[#1295D0]/10 text-xs px-3 py-1 h-8"
                        onClick={() => {
                          // Navigate to ledger page with student filter
                          navigate(`/ledger?student=${encodeURIComponent(student.studentId)}&section=ledger`);
                        }}
                      >
                        📋 Ledger
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            
            <div className="bg-gradient-to-r from-orange-100/50 to-red-100/50 rounded-lg p-3 border border-orange-200/50 mt-4">
              <div className="flex items-center gap-2 text-xs text-orange-800">
                <AlertTriangle className="h-4 w-4" />
                <span className="font-medium">
                  These students have completed checkout but have pending dues. Follow up for payment collection.
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="border-green-200 bg-green-50/30">
          <CardContent className="p-4">
            <div className="text-center">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <AlertTriangle className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="font-medium text-green-900 text-sm mb-1">No Outstanding Dues</h3>
              <p className="text-xs text-green-700">
                All checked-out students have cleared their dues.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
});
