import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useAppContext } from '@/contexts/AppContext';
import { useToast } from '@/hooks/use-toast';
import { 
  Calendar, 
  DollarSign, 
  Users, 
  FileText, 
  Clock, 
  CheckCircle,
  AlertCircle,
  Play,
  Eye,
  TrendingUp,
  Download
} from 'lucide-react';

import { billingService } from '@/services/billingService.js';

export const BillingDashboard = () => {
  const { state, refreshAllData } = useAppContext();
  const { toast } = useToast();
  const [billingStats, setBillingStats] = useState({});
  const [billingSchedule, setBillingSchedule] = useState([]);
  const [nextBillingPreview, setNextBillingPreview] = useState(null);
  const [studentsReadyForBilling, setStudentsReadyForBilling] = useState([]);
  const [isGeneratingBilling, setIsGeneratingBilling] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadBillingData();
  }, []);

  const loadBillingData = async () => {
    try {
      setLoading(true);
      
      const [stats, schedule, studentsReady, preview] = await Promise.all([
        billingService.getMonthlyStats(),
        billingService.getBillingSchedule(6),
        billingService.getStudentsReadyForBilling(),
        billingService.previewNextMonthBilling()
      ]);
      
      setBillingStats(stats);
      setBillingSchedule(schedule);
      setStudentsReadyForBilling(studentsReady);
      setNextBillingPreview(preview);
      
    } catch (error) {
      console.error('Error loading billing data:', error);
      toast({
        title: "Error Loading Data",
        description: "Failed to load billing dashboard data. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateBilling = async () => {
    setIsGeneratingBilling(true);
    try {
      const result = await billingService.generateCurrentMonthInvoices();
      
      toast({
        title: "Monthly Billing Complete",
        description: `${result.generated} invoices generated successfully. Total: NPR ${result.totalAmount.toLocaleString()}`
      });

      await refreshAllData();
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

  const currentMonth = new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  const isFirstOfMonth = new Date().getDate() === 1;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">📅 Monthly Billing Dashboard</h2>
          <p className="text-gray-600 mt-1">Automated billing system with complete charge management</p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="outline" className={`${isFirstOfMonth ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}`}>
            {isFirstOfMonth ? '🎯 Billing Day' : '📅 Regular Day'}
          </Badge>
          <Button 
            onClick={handleGenerateBilling}
            disabled={isGeneratingBilling}
            className="flex items-center gap-2"
          >
            {isGeneratingBilling ? (
              <>
                <Clock className="h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Play className="h-4 w-4" />
                Generate Monthly Invoices
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Billing Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-blue-100">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-600 font-medium">Configured Students</p>
                <p className="text-3xl font-bold text-blue-700">{billingStats?.configuredStudents || 0}</p>
                <p className="text-xs text-blue-600 mt-1">Ready for billing</p>
              </div>
              <Users className="h-12 w-12 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-green-50 to-green-100">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-600 font-medium">Current Month</p>
                <p className="text-3xl font-bold text-green-700">NPR {(billingStats?.currentMonthAmount || 0).toLocaleString()}</p>
                <p className="text-xs text-green-600 mt-1">{billingStats?.currentMonthInvoices || 0} invoices</p>
              </div>
              <DollarSign className="h-12 w-12 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-50 to-purple-100">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-purple-600 font-medium">Paid Invoices</p>
                <p className="text-3xl font-bold text-purple-700">{billingStats?.paidInvoices || 0}</p>
                <p className="text-xs text-purple-600 mt-1">This month</p>
              </div>
              <CheckCircle className="h-12 w-12 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-orange-50 to-orange-100">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-orange-600 font-medium">Overdue</p>
                <p className="text-3xl font-bold text-orange-700">{billingStats?.overdueInvoices || 0}</p>
                <p className="text-xs text-orange-600 mt-1">Need attention</p>
              </div>
              <AlertCircle className="h-12 w-12 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Next Month Preview & Current Status */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Next Month Billing Preview */}
        {nextBillingPreview && (
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Next Month Preview
                </div>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setShowPreview(!showPreview)}
                >
                  <Eye className="h-4 w-4 mr-1" />
                  {showPreview ? 'Hide' : 'Show'} Details
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-indigo-50 p-4 rounded-lg">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm text-indigo-600 font-medium">{nextBillingPreview.month}</p>
                    <p className="text-2xl font-bold text-indigo-700">NPR {nextBillingPreview.totalAmount.toLocaleString()}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-indigo-600">{nextBillingPreview.totalStudents} students</p>
                    <p className="text-xs text-indigo-500">Auto-billing ready</p>
                  </div>
                </div>
              </div>

              {showPreview && (
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  <h4 className="font-medium text-gray-900">Students Ready for Billing:</h4>
                  {nextBillingPreview.students.map((student) => (
                    <div key={student.id} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                      <div>
                        <p className="text-sm font-medium">{student.name}</p>
                        <p className="text-xs text-gray-500">Room {student.roomNumber} • {student.activeCharges} charges</p>
                      </div>
                      <p className="text-sm font-semibold">NPR {student.monthlyAmount.toLocaleString()}</p>
                    </div>
                  ))}
                </div>
              )}

              <div className="bg-blue-50 border border-blue-200 p-3 rounded-lg">
                <div className="flex items-start gap-2">
                  <Calendar className="h-4 w-4 text-blue-600 mt-0.5" />
                  <div className="text-sm text-blue-800">
                    <p className="font-medium">Auto-Billing Schedule</p>
                    <p className="text-xs mt-1">
                      Invoices will be automatically generated on the 1st of {nextBillingPreview.month} and sent via Kaha App.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Billing Schedule */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Billing Schedule
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {billingSchedule.slice(0, 6).map((schedule, index) => (
                <div key={schedule.month} className={`flex justify-between items-center p-3 rounded-lg ${
                  index === 0 ? 'bg-green-50 border border-green-200' : 'bg-gray-50'
                }`}>
                  <div>
                    <p className={`font-medium ${index === 0 ? 'text-green-900' : 'text-gray-900'}`}>
                      {schedule.month}
                    </p>
                    <p className={`text-xs ${index === 0 ? 'text-green-600' : 'text-gray-500'}`}>
                      {schedule.date}
                    </p>
                  </div>
                  <Badge variant={index === 0 ? 'default' : 'outline'} className={
                    index === 0 ? 'bg-green-100 text-green-800 border-green-200' : ''
                  }>
                    {index === 0 ? 'Current' : 'Upcoming'}
                  </Badge>
                </div>
              ))}
            </div>

            <div className="mt-4 pt-4 border-t">
              <div className="text-sm text-gray-600 space-y-1">
                <p>• Automatic billing on 1st of every month</p>
                <p>• Invoices sent via Kaha App notifications</p>
                <p>• Due date: 10 days from generation</p>
                <p>• Late fees applied automatically after due date</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Students Ready for Billing */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Students Ready for Billing ({studentsReadyForBilling.length})
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-1" />
                Export List
              </Button>
              <Button variant="outline" size="sm">
                <TrendingUp className="h-4 w-4 mr-1" />
                View Analytics
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Student</TableHead>
                <TableHead>Room</TableHead>
                <TableHead>Monthly Charges</TableHead>
                <TableHead>Active Charges</TableHead>
                <TableHead>Last Invoice</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {studentsReadyForBilling.length > 0 ? (
                studentsReadyForBilling.map((student) => (
                  <TableRow key={student.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{student.name}</p>
                        <p className="text-sm text-gray-500">{student.id}</p>
                      </div>
                    </TableCell>
                    <TableCell>{student.roomNumber}</TableCell>
                    <TableCell className="font-semibold">NPR {student.monthlyTotal.toLocaleString()}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{student.activeCharges} charges</Badge>
                    </TableCell>
                    <TableCell>
                      <p className="text-sm">{student.lastInvoiceDate || 'Never'}</p>
                    </TableCell>
                    <TableCell>
                      <Badge className="bg-green-100 text-green-800 border-green-200">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Ready
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button size="sm" variant="outline">
                          <Eye className="h-3 w-3" />
                        </Button>
                        <Button size="sm" variant="outline">
                          <FileText className="h-3 w-3" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    <div className="flex flex-col items-center gap-2">
                      <AlertCircle className="h-8 w-8 text-gray-400" />
                      <p className="text-gray-500">No students configured for billing yet</p>
                      <p className="text-sm text-gray-400">Configure student charges to enable auto-billing</p>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* System Status */}
      <Card className="border-0 shadow-lg bg-gradient-to-r from-blue-50 to-indigo-50">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">🎯 Auto-Billing System Status</h3>
              <p className="text-gray-600 mt-1">
                Complete automated billing system with charge configuration and Kaha App integration
              </p>
            </div>
            <Badge className="bg-green-100 text-green-800 border-green-200">
              <CheckCircle className="h-3 w-3 mr-1" />
              Fully Operational
            </Badge>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <CheckCircle className="h-4 w-4 text-green-600" />
              Automated monthly invoice generation
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <CheckCircle className="h-4 w-4 text-green-600" />
              Flexible charge configuration per student
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <CheckCircle className="h-4 w-4 text-green-600" />
              Kaha App notifications integrated
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};