import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Plus, Edit, DollarSign, CreditCard, Loader2, Search, Calendar } from "lucide-react";
import { paymentService } from "@/services/paymentService.js";

interface Payment {
  id: string;
  studentId: string;
  studentName: string;
  studentPhone: string;
  roomNumber: string;
  amount: number;
  paymentMethod: string;
  paymentDate: string;
  reference: string;
  notes: string;
  createdBy: string;
  createdAt: string;
  invoiceIds: string[];
  status?: string;
}

interface PaymentStats {
  totalPayments: number;
  totalAmount: number;
  monthlyPayments: number;
  monthlyAmount: number;
  todayPayments: number;
  todayAmount: number;
  averagePayment: number;
  paymentMethods: Record<string, number>;
  recentPayments: Payment[];
}

export const PaymentManagement = () => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [stats, setStats] = useState<PaymentStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [paymentMethodFilter, setPaymentMethodFilter] = useState<string>("all");
  const [dateFromFilter, setDateFromFilter] = useState<string>("");
  const [dateToFilter, setDateToFilter] = useState<string>("");
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [showViewDialog, setShowViewDialog] = useState(false);
  const [showRecordDialog, setShowRecordDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showBulkDialog, setShowBulkDialog] = useState(false);
  const [recordFormData, setRecordFormData] = useState({
    studentId: '',
    amount: '',
    paymentMethod: '',
    paymentDate: new Date().toISOString().split('T')[0],
    reference: '',
    notes: '',
    invoiceIds: [] as string[]
  });
  const [editFormData, setEditFormData] = useState<{
    amount: number;
    paymentMethod: string;
    paymentDate: string;
    reference: string;
    notes: string;
    status: string;
  } | null>(null);
  const [bulkFormData, setBulkFormData] = useState({
    payments: [
      { studentId: '', amount: '', paymentMethod: 'Cash', reference: '', notes: '' }
    ]
  });
  const { toast } = useToast();

  // Fetch payments and stats
  const fetchPayments = async () => {
    try {
      setLoading(true);
      const filters = {
        search: searchTerm || undefined,
        paymentMethod: paymentMethodFilter !== 'all' ? paymentMethodFilter : undefined,
        dateFrom: dateFromFilter || undefined,
        dateTo: dateToFilter || undefined
      };
      
      const [paymentsData, statsData] = await Promise.all([
        paymentService.getPayments(filters),
        paymentService.getPaymentStats()
      ]);
      
      setPayments(paymentsData);
      setStats(statsData);
    } catch (error) {
      console.error('Error fetching payments:', error);
      toast({
        title: "Error",
        description: "Failed to fetch payments. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, [searchTerm, paymentMethodFilter, dateFromFilter, dateToFilter]);

  // Payment method badge
  const getPaymentMethodBadge = (method: string) => {
    const colors = {
      'Cash': 'bg-green-100 text-green-800',
      'Bank Transfer': 'bg-blue-100 text-blue-800',
      'Online': 'bg-purple-100 text-purple-800',
      'Card': 'bg-orange-100 text-orange-800'
    };
    
    return (
      <Badge className={colors[method as keyof typeof colors] || 'bg-gray-100 text-gray-800'}>
        {method}
      </Badge>
    );
  };

  // Handle payment operations
  const handleRecordPayment = async () => {
    try {
      if (!recordFormData.studentId || !recordFormData.amount || !recordFormData.paymentMethod) {
        toast({
          title: "Validation Error",
          description: "Please fill in all required fields.",
          variant: "destructive"
        });
        return;
      }

      await paymentService.recordPayment({
        ...recordFormData,
        amount: parseFloat(recordFormData.amount),
        invoiceIds: recordFormData.invoiceIds.filter(id => id.trim())
      });
      
      toast({
        title: "Success",
        description: "Payment recorded successfully!",
      });
      
      setShowRecordDialog(false);
      setRecordFormData({
        studentId: '',
        amount: '',
        paymentMethod: '',
        paymentDate: new Date().toISOString().split('T')[0],
        reference: '',
        notes: '',
        invoiceIds: []
      });
      fetchPayments();
    } catch (error) {
      toast({
        title: "Error",
        description: error.message || "Failed to record payment.",
        variant: "destructive"
      });
    }
  };  const
 handleUpdatePayment = async () => {
    try {
      if (!selectedPayment || !editFormData) return;

      await paymentService.updatePayment(selectedPayment.id, editFormData);
      toast({
        title: "Success",
        description: "Payment updated successfully!",
      });
      
      setShowEditDialog(false);
      fetchPayments();
    } catch (error) {
      toast({
        title: "Error",
        description: error.message || "Failed to update payment.",
        variant: "destructive"
      });
    }
  };

  const handleBulkPayments = async () => {
    try {
      const validPayments = bulkFormData.payments.filter(p => 
        p.studentId && p.amount && p.paymentMethod
      );

      if (validPayments.length === 0) {
        toast({
          title: "Validation Error",
          description: "Please add at least one valid payment.",
          variant: "destructive"
        });
        return;
      }

      const paymentsToProcess = validPayments.map(p => ({
        ...p,
        amount: parseFloat(p.amount),
        paymentDate: new Date().toISOString().split('T')[0]
      }));

      const result = await paymentService.processBulkPayments(paymentsToProcess);
      
      toast({
        title: "Success",
        description: `Processed ${result.successCount} payments successfully! ${result.failedCount} failed.`,
      });
      
      setShowBulkDialog(false);
      setBulkFormData({
        payments: [
          { studentId: '', amount: '', paymentMethod: 'Cash', reference: '', notes: '' }
        ]
      });
      fetchPayments();
    } catch (error) {
      toast({
        title: "Error",
        description: error.message || "Failed to process bulk payments.",
        variant: "destructive"
      });
    }
  };

  const handleViewPayment = (payment: Payment) => {
    setSelectedPayment(payment);
    setShowViewDialog(true);
  };

  const handleEditPayment = (payment: Payment) => {
    setSelectedPayment(payment);
    setEditFormData({
      amount: payment.amount,
      paymentMethod: payment.paymentMethod,
      paymentDate: payment.paymentDate,
      reference: payment.reference,
      notes: payment.notes,
      status: payment.status || 'Completed'
    });
    setShowEditDialog(true);
  };

  const addBulkPaymentRow = () => {
    setBulkFormData({
      payments: [
        ...bulkFormData.payments,
        { studentId: '', amount: '', paymentMethod: 'Cash', reference: '', notes: '' }
      ]
    });
  };

  const removeBulkPaymentRow = (index: number) => {
    setBulkFormData({
      payments: bulkFormData.payments.filter((_, i) => i !== index)
    });
  };

  const updateBulkPaymentRow = (index: number, field: string, value: string) => {
    const updatedPayments = [...bulkFormData.payments];
    updatedPayments[index] = { ...updatedPayments[index], [field]: value };
    setBulkFormData({ payments: updatedPayments });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold tracking-tight">💰 Payment Management</h2>
        <div className="flex gap-2">
          <Button onClick={() => setShowRecordDialog(true)} className="flex items-center gap-2">
            <Plus size={16} />
            Record Payment
          </Button>
          <Button onClick={() => setShowBulkDialog(true)} variant="outline" className="flex items-center gap-2">
            <CreditCard size={16} />
            Bulk Payments
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-green-600">
                ₨{stats.totalAmount.toLocaleString()}
              </div>
              <div className="text-sm text-gray-500">Total Collected ({stats.totalPayments} payments)</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-blue-600">
                ₨{stats.monthlyAmount.toLocaleString()}
              </div>
              <div className="text-sm text-gray-500">This Month ({stats.monthlyPayments} payments)</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-purple-600">
                ₨{stats.todayAmount.toLocaleString()}
              </div>
              <div className="text-sm text-gray-500">Today ({stats.todayPayments} payments)</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-orange-600">
                ₨{stats.averagePayment.toLocaleString()}
              </div>
              <div className="text-sm text-gray-500">Average Payment</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <CardTitle>🔍 Search & Filter Payments</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex items-center gap-2">
              <Search size={16} />
              <Input
                placeholder="Search payments..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-64"
              />
            </div>
            <div>
              <Select value={paymentMethodFilter} onValueChange={setPaymentMethodFilter}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Filter by method" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Methods</SelectItem>
                  <SelectItem value="Cash">💵 Cash</SelectItem>
                  <SelectItem value="Bank Transfer">🏦 Bank Transfer</SelectItem>
                  <SelectItem value="Card">💳 Card</SelectItem>
        
                  <SelectItem value="Online">💻 Online</SelectItem>
                  <SelectItem value="Cheque">📝 Cheque</SelectItem>
                  <SelectItem value="Mobile Wallet">📲 Mobile Wallet</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2">
              <Calendar size={16} />
              <Input
                type="date"
                placeholder="From date"
                value={dateFromFilter}
                onChange={(e) => setDateFromFilter(e.target.value)}
                className="w-40"
              />
              <span>to</span>
              <Input
                type="date"
                placeholder="To date"
                value={dateToFilter}
                onChange={(e) => setDateToFilter(e.target.value)}
                className="w-40"
              />
            </div>
          </div>
        </CardContent>
      </Card>    
  {/* Payments Table */}
      <Card>
        <CardHeader>
          <CardTitle>Payment Records ({payments.length} payments)</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center items-center py-8">
              <Loader2 className="h-8 w-8 animate-spin" />
              <span className="ml-2">Loading payments...</span>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Payment ID</TableHead>
                  <TableHead>Student</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Method</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Reference</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payments.map((payment) => (
                  <TableRow key={payment.id}>
                    <TableCell className="font-medium">{payment.id}</TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{payment.studentName}</div>
                        <div className="text-sm text-gray-500">
                          Room: {payment.roomNumber} | {payment.studentPhone}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="font-bold text-lg text-green-600">
                      ₨{payment.amount.toLocaleString()}
                    </TableCell>
                    <TableCell>{getPaymentMethodBadge(payment.paymentMethod)}</TableCell>
                    <TableCell>
                      {new Date(payment.paymentDate).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="font-mono text-sm">
                      {payment.reference || '-'}
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-1">
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleViewPayment(payment)}
                          title="View Payment"
                        >
                          👁️
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleEditPayment(payment)}
                          title="Edit Payment"
                        >
                          <Edit size={14} />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Record Payment Dialog */}
      <Dialog open={showRecordDialog} onOpenChange={setShowRecordDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Record New Payment</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="studentId">Student ID *</Label>
              <Input
                id="studentId"
                placeholder="Enter student ID (e.g., S001)"
                value={recordFormData.studentId}
                onChange={(e) => setRecordFormData({...recordFormData, studentId: e.target.value})}
              />
            </div>
            <div>
              <Label htmlFor="amount">Amount *</Label>
              <Input
                id="amount"
                type="number"
                placeholder="Enter amount"
                value={recordFormData.amount}
                onChange={(e) => setRecordFormData({...recordFormData, amount: e.target.value})}
              />
            </div>
            <div>
              <Label htmlFor="paymentMethod">Payment Method *</Label>
              <Select value={recordFormData.paymentMethod} onValueChange={(value) => setRecordFormData({...recordFormData, paymentMethod: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Select payment method" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Cash">💵 Cash</SelectItem>
                  <SelectItem value="Bank Transfer">🏦 Bank Transfer</SelectItem>
                  <SelectItem value="Card">💳 Card</SelectItem>
                  <SelectItem value="UPI">📱 UPI</SelectItem>
                  <SelectItem value="Online">💻 Online</SelectItem>
                  <SelectItem value="Cheque">📝 Cheque</SelectItem>
                  <SelectItem value="Mobile Wallet">📲 Mobile Wallet</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="paymentDate">Payment Date</Label>
              <Input
                id="paymentDate"
                type="date"
                value={recordFormData.paymentDate}
                onChange={(e) => setRecordFormData({...recordFormData, paymentDate: e.target.value})}
              />
            </div>
            <div>
              <Label htmlFor="reference">Reference</Label>
              <Input
                id="reference"
                placeholder="Transaction ID or reference"
                value={recordFormData.reference}
                onChange={(e) => setRecordFormData({...recordFormData, reference: e.target.value})}
              />
            </div>
            <div>
              <Label htmlFor="notes">Notes</Label>
              <Input
                id="notes"
                placeholder="Optional notes"
                value={recordFormData.notes}
                onChange={(e) => setRecordFormData({...recordFormData, notes: e.target.value})}
              />
            </div>
            <div className="flex gap-2 pt-4">
              <Button variant="outline" onClick={() => setShowRecordDialog(false)} className="flex-1">
                Cancel
              </Button>
              <Button onClick={handleRecordPayment} className="flex-1">
                Record Payment
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>    
  {/* View Payment Dialog */}
      <Dialog open={showViewDialog} onOpenChange={setShowViewDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Payment Details - {selectedPayment?.id}</DialogTitle>
          </DialogHeader>
          {selectedPayment && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold">Student Information</h4>
                  <p>Name: {selectedPayment.studentName}</p>
                  <p>Room: {selectedPayment.roomNumber}</p>
                  <p>Phone: {selectedPayment.studentPhone}</p>
                </div>
                <div>
                  <h4 className="font-semibold">Payment Information</h4>
                  <p>Amount: ₨{selectedPayment.amount.toLocaleString()}</p>
                  <p>Method: {selectedPayment.paymentMethod}</p>
                  <p>Date: {new Date(selectedPayment.paymentDate).toLocaleDateString()}</p>
                  <p>Reference: {selectedPayment.reference || 'N/A'}</p>
                </div>
              </div>
              
              {selectedPayment.notes && (
                <div className="border-t pt-4">
                  <h4 className="font-semibold mb-2">Notes</h4>
                  <p className="text-gray-600">{selectedPayment.notes}</p>
                </div>
              )}
              
              {selectedPayment.invoiceIds && selectedPayment.invoiceIds.length > 0 && (
                <div className="border-t pt-4">
                  <h4 className="font-semibold mb-2">Allocated to Invoices</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedPayment.invoiceIds.map((invoiceId) => (
                      <Badge key={invoiceId} variant="outline">{invoiceId}</Badge>
                    ))}
                  </div>
                </div>
              )}
              
              <div className="flex gap-2 pt-4">
                <Button variant="outline" onClick={() => setShowViewDialog(false)} className="flex-1">
                  Close
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Payment Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Payment - {selectedPayment?.id}</DialogTitle>
          </DialogHeader>
          {selectedPayment && editFormData && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="editAmount">Amount</Label>
                <Input
                  id="editAmount"
                  type="number"
                  value={editFormData.amount}
                  onChange={(e) => setEditFormData({...editFormData, amount: parseFloat(e.target.value)})}
                />
              </div>
              <div>
                <Label htmlFor="editPaymentMethod">Payment Method</Label>
                <Select value={editFormData.paymentMethod} onValueChange={(value) => setEditFormData({...editFormData, paymentMethod: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Cash">💵 Cash</SelectItem>
                    <SelectItem value="Bank Transfer">🏦 Bank Transfer</SelectItem>
                    <SelectItem value="Card">💳 Card</SelectItem>
                    <SelectItem value="UPI">📱 UPI</SelectItem>
                    <SelectItem value="Online">💻 Online</SelectItem>
                    <SelectItem value="Cheque">📝 Cheque</SelectItem>
                    <SelectItem value="Mobile Wallet">📲 Mobile Wallet</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="editPaymentDate">Payment Date</Label>
                <Input
                  id="editPaymentDate"
                  type="date"
                  value={editFormData.paymentDate}
                  onChange={(e) => setEditFormData({...editFormData, paymentDate: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="editReference">Reference</Label>
                <Input
                  id="editReference"
                  value={editFormData.reference}
                  onChange={(e) => setEditFormData({...editFormData, reference: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="editNotes">Notes</Label>
                <Input
                  id="editNotes"
                  value={editFormData.notes}
                  onChange={(e) => setEditFormData({...editFormData, notes: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="editStatus">Status</Label>
                <Select value={editFormData.status} onValueChange={(value) => setEditFormData({...editFormData, status: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Completed">✅ Completed</SelectItem>
                    <SelectItem value="Pending">⏳ Pending</SelectItem>
                    <SelectItem value="Cancelled">❌ Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex gap-2 pt-4">
                <Button variant="outline" onClick={() => setShowEditDialog(false)} className="flex-1">
                  Cancel
                </Button>
                <Button onClick={handleUpdatePayment} className="flex-1">
                  Save Changes
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>     
 {/* Bulk Payments Dialog */}
      <Dialog open={showBulkDialog} onOpenChange={setShowBulkDialog}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Process Bulk Payments</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="max-h-96 overflow-y-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student ID</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Method</TableHead>
                    <TableHead>Reference</TableHead>
                    <TableHead>Notes</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {bulkFormData.payments.map((payment, index) => (
                    <TableRow key={index}>
                      <TableCell>
                        <Input
                          placeholder="Student ID"
                          value={payment.studentId}
                          onChange={(e) => updateBulkPaymentRow(index, 'studentId', e.target.value)}
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          placeholder="Amount"
                          value={payment.amount}
                          onChange={(e) => updateBulkPaymentRow(index, 'amount', e.target.value)}
                        />
                      </TableCell>
                      <TableCell>
                        <Select 
                          value={payment.paymentMethod} 
                          onValueChange={(value) => updateBulkPaymentRow(index, 'paymentMethod', value)}
                        >
                          <SelectTrigger className="w-32">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Cash">Cash</SelectItem>
                            <SelectItem value="Bank Transfer">Bank Transfer</SelectItem>
                            <SelectItem value="Card">Card</SelectItem>
                            <SelectItem value="UPI">UPI</SelectItem>
                            <SelectItem value="Online">Online</SelectItem>
                            <SelectItem value="Cheque">Cheque</SelectItem>
                            <SelectItem value="Mobile Wallet">Mobile Wallet</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>
                        <Input
                          placeholder="Reference"
                          value={payment.reference}
                          onChange={(e) => updateBulkPaymentRow(index, 'reference', e.target.value)}
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          placeholder="Notes"
                          value={payment.notes}
                          onChange={(e) => updateBulkPaymentRow(index, 'notes', e.target.value)}
                        />
                      </TableCell>
                      <TableCell>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => removeBulkPaymentRow(index)}
                          disabled={bulkFormData.payments.length === 1}
                        >
                          ❌
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            
            <div className="flex justify-between items-center pt-4">
              <Button onClick={addBulkPaymentRow} variant="outline">
                + Add Payment
              </Button>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setShowBulkDialog(false)}>
                  Cancel
                </Button>
                <Button onClick={handleBulkPayments}>
                  Process {bulkFormData.payments.length} Payments
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};