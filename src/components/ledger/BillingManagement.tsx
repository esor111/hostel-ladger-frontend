import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { useAppContext } from "@/contexts/AppContext";
import { Calendar, Clock, DollarSign, Users, AlertCircle, CheckCircle, Zap } from "lucide-react";

export const BillingManagement = () => {
  const { state, refreshAllData } = useAppContext();
  const { toast } = useToast();
  const [selectedMonth, setSelectedMonth] = useState("");
  const [selectedYear, setSelectedYear] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [billingStatus, setBillingStatus] = useState(null);

  // Initialize billing status
  useEffect(() => {
    const today = new Date();
    const nextMonth = new Date(today.getFullYear(), today.getMonth() + 1, 1);
    const daysUntilBilling = Math.ceil((nextMonth - today) / (1000 * 60 * 60 * 24));
    
    setBillingStatus({
      today: today.toDateString(),
      nextBillingDate: nextMonth.toDateString(),
      daysUntilBilling: daysUntilBilling,
      isFirstOfMonth: today.getDate() === 1
    });
  }, []);

  // Calculate prorated amount for demonstration
  const calculateProratedDemo = (monthlyAmount, enrollmentDay) => {
    const today = new Date();
    const totalDaysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
    const remainingDays = totalDaysInMonth - enrollmentDay + 1;
    const proratedAmount = Math.round((monthlyAmount * remainingDays) / totalDaysInMonth);
    
    return {
      totalDaysInMonth,
      remainingDays,
      proratedAmount,
      isProrated: remainingDays < totalDaysInMonth
    };
  };

  // Simulate monthly billing generation
  const handleGenerateMonthlyBilling = async () => {
    if (!selectedMonth || !selectedYear) {
      toast({
        title: "Missing Information",
        description: "Please select both month and year",
        variant: "destructive"
      });
      return;
    }

    setIsGenerating(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const activeStudents = Array.isArray(state.students) ? state.students.filter(s => s.status === 'Active') : [];
      const totalAmount = activeStudents.reduce((sum, student) => 
        sum + student.baseMonthlyFee + student.laundryFee + student.foodFee, 0
      );
      
      toast({
        title: "Monthly Billing Generated",
        description: `Generated ${activeStudents.length} invoices for ${selectedMonth} ${selectedYear}. Total: ₨${totalAmount.toLocaleString()}`,
      });
      
      await refreshAllData();
    } catch (error) {
      toast({
        title: "Billing Generation Failed",
        description: "Something went wrong. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  // Simulate automatic billing check
  const handleCheckAutomaticBilling = () => {
    const today = new Date();
    const isFirstOfMonth = today.getDate() === 1;
    
    if (isFirstOfMonth) {
      toast({
        title: "Automatic Billing Triggered",
        description: "Today is 1st of the month - Monthly invoices are being generated automatically!",
      });
    } else {
      toast({
        title: "Automatic Billing Status",
        description: `Today is ${today.getDate()}${getOrdinalSuffix(today.getDate())} - Next automatic billing on 1st of next month`,
      });
    }
  };

  const getOrdinalSuffix = (day) => {
    if (day > 3 && day < 21) return 'th';
    switch (day % 10) {
      case 1: return 'st';
      case 2: return 'nd';
      case 3: return 'rd';
      default: return 'th';
    }
  };

  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const years = ["2024", "2025", "2026"];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold text-gray-900">⚡ Automated Billing Management</h2>
        <Button onClick={handleCheckAutomaticBilling} variant="outline">
          <Clock className="h-4 w-4 mr-2" />
          Check Auto-Billing Status
        </Button>
      </div>

      {/* Billing Status Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-blue-600" />
              <div>
                <div className="text-2xl font-bold text-blue-600">
                  {billingStatus?.daysUntilBilling || 0}
                </div>
                <div className="text-sm text-gray-500">Days Until Next Billing</div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-green-600" />
              <div>
                <div className="text-2xl font-bold text-green-600">
                  {Array.isArray(state.students) ? state.students.filter(s => s.status === 'Active').length : 0}
                </div>
                <div className="text-sm text-gray-500">Active Students</div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-purple-600" />
              <div>
                <div className="text-2xl font-bold text-purple-600">
                  ₨{(Array.isArray(state.students) ? state.students.filter(s => s.status === 'Active').reduce((sum, s) => 
                    sum + s.baseMonthlyFee + s.laundryFee + s.foodFee, 0
                  ) : 0).toLocaleString()}
                </div>
                <div className="text-sm text-gray-500">Monthly Revenue Target</div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              {billingStatus?.isFirstOfMonth ? (
                <CheckCircle className="h-5 w-5 text-green-600" />
              ) : (
                <Clock className="h-5 w-5 text-orange-600" />
              )}
              <div>
                <div className="text-lg font-bold">
                  {billingStatus?.isFirstOfMonth ? "Active" : "Scheduled"}
                </div>
                <div className="text-sm text-gray-500">Auto-Billing Status</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Prorated Billing Demo */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Prorated Billing Calculator (Demo)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="font-semibold text-blue-800 mb-3">📊 How Prorated Billing Works:</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { day: 1, fee: 10000 },
                { day: 15, fee: 10000 },
                { day: 25, fee: 10000 }
              ].map(({ day, fee }) => {
                const calculation = calculateProratedDemo(fee, day);
                return (
                  <div key={day} className="bg-white p-3 rounded border">
                    <div className="font-medium text-gray-800">
                      Enrolled on {day}{getOrdinalSuffix(day)} of Month
                    </div>
                    <div className="text-sm text-gray-600 mt-1">
                      Monthly Fee: ₨{fee.toLocaleString()}
                    </div>
                    <div className="text-sm text-gray-600">
                      Days: {calculation.remainingDays}/{calculation.totalDaysInMonth}
                    </div>
                    <div className="font-bold text-blue-600 mt-2">
                      Prorated: ₨{calculation.proratedAmount.toLocaleString()}
                    </div>
                    {calculation.isProrated && (
                      <Badge variant="outline" className="mt-1 text-xs">
                        Prorated
                      </Badge>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Manual Billing Generation */}
      <Card>
        <CardHeader>
          <CardTitle>🔧 Manual Billing Generation</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex gap-4 items-end">
              <div className="flex-1">
                <label className="text-sm font-medium">Select Month</label>
                <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose month" />
                  </SelectTrigger>
                  <SelectContent>
                    {months.map((month) => (
                      <SelectItem key={month} value={month}>
                        {month}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex-1">
                <label className="text-sm font-medium">Select Year</label>
                <Select value={selectedYear} onValueChange={setSelectedYear}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose year" />
                  </SelectTrigger>
                  <SelectContent>
                    {years.map((year) => (
                      <SelectItem key={year} value={year}>
                        {year}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <Button 
                onClick={handleGenerateMonthlyBilling}
                disabled={isGenerating || !selectedMonth || !selectedYear}
                className="px-8"
              >
                {isGenerating ? "Generating..." : "Generate Invoices"}
              </Button>
            </div>
            
            <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
              <div className="flex items-start gap-2">
                <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-yellow-800">Important Notes:</h4>
                  <ul className="text-sm text-yellow-700 mt-1 space-y-1">
                    <li>• Automatic billing runs on 1st of every month at midnight</li>
                    <li>• New students get prorated billing based on enrollment date</li>
                    <li>• Manual generation is for testing or missed billing cycles</li>
                    <li>• Duplicate invoices for the same month are prevented</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Billing Flow Explanation */}
      <Card>
        <CardHeader>
          <CardTitle>🔄 Automated Billing Flow</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold text-gray-800 mb-3">📋 When Admin Approves Student:</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 text-xs flex items-center justify-center font-bold">1</div>
                    <span>Student profile created</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 text-xs flex items-center justify-center font-bold">2</div>
                    <span>Ledger entry for enrollment</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 text-xs flex items-center justify-center font-bold">3</div>
                    <span>Prorated invoice generated</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 text-xs flex items-center justify-center font-bold">4</div>
                    <span>Student balance updated</span>
                  </div>
                </div>
              </div>
              
              <div>
                <h4 className="font-semibold text-gray-800 mb-3">📅 Monthly Automatic Billing:</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-green-100 text-green-600 text-xs flex items-center justify-center font-bold">1</div>
                    <span>Runs on 1st of every month</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-green-100 text-green-600 text-xs flex items-center justify-center font-bold">2</div>
                    <span>Generates invoices for all active students</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-green-100 text-green-600 text-xs flex items-center justify-center font-bold">3</div>
                    <span>Includes previous outstanding dues</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-green-100 text-green-600 text-xs flex items-center justify-center font-bold">4</div>
                    <span>Updates ledger and balances</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};