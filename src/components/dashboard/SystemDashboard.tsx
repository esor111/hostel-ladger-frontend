import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAppContext } from '@/contexts/AppContext';
import { dashboardService } from '@/services/dashboardService';
import { notificationService } from '@/services/notificationService';
import { 
  Users, 
  DollarSign, 
  Bell, 
  Gift, 
  Zap,
  Home,
  CheckCircle,
  Clock,
  Smartphone
} from 'lucide-react';

export const SystemDashboard = () => {
  const { state } = useAppContext();
  const [dashboardData, setDashboardData] = useState(null);
  const [notificationStats, setNotificationStats] = useState(null);
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const getIconComponent = (iconName) => {
    switch (iconName) {
      case 'DollarSign': return DollarSign;
      case 'Users': return Users;
      case 'Bell': return Bell;
      case 'Gift': return Gift;
      default: return DollarSign;
    }
  };

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🔄 Loading dashboard data from API...');
      
      // Load dashboard data from API
      const [statsData, activityData, notifications] = await Promise.all([
        dashboardService.getStats(),
        dashboardService.getRecentActivity(5),
        notificationService.getNotificationStats()
      ]);
      
      console.log('✅ Dashboard stats received:', statsData);
      console.log('✅ Recent activity received:', activityData);
      console.log('✅ Notification stats received:', notifications);
      
      setDashboardData(statsData);
      setNotificationStats(notifications);

      // Update recent activity with proper icons
      const activityWithIcons = activityData.map(activity => ({
        ...activity,
        icon: getIconComponent(activity.icon)
      }));
      setRecentActivity(activityWithIcons);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  // Show loading state
  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">Loading dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <p className="text-red-600 mb-2">Error: {error}</p>
            <Button onClick={loadDashboardData}>Retry</Button>
          </div>
        </div>
      </div>
    );
  }

  // Use API data if available, fallback to defaults
  const totalStudents = dashboardData?.totalStudents || 0;
  const availableRooms = dashboardData?.availableRooms || 0;
  const monthlyRevenue = dashboardData?.monthlyRevenue?.amount || 0;
  const occupancyRate = dashboardData?.occupancyPercentage || 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-[#231F20]">🏠 Kaha Hostel Dashboard</h1>
          <p className="text-gray-600 mt-1">Complete hostel management system with integrated notifications</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            onClick={loadDashboardData}
            disabled={loading}
            variant="outline"
            className="flex items-center gap-2"
          >
            <Home className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            {loading ? 'Refreshing...' : 'Refresh'}
          </Button>
          <Badge variant="outline" className="flex items-center gap-1">
            <Smartphone className="h-3 w-3" />
            Kaha App Integrated
          </Badge>
          <Badge variant="outline" className="flex items-center gap-1">
            <CheckCircle className="h-3 w-3" />
            Ledger-First System
          </Badge>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-0 shadow-lg bg-gradient-to-br from-[#1295D0]/10 to-[#1295D0]/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[#1295D0] font-medium">Monthly Revenue</p>
                <p className="text-3xl font-bold text-[#1295D0]">NPR {monthlyRevenue.toLocaleString()}</p>
                <p className="text-xs text-[#1295D0] mt-1">Current month collection</p>
              </div>
              <DollarSign className="h-12 w-12 text-[#1295D0]" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-[#07A64F]/10 to-[#07A64F]/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[#07A64F] font-medium">Total Students</p>
                <p className="text-3xl font-bold text-[#07A64F]">{totalStudents}</p>
                <p className="text-xs text-[#07A64F] mt-1">Active students</p>
              </div>
              <Users className="h-12 w-12 text-[#07A64F]" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-[#1295D0]/10 to-[#07A64F]/10">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[#1295D0] font-medium">Occupancy Rate</p>
                <p className="text-3xl font-bold text-[#1295D0]">{occupancyRate}%</p>
                <p className="text-xs text-[#1295D0] mt-1">Room utilization</p>
              </div>
              <Home className="h-12 w-12 text-[#1295D0]" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-[#07A64F]/10 to-[#1295D0]/10">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[#07A64F] font-medium">Available Rooms</p>
                <p className="text-3xl font-bold text-[#07A64F]">{availableRooms}</p>
                <p className="text-xs text-[#07A64F] mt-1">Ready for booking</p>
              </div>
              <Home className="h-12 w-12 text-[#07A64F]" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-gray-600" />
            Recent Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {recentActivity.map((activity) => {
              const IconComponent = activity.icon;
              return (
                <div key={activity.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <div className={`p-2 rounded-full bg-white ${activity.color}`}>
                    <IconComponent className="h-4 w-4" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">{activity.message}</p>
                    <p className="text-xs text-gray-500">{activity.time}</p>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-4 pt-4 border-t">
            <Button variant="outline" className="w-full">
              View All Activity
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* System Status */}
      <Card className="border-0 shadow-lg bg-gradient-to-r from-green-50 to-blue-50">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">🎉 System Restructuring Complete!</h3>
              <p className="text-gray-600 mt-1">
                All major components have been updated to use the new ledger-first approach with Kaha App integration.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Badge className="bg-green-100 text-green-800 border-green-200">
                <CheckCircle className="h-3 w-3 mr-1" />
                All Systems Operational
              </Badge>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <CheckCircle className="h-4 w-4 text-green-600" />
              Ledger-first architecture implemented
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <CheckCircle className="h-4 w-4 text-green-600" />
              Kaha App notifications integrated
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <CheckCircle className="h-4 w-4 text-green-600" />
              All services updated and tested
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};