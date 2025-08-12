
import React from 'react';
import { 
  Users, 
  DollarSign, 
  Calendar, 
  TrendingUp,
  Bed,
  MapPin,
  AlertCircle,
  CheckCircle,
  Clock,
  ArrowUpRight,
  Zap,
  Target,
  Activity
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useLanguage } from "@/hooks/useLanguage";
import { useAppContext } from "@/contexts/AppContext";
import { useNavigation } from "@/hooks/useNavigation";
import { KahaLogo } from "@/components/ui/KahaLogo";
import { ledgerService } from "@/services/ledgerService";
import { studentService } from "@/services/studentService";

export const Dashboard = () => {
  const { } = useLanguage();
  const { state } = useAppContext();
  const { goToBookings, goToLedger, goToStudentLedger } = useNavigation();

  // Calculate real-time statistics
  const totalStudents = state.students.length;
  const activeStudents = state.students.filter(s => s.status === 'Active').length;
  const pendingBookings = state.bookingRequests.filter(r => r.status === 'Pending').length;
  const totalDues = state.students.reduce((sum, s) => sum + (s.currentBalance || 0), 0);

  const paidInvoices = state.invoices.filter(i => i.status === 'Paid').length;
  const totalRevenue = state.invoices.filter(i => i.status === 'Paid').reduce((sum, i) => sum + i.total, 0);

  const occupancyRate = totalStudents > 0 ? ((activeStudents / 100) * 100).toFixed(1) : "0";

  const stats = [
    {
      title: "Total Students",
      value: totalStudents.toString(),
      change: `${activeStudents} active`,
      icon: Users,
      color: "text-blue-600",
      onClick: () => goToLedger('students')
    },
    {
      title: "Total Revenue",
      value: `Rs ${totalRevenue.toLocaleString()}`,
      change: `${paidInvoices} paid invoices`,
      icon: DollarSign,
      color: "text-green-600",
      onClick: () => goToLedger('invoices')
    },
    {
      title: "Pending Bookings",
      value: pendingBookings.toString(),
      change: "Needs approval",
      icon: Calendar,
      color: "text-orange-600",
      onClick: goToBookings
    },
    {
      title: "Occupancy Rate",
      value: `${occupancyRate}%`,
      change: `${totalStudents}/100 beds`,
      icon: TrendingUp,
      color: "text-purple-600"
    }
  ];

  // Get students with highest dues
  const studentsWithDues = state.students
    .filter(s => s.currentBalance > 0)
    .sort((a, b) => b.currentBalance - a.currentBalance)
    .slice(0, 4);

  // Get recent bookings
  const recentBookings = state.bookingRequests
    .sort((a, b) => new Date(b.requestDate).getTime() - new Date(a.requestDate).getTime())
    .slice(0, 4);

  // Get students who are checked out but still have dues
  const checkedOutStudentsWithDues = state.students
    .filter(s => s.isCheckedOut && (s.totalDue - s.totalPaid) > 0)
    .sort((a, b) => new Date(b.checkoutDate).getTime() - new Date(a.checkoutDate).getTime());

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Approved':
        return 'bg-green-100 text-green-700';
      case 'Rejected':
        return 'bg-red-100 text-red-700';
      case 'Pending':
        return 'bg-yellow-100 text-yellow-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const handleBookPaymentForCheckedOutStudent = async (studentId, amount) => {
    try {
      // Book payment with "Paid post-checkout" remark
      const payment = await ledgerService.bookCheckoutPayment(studentId, amount, "Paid post-checkout");
      
      // Update student's total paid
      const student = await studentService.getStudentById(studentId);
      if (student) {
        const updatedStudent = await studentService.updateStudent(studentId, {
          totalPaid: student.totalPaid + amount,
          lastPaymentDate: new Date().toISOString().split('T')[0]
        });
        
        // Refresh the dashboard data
        // In a real implementation, this would update the context state
        console.log("Payment booked for checked out student:", payment);
        alert(`Payment of NPR ${amount} successfully booked for student ${updatedStudent.name}`);
      }
    } catch (error) {
      console.error("Error booking payment for checked out student:", error);
      alert("Error booking payment. Please try again.");
    }
  };

  return (
    <div className="space-y-8">
      {/* Welcome Header with Kaha Branding */}
      <div className="bg-gradient-to-r from-green-500 via-blue-500 to-green-600 rounded-2xl p-8 text-white relative overflow-hidden kaha-shadow-brand">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-32 translate-x-32"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-24 -translate-x-24"></div>
        <div className="relative z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-4">
                <KahaLogo size="lg" />
              </div>
              <div>
                <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
               
                  Welcome to Kaha Hostel
                </h1>
                <p className="text-green-100 text-lg font-medium">
                  Complete hostel management • Managing {totalStudents} students across your operations
                </p>
                <div className="flex items-center gap-4 mt-3">
                  <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-3 py-1">
                    <div className="w-2 h-2 bg-green-300 rounded-full animate-pulse"></div>
                    <span className="text-sm font-medium">Analytics Ready</span>
                  </div>
                  <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-3 py-1">
                    <Activity className="h-4 w-4" />
                    <span className="text-sm font-medium">All Services Active</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="hidden lg:block">
              <div className="bg-white/20 backdrop-blur-sm rounded-xl p-6 text-center">
                <div className="text-3xl font-bold mb-1">{occupancyRate}%</div>
                <div className="text-sm text-green-100">Occupancy Rate</div>
                <div className="w-16 h-2 bg-white/30 rounded-full mt-2 mx-auto">
                  <div 
                    className="h-full bg-white rounded-full transition-all duration-500" 
                    style={{ width: `${occupancyRate}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          const gradients = [
            'from-blue-500 to-blue-600',
            'from-green-500 to-green-600', 
            'from-orange-500 to-orange-600',
            'from-purple-500 to-purple-600'
          ];
          
          return (
            <Card 
              key={index} 
              className="group hover:shadow-xl transition-all duration-300 cursor-pointer border-0 bg-white hover:scale-105 relative overflow-hidden"
              onClick={stat.onClick}
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${gradients[index]} opacity-0 group-hover:opacity-5 transition-opacity duration-300`}></div>
              <CardContent className="p-6 relative">
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-3 rounded-xl bg-gradient-to-br ${gradients[index]} text-white shadow-lg`}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <ArrowUpRight className="h-5 w-5 text-gray-400 group-hover:text-gray-600 transition-colors" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">{stat.title}</p>
                  <p className="text-3xl font-bold text-gray-900 mb-2">{stat.value}</p>
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse"></div>
                    <p className="text-sm text-gray-600">{stat.change}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Enhanced Students with Outstanding Dues */}
        <Card className="border-0 shadow-lg bg-gradient-to-br from-red-50 to-orange-50">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-red-100 rounded-lg">
                  <AlertCircle className="h-5 w-5 text-red-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Outstanding Dues</h3>
                  <p className="text-sm text-gray-600">Rs {totalDues.toLocaleString()} total pending</p>
                </div>
              </div>
              <Button 
                size="sm" 
                className="bg-red-600 hover:bg-red-700 text-white shadow-md"
                onClick={() => goToLedger('payments')}
              >
                <Zap className="h-4 w-4 mr-2" />
                Record Payments
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {studentsWithDues.length > 0 ? (
                studentsWithDues.map((student, index) => (
                  <div key={student.id} className="group bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-all duration-200 border border-red-100">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                          {student.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">{student.name}</p>
                          <div className="flex items-center gap-4 text-sm text-gray-600">
                            <span className="flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              {student.roomNumber}
                            </span>
                            <span>{student.phone}</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-red-600 text-xl">
                          NPR {student.currentBalance.toLocaleString()}
                        </p>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => goToStudentLedger(student.id)}
                          className="mt-2 group-hover:bg-red-50 border-red-200 text-red-700 hover:text-red-800"
                        >
                          View Ledger
                        </Button>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-12 bg-white rounded-xl">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="h-8 w-8 text-green-600" />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">All Clear!</h3>
                  <p className="text-gray-600">All students are up to date with payments</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Enhanced Recent Bookings */}
        <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-indigo-50">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Clock className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Recent Bookings</h3>
                  <p className="text-sm text-gray-600">{pendingBookings} pending approval</p>
                </div>
              </div>
              <Button 
                size="sm" 
                variant="outline" 
                onClick={goToBookings}
                className="border-blue-200 text-blue-700 hover:bg-blue-50"
              >
                View All
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentBookings.length > 0 ? (
                recentBookings.map((booking, index) => (
                  <div key={booking.id} className="group bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-all duration-200 border border-blue-100">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                          {booking.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">{booking.name}</p>
                          <div className="flex items-center gap-4 text-sm text-gray-600">
                            <span>{new Date(booking.requestDate).toLocaleDateString()}</span>
                            <span className="flex items-center gap-1">
                              <Bed className="h-3 w-3" />
                              {booking.preferredRoom}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge className={`${getStatusColor(booking.status)} font-medium px-3 py-1 rounded-full`}>
                          {booking.status}
                        </Badge>
                        <p className="text-xs text-gray-500 mt-1 font-mono">{booking.id}</p>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-12 bg-white rounded-xl">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Calendar className="h-8 w-8 text-blue-600" />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">No Recent Requests</h3>
                  <p className="text-gray-600">New booking requests will appear here</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Enhanced Quick Actions */}
      <Card className="border-0 shadow-lg bg-gradient-to-br from-gray-50 to-white">
        <CardHeader className="pb-6">
          <CardTitle className="flex items-center gap-3">
            <div className="p-2 bg-gray-100 rounded-lg">
              <Target className="h-5 w-5 text-gray-700" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Quick Actions</h3>
              <p className="text-sm text-gray-600">Streamline your daily operations</p>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
            {[
              {
                icon: Users,
                label: "Manage Students",
                description: "View & edit profiles",
                color: "from-blue-500 to-blue-600",
                onClick: () => goToLedger('students')
              },
              {
                icon: DollarSign,
                label: "Monthly Billing",
                description: "Generate monthly bills",
                color: "from-green-500 to-green-600",
                onClick: () => window.location.href = '/admin/monthly-billing'
              },
              {
                icon: Zap,
                label: "Admin Charges",
                description: "Add flexible charges",
                color: "from-purple-500 to-purple-600",
                onClick: () => window.location.href = '/admin/charging'
              },
              {
                icon: Calendar,
                label: "Record Payments",
                description: "Track transactions",
                color: "from-orange-500 to-orange-600",
                onClick: () => goToLedger('payments')
              },
              {
                icon: Bed,
                label: "Review Bookings",
                description: "Approve requests",
                color: "from-pink-500 to-pink-600",
                onClick: goToBookings
              },
              {
                icon: TrendingUp,
                label: "Analytics",
                description: "View reports",
                color: "from-indigo-500 to-indigo-600",
                onClick: () => window.location.href = '/analytics'
              }
            ].map((action, index) => {
              const Icon = action.icon;
              return (
                <div
                  key={index}
                  onClick={action.onClick}
                  className="group relative bg-white rounded-xl p-6 shadow-sm hover:shadow-lg transition-all duration-300 cursor-pointer border border-gray-100 hover:border-gray-200 hover:scale-105"
                >
                  <div className="flex flex-col items-center text-center space-y-3">
                    <div className={`p-4 rounded-xl bg-gradient-to-br ${action.color} text-white shadow-lg group-hover:shadow-xl transition-shadow`}>
                      <Icon className="h-6 w-6" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-1">{action.label}</h4>
                      <p className="text-xs text-gray-600">{action.description}</p>
                    </div>
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-br from-gray-50 to-transparent opacity-0 group-hover:opacity-10 rounded-xl transition-opacity"></div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-0 shadow-lg bg-gradient-to-br from-green-50 to-emerald-50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-green-100 rounded-xl">
                <TrendingUp className="h-6 w-6 text-green-600" />
              </div>
              <Badge className="bg-green-100 text-green-700 px-3 py-1">+12%</Badge>
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Collection Rate</h3>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">This Month</span>
                <span className="font-medium">87%</span>
              </div>
              <Progress value={87} className="h-2" />
              <p className="text-xs text-gray-600">NPR {totalRevenue.toLocaleString()} collected</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-cyan-50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-blue-100 rounded-xl">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <Badge className="bg-blue-100 text-blue-700 px-3 py-1">Active</Badge>
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Occupancy</h3>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Current</span>
                <span className="font-medium">{occupancyRate}%</span>
              </div>
              <Progress value={parseFloat(occupancyRate)} className="h-2" />
              <p className="text-xs text-gray-600">{activeStudents} of 100 beds occupied</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-50 to-violet-50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-purple-100 rounded-xl">
                <Activity className="h-6 w-6 text-purple-600" />
              </div>
              <Badge className="bg-purple-100 text-purple-700 px-3 py-1">Live</Badge>
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">System Health</h3>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Status</span>
                <span className="font-medium text-green-600">Excellent</span>
              </div>
              <Progress value={98} className="h-2" />
              <p className="text-xs text-gray-600">Analytics tracking active</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
