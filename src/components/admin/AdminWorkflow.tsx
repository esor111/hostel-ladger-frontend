import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { useAppContext } from '@/contexts/AppContext';
import { useToast } from '@/hooks/use-toast';
import { 
  CheckCircle, 
  Circle, 
  ArrowRight, 
  Home, 
  Bed, 
  UserCheck, 
  Settings, 
  Calendar, 
  DollarSign,
  Users,
  FileText,
  Bell,
  Play,
  Clock,
  AlertCircle
} from 'lucide-react';

// Mock data for billing stats and preview
const mockBillingStats = {
  configuredStudents: 45,
  currentMonthInvoices: 42,
  currentMonthAmount: 125000
};

const mockNextBillingPreview = {
  month: 'February 2025',
  totalAmount: 135000,
  totalStudents: 45
};

export const AdminWorkflow = () => {
  const { state } = useAppContext();
  const { toast } = useToast();
  const [billingStats, setBillingStats] = useState(mockBillingStats);
  const [nextBillingPreview, setNextBillingPreview] = useState(mockNextBillingPreview);
  const [isGeneratingBilling, setIsGeneratingBilling] = useState(false);

  useEffect(() => {
    loadBillingData();
  }, []);

  const loadBillingData = async () => {
    try {
      // Using mock data since we don't have the monthlyBillingService
      setBillingStats(mockBillingStats);
      setNextBillingPreview(mockNextBillingPreview);
    } catch (error) {
      console.error('Error loading billing data:', error);
    }
  };

  const handleManualBilling = async () => {
    setIsGeneratingBilling(true);
    try {
      // Simulate billing generation
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast({
        title: "Monthly Billing Complete",
        description: `${mockBillingStats.configuredStudents} invoices generated. Total: NPR ${mockNextBillingPreview.totalAmount.toLocaleString()}`
      });
      
      await loadBillingData();
    } catch (error) {
      toast({
        title: "Billing Error",
        description: "Failed to generate monthly invoices. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsGeneratingBilling(false);
    }
  };

  // Calculate workflow progress
  const hostelConfigured = true; // Assume hostel is configured
  const roomsConfigured = true; // Assume rooms are configured
  const hasBookings = state.bookingRequests && state.bookingRequests.length > 0;
  const hasStudents = state.students && state.students.length > 0;
  const studentsConfigured = state.students && state.students.filter(s => s.status === 'Active').length > 0;
  
  const workflowSteps = [
    {
      id: 'hostel-profile',
      title: 'Setup Hostel Profile',
      description: 'Configure basic hostel information and settings',
      completed: hostelConfigured,
      action: () => window.location.href = '/hostel',
      icon: Home,
      color: 'blue'
    },
    {
      id: 'room-management',
      title: 'Add & Configure Rooms',
      description: 'Set up rooms with capacity and pricing',
      completed: roomsConfigured,
      action: () => window.location.href = '/rooms',
      icon: Bed,
      color: 'green',
      dependency: 'hostel-profile'
    },
    {
      id: 'booking-requests',
      title: 'Accept Booking Requests',
      description: 'Review and approve student applications',
      completed: hasBookings,
      action: () => window.location.href = '/bookings',
      icon: UserCheck,
      color: 'purple',
      dependency: 'room-management'
    },
    {
      id: 'student-charges',
      title: 'Configure Student Charges',
      description: 'Set up detailed charges for each student',
      completed: studentsConfigured,
      action: () => window.location.href = '/ledger?section=students',
      icon: Settings,
      color: 'orange',
      dependency: 'booking-requests'
    },
    {
      id: 'auto-billing',
      title: 'Auto-Billing Active',
      description: 'Monthly invoices generated automatically',
      completed: studentsConfigured && billingStats?.configuredStudents > 0,
      action: () => handleManualBilling(),
      icon: Calendar,
      color: 'indigo',
      dependency: 'student-charges'
    }
  ];

  const completedSteps = workflowSteps.filter(step => step.completed).length;
  const progressPercentage = (completedSteps / workflowSteps.length) * 100;

  const getStepStatus = (step) => {
    if (step.completed) return 'completed';
    if (step.dependency && !workflowSteps.find(s => s.id === step.dependency)?.completed) {
      return 'blocked';
    }
    return 'available';
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'text-green-600 bg-green-50 border-green-200';
      case 'available': return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'blocked': return 'text-gray-400 bg-gray-50 border-gray-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">🏠 Admin Workflow</h2>
          <p className="text-gray-600 mt-1">Complete setup guide for your hostel management system</p>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-blue-600">{completedSteps}/{workflowSteps.length}</div>
          <div className="text-sm text-gray-500">Steps Completed</div>
        </div>
      </div>

      {/* Progress Overview */}
      <Card className="border-0 shadow-lg bg-gradient-to-r from-blue-50 to-indigo-50">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Setup Progress</h3>
            <Badge className={`${progressPercentage === 100 ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}`}>
              {Math.round(progressPercentage)}% Complete
            </Badge>
          </div>
          <Progress value={progressPercentage} className="h-3 mb-4" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span>{completedSteps} steps completed</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-blue-600" />
              <span>{workflowSteps.length - completedSteps} steps remaining</span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-purple-600" />
              <span>{billingStats?.configuredStudents || 0} students configured</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Workflow Steps */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">Setup Steps</h3>
          
          {workflowSteps.map((step, index) => {
            const status = getStepStatus(step);
            const IconComponent = step.icon;
            
            return (
              <Card key={step.id} className={`border-l-4 border-l-${step.color}-500 ${getStatusColor(status)}`}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg bg-${step.color}-100`}>
                        <IconComponent className={`h-5 w-5 text-${step.color}-600`} />
                      </div>
                      <div>
                        <h4 className="font-medium flex items-center gap-2">
                          {step.title}
                          {step.completed && <CheckCircle className="h-4 w-4 text-green-600" />}
                        </h4>
                        <p className="text-sm text-gray-600">{step.description}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {status === 'completed' && (
                        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                          ✅ Done
                        </Badge>
                      )}
                      {status === 'blocked' && (
                        <Badge variant="outline" className="bg-gray-50 text-gray-500 border-gray-200">
                          🔒 Locked
                        </Badge>
                      )}
                      <Button
                        size="sm"
                        variant={status === 'completed' ? 'outline' : 'default'}
                        onClick={step.action}
                        disabled={status === 'blocked' || (step.id === 'auto-billing' && isGeneratingBilling)}
                      >
                        {step.id === 'auto-billing' && isGeneratingBilling ? (
                          'Generating...'
                        ) : status === 'completed' ? (
                          'Review'
                        ) : (
                          <>
                            {step.id === 'auto-billing' ? <Play className="h-3 w-3 mr-1" /> : <ArrowRight className="h-3 w-3 mr-1" />}
                            {step.id === 'auto-billing' ? 'Run Billing' : 'Start'}
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Current Status & Next Actions */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">Current Status</h3>
          
          {/* System Status */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                System Status
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-blue-50 p-3 rounded-lg">
                  <p className="text-sm text-blue-600 font-medium">Active Rooms</p>
                  <p className="text-2xl font-bold text-blue-700">4</p>
                </div>
                <div className="bg-green-50 p-3 rounded-lg">
                  <p className="text-sm text-green-600 font-medium">Active Students</p>
                  <p className="text-2xl font-bold text-green-700">{state.students?.filter(s => s.status === 'Active').length || 0}</p>
                </div>
              </div>
              
              <Separator />
              
              <div className="space-y-2">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-600">Configured Students</span>
                  <span className="font-medium">{billingStats?.configuredStudents || 0}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-600">Pending Bookings</span>
                  <span className="font-medium">{state.bookingRequests?.filter(b => b.status === 'Pending').length || 0}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-600">Current Month Invoices</span>
                  <span className="font-medium">{billingStats?.currentMonthInvoices || 0}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Next Month Billing Preview */}
          {nextBillingPreview && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Next Billing Preview
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="bg-indigo-50 p-3 rounded-lg">
                  <p className="text-sm text-indigo-600 font-medium">{nextBillingPreview.month}</p>
                  <p className="text-2xl font-bold text-indigo-700">NPR {nextBillingPreview.totalAmount.toLocaleString()}</p>
                  <p className="text-xs text-indigo-600">{nextBillingPreview.totalStudents} students</p>
                </div>
                
                <div className="text-sm text-gray-600">
                  <p>• Automatic billing on 1st of every month</p>
                  <p>• Invoices sent via Kaha App</p>
                  <p>• Due date: 10 days from generation</p>
                </div>
                
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="w-full"
                  onClick={handleManualBilling}
                  disabled={isGeneratingBilling}
                >
                  <FileText className="h-4 w-4 mr-2" />
                  {isGeneratingBilling ? 'Generating...' : 'Generate Current Month Invoices'}
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" size="sm" className="w-full justify-start" onClick={() => window.location.href = '/ledger?section=students'}>
                <Settings className="h-4 w-4 mr-2" />
                Configure Student Charges
              </Button>
              <Button variant="outline" size="sm" className="w-full justify-start" onClick={() => window.location.href = '/bookings'}>
                <UserCheck className="h-4 w-4 mr-2" />
                Review Booking Requests
              </Button>
              <Button variant="outline" size="sm" className="w-full justify-start" onClick={handleManualBilling}>
                <Calendar className="h-4 w-4 mr-2" />
                Run Monthly Billing
              </Button>
            </CardContent>
          </Card>

          {/* Important Notes */}
          <Card className="bg-yellow-50 border-yellow-200">
            <CardContent className="p-4">
              <div className="flex items-start gap-2">
                <AlertCircle className="h-4 w-4 text-yellow-600 mt-0.5" />
                <div className="text-sm text-yellow-800">
                  <p className="font-medium">Important Workflow Notes:</p>
                  <ul className="mt-1 space-y-1 text-xs">
                    <li>• Complete each step in order for optimal setup</li>
                    <li>• Configure student charges before auto-billing starts</li>
                    <li>• Monthly invoices generate automatically on 1st of each month</li>
                    <li>• All notifications sent via Kaha App</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};