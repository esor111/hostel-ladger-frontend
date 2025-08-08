import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { FileText, Play, CheckCircle, AlertCircle, DollarSign } from "lucide-react";
import { invoiceGenerationService } from "@/services/invoiceGenerationService.js";

export const InvoiceTestPanel = () => {
  const [testing, setTesting] = useState(false);
  const [testResults, setTestResults] = useState<any>(null);

  const runInvoiceTest = async () => {
    try {
      setTesting(true);
      setTestResults(null);
      
      console.log('🧪 Starting comprehensive invoice test...');
      
      // Run test for December 2024
      const results = await invoiceGenerationService.generateAndProcessMonthlyInvoices(12, 2024);
      
      if (results) {
        setTestResults(results);
        toast.success(`✅ Invoice test completed: ${results.successfulInvoices} invoices generated`);
      } else {
        toast.error('❌ Invoice generation test failed');
      }
      
    } catch (error: any) {
      console.error('❌ Invoice test failed:', error);
      toast.error('❌ Invoice generation test failed: ' + error.message);
    } finally {
      setTesting(false);
    }
  };

  const getInvoiceStats = async () => {
    try {
      const stats = await invoiceGenerationService.getInvoiceStatistics();
      console.log('📊 Invoice Statistics:', stats);
      toast.success(`📊 Total invoices: ${stats.totalInvoices}, Total amount: NPR ${stats.totalAmount.toLocaleString()}`);
    } catch (error: any) {
      toast.error('Failed to get statistics: ' + error.message);
    }
  };

  return (
    <Card className="border-2 border-dashed border-[#1295D0]/30 bg-gradient-to-br from-blue-50/50 to-green-50/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-[#1295D0]">
          <FileText className="h-5 w-5" />
          Invoice Generation Test Panel
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        
        {/* Test Controls */}
        <div className="flex items-center gap-3">
          <Button
            onClick={runInvoiceTest}
            disabled={testing}
            className="bg-[#1295D0] hover:bg-[#1295D0]/90 text-white"
          >
            <Play className="h-4 w-4 mr-2" />
            {testing ? 'Testing...' : 'Test Invoice Generation'}
          </Button>
          
          <Button
            onClick={getInvoiceStats}
            variant="outline"
            className="border-[#07A64F] text-[#07A64F] hover:bg-[#07A64F]/10"
          >
            <DollarSign className="h-4 w-4 mr-2" />
            Get Statistics
          </Button>
        </div>

        {/* Test Results */}
        {testResults && (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <span className="font-medium text-green-700">Test Completed</span>
            </div>
            
            {/* Summary Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="bg-white p-3 rounded-lg border">
                <div className="text-sm text-gray-600">Month</div>
                <div className="font-bold text-[#1295D0]">{testResults.month}</div>
              </div>
              <div className="bg-white p-3 rounded-lg border">
                <div className="text-sm text-gray-600">Students</div>
                <div className="font-bold text-[#07A64F]">{testResults.totalStudents}</div>
              </div>
              <div className="bg-white p-3 rounded-lg border">
                <div className="text-sm text-gray-600">Successful</div>
                <div className="font-bold text-green-600">{testResults.successfulInvoices}</div>
              </div>
              <div className="bg-white p-3 rounded-lg border">
                <div className="text-sm text-gray-600">Total Amount</div>
                <div className="font-bold text-[#07A64F]">NPR {testResults.totalAmount.toLocaleString()}</div>
              </div>
            </div>

            {/* Sample Invoice IDs */}
            {testResults.results && testResults.results.length > 0 && (
              <div className="bg-white p-4 rounded-lg border">
                <h4 className="font-medium text-gray-900 mb-3">Sample Generated Invoice IDs</h4>
                <div className="space-y-2">
                  {testResults.results
                    .filter((r: any) => r.success)
                    .slice(0, 5)
                    .map((result: any, index: number) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 bg-gradient-to-br from-[#07A64F] to-[#1295D0] rounded-full flex items-center justify-center text-white text-xs font-bold">
                            {result.studentName.charAt(0)}
                          </div>
                          <span className="font-medium">{result.studentName}</span>
                          <Badge variant="outline">{result.roomNumber}</Badge>
                        </div>
                        <div className="flex items-center gap-2">
                          <code className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                            {result.invoice.referenceId}
                          </code>
                          <span className="font-bold text-[#07A64F]">
                            NPR {result.amount.toLocaleString()}
                          </span>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            )}

            {/* Failed Invoices */}
            {testResults.failedInvoices > 0 && (
              <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                <div className="flex items-center gap-2 text-red-600 mb-2">
                  <AlertCircle className="h-4 w-4" />
                  <span className="font-medium">Failed Invoices: {testResults.failedInvoices}</span>
                </div>
                <div className="space-y-1">
                  {testResults.results
                    .filter((r: any) => !r.success)
                    .map((result: any, index: number) => (
                      <div key={index} className="text-sm text-red-700">
                        {result.studentName}: {result.error}
                      </div>
                    ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Invoice ID Format Info */}
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
          <h4 className="font-medium text-blue-900 mb-2">Invoice ID Format</h4>
          <div className="text-sm text-blue-700 space-y-1">
            <div><strong>Format:</strong> BL-YYYY-MM-NNNNNN</div>
            <div><strong>Example:</strong> BL-2024-12-123456</div>
            <div><strong>Description:</strong> BL (Billing Ledger) + Year + Month + Unique Number</div>
          </div>
        </div>

      </CardContent>
    </Card>
  );
};