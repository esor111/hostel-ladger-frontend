import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { 
  LogOut, 
  User, 
  DollarSign, 
  Calendar, 
  CreditCard, 
  CheckCircle,
  AlertTriangle
} from 'lucide-react';
import { checkoutService } from '@/services/checkoutService.js';
import { ledgerService } from '@/services/ledgerService.js';
import { monthlyInvoiceService } from '@/services/monthlyInvoiceService.js';

interface Student {
  id: string;
  name: string;
  roomNumber: string;
  currentBalance: number;
  baseMonthlyFee: number;
  laundryFee: number;
  foodFee: number;
  status: string;
  isCheckedOut: boolean;
}

interface OptimizedCheckoutProps {
  student: Student;
  isOpen: boolean;
  onClose: () => void;
  onCheckoutComplete: (studentId: string) => void;
}

export const OptimizedStudentCheckout = ({ 
  student, 
  isOpen, 
  onClose, 
  onCheckoutComplete 
}: OptimizedCheckoutProps) => {
  const [loading, setLoading] = useState(true);
  const [ledgerEntries, setLedgerEntries] = useState<any[]>([]);
  const [currentMonthBilling, setCurrentMonthBilling] = useState<any>(null);
  const [totalDueAmount, setTotalDueAmount] = useState(0);
  const [allowCheckoutWithoutPayment, setAllowCheckoutWithoutPayment] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentRemark, setPaymentRemark] = useState('');

  useEffect(() => {
    if (isOpen && student) {
      loadCheckoutData();
    }
  }, [isOpen, student]);

  const loadCheckoutData = async () => {
    try {
      setLoading(true);

      // Load existing ledger entries
      let studentLedger: any[] = [];
      try {
        studentLedger = await ledgerService.getLedgerByStudentId(student.id);
        
        if (studentLedger.length === 0) {
          // Create sample entries for demonstration
          studentLedger = [
            {
              id: `LED${Date.now()}_1`,
              studentId: student.id,
              date: "2024-01-01",
              type: "Invoice",
              description: "Monthly fees - January 2024",
              referenceId: "INV001",
              debit: student.baseMonthlyFee + student.laundryFee + student.foodFee,
              credit: 0,
              remark: "Initial monthly invoice"
            },
            {
              id: `LED${Date.now()}_2`,
              studentId: student.id,
              date: "2024-01-15",
              type: "Payment",
              description: "Payment received - Cash",
              referenceId: "PAY001",
              debit: 0,
              credit: (student.baseMonthlyFee + student.laundryFee + student.foodFee) * 0.7,
              remark: "Partial payment"
            }
          ];
        }
      } catch (error) {
        console.error('Error loading ledger data:', error);
        studentLedger = [];
      }

      setLedgerEntries(studentLedger);

      // Calculate current month's partial billing
      const today = new Date().toISOString().split('T')[0];
      const monthlyFee = student.baseMonthlyFee + student.laundryFee + student.foodFee;

      const currentMonthProration = monthlyInvoiceService.calculateCheckoutProration(monthlyFee, today);
      setCurrentMonthBilling(currentMonthProration);

      // Calculate total ledger balance
      const ledgerBalance = studentLedger.reduce((sum: number, entry: any) => {
        return sum + (entry.debit || 0) - (entry.credit || 0);
      }, 0);

      // Total due = existing ledger balance + current month's partial amount
      const totalDue = ledgerBalance + currentMonthProration.amount;
      setTotalDueAmount(Math.max(0, totalDue));
      setPaymentAmount(Math.max(0, totalDue).toString());

    } catch (error) {
      console.error('Error loading checkout data:', error);
      toast.error('Failed to load checkout data');
    } finally {
      setLoading(false);
    }
  };

  const bookPayment = async () => {
    if (!paymentAmount || parseFloat(paymentAmount) <= 0) {
      toast.error('Please enter a valid payment amount');
      return;
    }

    try {
      const amount = parseFloat(paymentAmount);
      const remark = paymentRemark || "Paid at checkout";

      // Add payment entry to ledger
      const paymentEntry = await ledgerService.bookCheckoutPayment(
        student.id,
        amount,
        remark
      );

      // Create local entry for immediate UI update
      const localPaymentEntry = {
        id: `LED${Date.now()}`,
        studentId: student.id,
        date: new Date().toISOString().split('T')[0],
        type: "Payment",
        description: "Payment booked during checkout",
        referenceId: null,
        debit: 0,
        credit: amount,
        remark: remark
      };

      setLedgerEntries(prev => [...prev, localPaymentEntry]);

      // Recalculate total due
      const newLedgerBalance = [...ledgerEntries, localPaymentEntry].reduce((sum, entry) => {
        return sum + (entry.debit || 0) - (entry.credit || 0);
      }, 0);

      const newTotalDue = newLedgerBalance + (currentMonthBilling?.amount || 0);
      setTotalDueAmount(Math.max(0, newTotalDue));

      // Clear payment form
      setPaymentAmount(Math.max(0, newTotalDue).toString());
      setPaymentRemark("");

      toast.success(`Payment of NPR ${amount.toLocaleString()} booked successfully`);

    } catch (error) {
      console.error('Error booking payment:', error);
      toast.error('Failed to book payment');
    }
  };

  const processCheckout = async () => {
    try {
      const checkoutDate = new Date().toISOString().split('T')[0];
      const hasDues = totalDueAmount > 0;

      if (hasDues && !allowCheckoutWithoutPayment) {
        toast.error('Cannot checkout with outstanding dues. Please book payment first or enable "Allow Checkout Without Payment"');
        return;
      }

      // Add partial month billing to ledger
      if (currentMonthBilling && currentMonthBilling.amount > 0) {
        await ledgerService.addLedgerEntry({
          studentId: student.id,
          type: "Invoice",
          description: `Partial month billing (${currentMonthBilling.daysCharged} days) - Checkout`,
          debit: currentMonthBilling.amount,
          credit: 0,
          referenceId: `CHECKOUT-${student.id}-${Date.now()}`,
          remark: `Student checkout, due till ${checkoutDate}`
        });
      }

      // Process checkout
      const checkoutData = {
        studentId: student.id,
        checkoutDate: checkoutDate,
        reason: "Student checkout",
        notes: `Checkout processed with ${hasDues ? 'outstanding dues' : 'cleared dues'}`,
        duesCleared: !hasDues,
        hadOutstandingDues: hasDues,
        outstandingAmount: totalDueAmount,
        processedBy: "Admin"
      };

      const checkoutResult = await checkoutService.processCheckout(checkoutData);

      // If student has dues, add to dashboard tracking
      if (hasDues) {
        const checkedOutWithDues = {
          studentId: student.id,
          studentName: student.name,
          roomNumber: student.roomNumber,
          checkoutDate: checkoutDate,
          outstandingDues: totalDueAmount,
          lastUpdated: new Date().toISOString(),
          status: 'pending_payment'
        };

        const existingData = JSON.parse(localStorage.getItem('checkedOutWithDues') || '[]');
        existingData.push(checkedOutWithDues);
        localStorage.setItem('checkedOutWithDues', JSON.stringify(existingData));
      }

      onCheckoutComplete(student.id);
      onClose();

      // Show success message
      if (hasDues) {
        toast.warning(
          `⚠️ Student checked out with dues of NPR ${totalDueAmount.toLocaleString()}. Bed ${student.roomNumber} freed and monthly invoices stopped.`,
          { duration: 8000 }
        );
      } else {
        toast.success(
          `✅ Student checked out successfully! All dues cleared. Bed ${student.roomNumber} freed.`,
          { duration: 6000 }
        );
      }

    } catch (error) {
      console.error('Error processing checkout:', error);
      toast.error('Failed to process checkout. Please try again.');
    }
  };

  if (loading) {
    return (
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#07A64F]"></div>
        </div>
      </DialogContent>
    );
  }

  return (
    <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2">
          <LogOut className="h-5 w-5 text-[#1295D0]" />
          Optimized Checkout - {student.name}
        </DialogTitle>
      </DialogHeader>

      <div className="space-y-6">
        {/* Student Info */}
        <div className="bg-blue-50 p-4 rounded-lg">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-[#07A64F] to-[#1295D0] rounded-full flex items-center justify-center text-white font-bold">
              {student.name.charAt(0)}
            </div>
            <div>
              <h3 className="font-bold">{student.name}</h3>
              <p className="text-sm text-gray-600">{student.roomNumber} • Current Balance: NPR {student.currentBalance.toLocaleString()}</p>
            </div>
          </div>
        </div>

        {/* Current Month's Billing */}
        {currentMonthBilling && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Current Month's Billing (Till Today)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-orange-50 p-4 rounded-lg">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Period:</span>
                    <span className="font-medium">{currentMonthBilling.period}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Days Charged:</span>
                    <span className="font-medium">{currentMonthBilling.daysCharged} of {currentMonthBilling.daysInMonth} days</span>
                  </div>
                  <div className="flex justify-between border-t pt-2">
                    <span className="font-bold">Partial Amount:</span>
                    <span className="font-bold text-orange-600">NPR {currentMonthBilling.amount.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Total Due Amount */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5" />
              Total Due Amount
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`p-4 rounded-lg border ${totalDueAmount > 0 ? 'bg-red-50 border-red-200' : 'bg-green-50 border-green-200'}`}>
              <div className="flex justify-between items-center">
                <span className={`font-medium ${totalDueAmount > 0 ? 'text-red-800' : 'text-green-800'}`}>
                  Total Amount Due:
                </span>
                <span className={`text-3xl font-bold ${totalDueAmount > 0 ? 'text-red-900' : 'text-green-900'}`}>
                  NPR {totalDueAmount.toLocaleString()}
                </span>
              </div>
              <p className={`text-sm mt-2 ${totalDueAmount > 0 ? 'text-red-600' : 'text-green-600'}`}>
                {totalDueAmount > 0 ? 'Ledger Balance + Current Month\'s Partial Billing' : 'All dues cleared!'}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Checkout Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Checkout Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <Label className="text-base font-medium">Allow Checkout Without Payment</Label>
                <p className="text-sm text-gray-500">
                  If enabled, student can checkout with dues (will be tracked for collection)
                </p>
              </div>
              <Switch
                checked={allowCheckoutWithoutPayment}
                onCheckedChange={setAllowCheckoutWithoutPayment}
              />
            </div>

            {/* Book Payment Section */}
            {totalDueAmount > 0 && !allowCheckoutWithoutPayment && (
              <div className="space-y-4 p-4 bg-green-50 rounded-lg border border-green-200">
                <h4 className="font-medium text-green-900">Book Payment</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="paymentAmount">Payment Amount (NPR)</Label>
                    <Input
                      id="paymentAmount"
                      type="number"
                      value={paymentAmount}
                      onChange={(e) => setPaymentAmount(e.target.value)}
                      placeholder="Enter payment amount"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="paymentRemark">Payment Remark (Optional)</Label>
                    <Input
                      id="paymentRemark"
                      value={paymentRemark}
                      onChange={(e) => setPaymentRemark(e.target.value)}
                      placeholder="Payment remark"
                    />
                  </div>
                </div>
                <Button
                  onClick={bookPayment}
                  className="w-full bg-[#07A64F] hover:bg-[#07A64F]/90"
                >
                  <CreditCard className="h-4 w-4 mr-2" />
                  Book Payment
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Warning for dues */}
        {totalDueAmount > 0 && (
          <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
            <div className="flex items-start gap-2">
              <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
              <div className="text-sm text-yellow-800">
                <p className="font-medium">Checkout with Outstanding Dues</p>
                <ul className="mt-1 space-y-1">
                  <li>• Student will be tracked on dashboard until dues are cleared</li>
                  <li>• Bed will be freed for new bookings</li>
                  <li>• Monthly invoices will be stopped</li>
                  <li>• Outstanding amount will remain in ledger</li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-4 pt-4 border-t">
          <Button
            onClick={processCheckout}
            disabled={totalDueAmount > 0 && !allowCheckoutWithoutPayment}
            className="bg-[#1295D0] hover:bg-[#1295D0]/90 flex-1"
          >
            <LogOut className="h-4 w-4 mr-2" />
            Complete Checkout
          </Button>
          <Button
            variant="outline"
            onClick={onClose}
            className="flex-1"
          >
            Cancel
          </Button>
        </div>
      </div>
    </DialogContent>
  );
};