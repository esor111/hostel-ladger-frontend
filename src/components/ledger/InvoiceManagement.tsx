
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Edit } from "lucide-react";

interface Invoice {
  id: string;
  studentName: string;
  room: string;
  month: string;
  baseFee: number;
  extraServices: number;
  previousDue: number;
  discount: number;
  totalAmount: number;
  status: 'unpaid' | 'partially_paid' | 'paid';
  createdDate: string;
  dueDate: string;
}

export const InvoiceManagement = () => {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [stats, setStats] = useState<InvoiceStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterMonth, setFilterMonth] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [showViewDialog, setShowViewDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showGenerateDialog, setShowGenerateDialog] = useState(false);
  const [editFormData, setEditFormData] = useState<{
    status: string;
    notes: string;
    dueDate: string;
  } | null>(null);
  const [createFormData, setCreateFormData] = useState({
    studentId: '',
    month: '',
    notes: ''
  });
  const [generateFormData, setGenerateFormData] = useState({
    month: '',
    studentIds: [] as string[]
  });
  const { toast } = useToast();

  // Fetch invoices and stats
  const fetchInvoices = async () => {
    try {
      setLoading(true);
      const filters = {
        status: filterStatus !== 'all' ? filterStatus : undefined,
        month: filterMonth !== 'all' ? filterMonth : undefined,
        search: searchTerm || undefined
      };
      
      const [invoicesData, statsData] = await Promise.all([
        invoiceService.getInvoices(filters),
        invoiceService.getInvoiceStats()
      ]);
      
      setInvoices(invoicesData);
      setStats(statsData);
    } catch (error) {
      console.error('Error fetching invoices:', error);
      toast({
        title: "Error",
        description: "Failed to fetch invoices. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoices();
  }, [filterStatus, filterMonth, searchTerm]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Paid":
        return <Badge className="bg-green-100 text-green-800">✅ Paid</Badge>;
      case "Partially Paid":
        return <Badge className="bg-yellow-100 text-yellow-800">⚠️ Partially Paid</Badge>;
      case "Unpaid":
        return <Badge className="bg-red-100 text-red-800">❌ Unpaid</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  // Handle invoice operations
  const handleCreateInvoice = async () => {
    try {
      if (!createFormData.studentId || !createFormData.month) {
        toast({
          title: "Validation Error",
          description: "Please fill in all required fields.",
          variant: "destructive"
        });
        return;
      }

      await invoiceService.createInvoice(createFormData);
      toast({
        title: "Success",
        description: "Invoice created successfully!",
      });
      
      setShowCreateDialog(false);
      setCreateFormData({ studentId: '', month: '', notes: '' });
      fetchInvoices();
    } catch (error) {
      toast({
        title: "Error",
        description: error.message || "Failed to create invoice.",
        variant: "destructive"
      });
    }
  };

  const handleUpdateInvoice = async () => {
    try {
      if (!selectedInvoice || !editFormData) return;

      await invoiceService.updateInvoice(selectedInvoice.id, editFormData);
      toast({
        title: "Success",
        description: "Invoice updated successfully!",
      });
      
      setShowEditDialog(false);
      fetchInvoices();
    } catch (error) {
      toast({
        title: "Error",
        description: error.message || "Failed to update invoice.",
        variant: "destructive"
      });
    }
  };

  const handleGenerateMonthlyInvoices = async () => {
    try {
      if (!generateFormData.month) {
        toast({
          title: "Validation Error",
          description: "Please select a month.",
          variant: "destructive"
        });
        return;
      }

      const result = await invoiceService.generateMonthlyInvoices(
        generateFormData.month,
        generateFormData.studentIds.length > 0 ? generateFormData.studentIds : null
      );
      
      toast({
        title: "Success",
        description: `Generated ${result.successCount} invoices successfully! ${result.skippedCount} skipped, ${result.failedCount} failed.`,
      });
      
      setShowGenerateDialog(false);
      setGenerateFormData({ month: '', studentIds: [] });
      fetchInvoices();
    } catch (error) {
      toast({
        title: "Error",
        description: error.message || "Failed to generate invoices.",
        variant: "destructive"
      });
    }
  };

  const handleSendInvoice = async (invoiceId: string) => {
    try {
      await invoiceService.sendInvoice(invoiceId, 'email');
      toast({
        title: "Success",
        description: "Invoice sent successfully!",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error.message || "Failed to send invoice.",
        variant: "destructive"
      });
    }
  };

  const handleViewInvoice = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setShowViewDialog(true);
  };

  const handlePrintInvoice = (invoice: Invoice) => {
    toast({
      title: "Printing Invoice",
      description: `Printing invoice ${invoice.id} for ${invoice.studentName}`,
    });
    // In a real app, this would trigger the print functionality
    window.print();
  };

  const handleEditInvoice = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setEditFormData({
      status: invoice.status,
      notes: invoice.notes || '',
      dueDate: invoice.dueDate
    });
    setShowEditDialog(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold text-gray-900">🧾 Invoice Management</h2>
        <Button>➕ Generate Bulk Invoices</Button>
      </div>

      {/* Statistics Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-green-600">
                ₨{stats.paidAmount.toLocaleString()}
              </div>
              <div className="text-sm text-gray-500">Total Paid ({stats.paidInvoices} invoices)</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-red-600">
                ₨{stats.outstandingAmount.toLocaleString()}
              </div>
              <div className="text-sm text-gray-500">Outstanding ({stats.unpaidInvoices + stats.partiallyPaidInvoices} invoices)</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-yellow-600">
                {stats.partiallyPaidInvoices}
              </div>
              <div className="text-sm text-gray-500">Partially Paid</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-blue-600">
                {stats.collectionRate}%
              </div>
              <div className="text-sm text-gray-500">Collection Rate</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters and Actions */}
      <Card>
        <CardHeader>
          <CardTitle>🔍 Filter & Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4 items-center">
            <div>
              <Input
                placeholder="Search invoices..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-64"
              />
            </div>
            <div>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="Paid">✅ Paid</SelectItem>
                  <SelectItem value="Partially Paid">⚠️ Partially Paid</SelectItem>
                  <SelectItem value="Unpaid">❌ Unpaid</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Select value={filterMonth} onValueChange={setFilterMonth}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Filter by month" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Months</SelectItem>
                  <SelectItem value="2024-07">July 2024</SelectItem>
                  <SelectItem value="2024-06">June 2024</SelectItem>
                  <SelectItem value="2024-05">May 2024</SelectItem>
                  <SelectItem value="2024-04">April 2024</SelectItem>
                  <SelectItem value="2024-03">March 2024</SelectItem>
                  <SelectItem value="2024-02">February 2024</SelectItem>
                  <SelectItem value="2024-01">January 2024</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-2">
              <Button onClick={() => setShowCreateDialog(true)} className="flex items-center gap-2">
                <Plus size={16} />
                Create Invoice
              </Button>
              <Button onClick={() => setShowGenerateDialog(true)} variant="outline" className="flex items-center gap-2">
                <FileText size={16} />
                Generate Monthly
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Invoices Table */}
      <Card>
        <CardHeader>
          <CardTitle>Invoice List ({invoices.length} invoices)</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center items-center py-8">
              <Loader2 className="h-8 w-8 animate-spin" />
              <span className="ml-2">Loading invoices...</span>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Invoice ID</TableHead>
                  <TableHead>Student</TableHead>
                  <TableHead>Month</TableHead>
                  <TableHead>Items</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invoices.map((invoice) => (
                  <TableRow key={invoice.id}>
                    <TableCell className="font-medium">{invoice.id}</TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{invoice.studentName}</div>
                        <div className="text-sm text-gray-500">Room: {invoice.roomNumber}</div>
                      </div>
                    </TableCell>
                    <TableCell>{invoice.month}</TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {invoice.items.map((item, index) => (
                          <div key={item.id}>
                            {item.description}: ₨{item.amount.toLocaleString()}
                          </div>
                        ))}
                        {invoice.discountTotal > 0 && (
                          <div className="text-green-600">Discount: -₨{invoice.discountTotal.toLocaleString()}</div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="font-bold text-lg">
                      ₨{invoice.total.toLocaleString()}
                    </TableCell>
                    <TableCell>{getStatusBadge(invoice.status)}</TableCell>
                    <TableCell>
                      <div className={`${new Date(invoice.dueDate) < new Date() && invoice.status !== 'Paid' ? 'text-red-600 font-medium' : ''}`}>
                        {new Date(invoice.dueDate).toLocaleDateString()}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-1">
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleViewInvoice(invoice)}
                          title="View Invoice"
                        >
                          👁️
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handlePrintInvoice(invoice)}
                          title="Print Invoice"
                        >
                          🖨️
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleEditInvoice(invoice)}
                          title="Edit Invoice"
                        >
                          <Edit size={14} />
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleSendInvoice(invoice.id)}
                          title="Send Invoice"
                        >
                          <Send size={14} />
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

      {/* Create Invoice Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Create New Invoice</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="studentId">Student ID *</Label>
              <Input
                id="studentId"
                placeholder="Enter student ID (e.g., S001)"
                value={createFormData.studentId}
                onChange={(e) => setCreateFormData({...createFormData, studentId: e.target.value})}
              />
            </div>
            <div>
              <Label htmlFor="month">Month *</Label>
              <Input
                id="month"
                type="month"
                value={createFormData.month}
                onChange={(e) => setCreateFormData({...createFormData, month: e.target.value})}
              />
            </div>
            <div>
              <Label htmlFor="notes">Notes</Label>
              <Input
                id="notes"
                placeholder="Optional notes"
                value={createFormData.notes}
                onChange={(e) => setCreateFormData({...createFormData, notes: e.target.value})}
              />
            </div>
            <div className="flex gap-2 pt-4">
              <Button variant="outline" onClick={() => setShowCreateDialog(false)} className="flex-1">
                Cancel
              </Button>
              <Button onClick={handleCreateInvoice} className="flex-1">
                Create Invoice
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Generate Monthly Invoices Dialog */}
      <Dialog open={showGenerateDialog} onOpenChange={setShowGenerateDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Generate Monthly Invoices</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="generateMonth">Month *</Label>
              <Input
                id="generateMonth"
                type="month"
                value={generateFormData.month}
                onChange={(e) => setGenerateFormData({...generateFormData, month: e.target.value})}
              />
            </div>
            <div>
              <Label htmlFor="studentIds">Specific Students (Optional)</Label>
              <Input
                id="studentIds"
                placeholder="Enter student IDs separated by commas (e.g., S001,S002)"
                value={generateFormData.studentIds.join(',')}
                onChange={(e) => setGenerateFormData({
                  ...generateFormData, 
                  studentIds: e.target.value.split(',').map(id => id.trim()).filter(id => id)
                })}
              />
              <div className="text-sm text-gray-500 mt-1">
                Leave empty to generate for all active students
              </div>
            </div>
            <div className="flex gap-2 pt-4">
              <Button variant="outline" onClick={() => setShowGenerateDialog(false)} className="flex-1">
                Cancel
              </Button>
              <Button onClick={handleGenerateMonthlyInvoices} className="flex-1">
                Generate Invoices
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* View Invoice Dialog */}
      <Dialog open={showViewDialog} onOpenChange={setShowViewDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Invoice Details - {selectedInvoice?.id}</DialogTitle>
          </DialogHeader>
          {selectedInvoice && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold">Student Information</h4>
                  <p>Name: {selectedInvoice.studentName}</p>
                  <p>Room: {selectedInvoice.roomNumber}</p>
                </div>
                <div>
                  <h4 className="font-semibold">Invoice Information</h4>
                  <p>Month: {selectedInvoice.month}</p>
                  <p>Status: {selectedInvoice.status}</p>
                  <p>Due Date: {new Date(selectedInvoice.dueDate).toLocaleDateString()}</p>
                </div>
              </div>
              
              <div className="border-t pt-4">
                <h4 className="font-semibold mb-2">Invoice Items</h4>
                <div className="space-y-2">
                  {selectedInvoice.items.map((item) => (
                    <div key={item.id} className="flex justify-between">
                      <span>{item.description}:</span>
                      <span>₨{item.amount.toLocaleString()}</span>
                    </div>
                  ))}
                  {selectedInvoice.discountTotal > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>Discount:</span>
                      <span>-₨{selectedInvoice.discountTotal.toLocaleString()}</span>
                    </div>
                  )}
                  <div className="flex justify-between font-bold text-lg border-t pt-2">
                    <span>Total Amount:</span>
                    <span>₨{selectedInvoice.total.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>Balance Due:</span>
                    <span>₨{selectedInvoice.balanceDue.toLocaleString()}</span>
                  </div>
                </div>
              </div>
              
              <div className="flex gap-2 pt-4">
                <Button onClick={() => handlePrintInvoice(selectedInvoice)} className="flex-1">
                  🖨️ Print Invoice
                </Button>
                <Button variant="outline" onClick={() => setShowViewDialog(false)} className="flex-1">
                  Close
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Invoice Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Invoice - {selectedInvoice?.id}</DialogTitle>
          </DialogHeader>
          {selectedInvoice && editFormData && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="status">Status</Label>
                <Select value={editFormData.status} onValueChange={(value) => setEditFormData({...editFormData, status: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Unpaid">❌ Unpaid</SelectItem>
                    <SelectItem value="Partially Paid">⚠️ Partially Paid</SelectItem>
                    <SelectItem value="Paid">✅ Paid</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="dueDate">Due Date</Label>
                <Input
                  id="dueDate"
                  type="date"
                  value={editFormData.dueDate}
                  onChange={(e) => setEditFormData({...editFormData, dueDate: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="notes">Notes</Label>
                <Input
                  id="notes"
                  placeholder="Optional notes"
                  value={editFormData.notes}
                  onChange={(e) => setEditFormData({...editFormData, notes: e.target.value})}
                />
              </div>

              <div className="border-t pt-4">
                <div className="flex justify-between items-center text-lg font-bold">
                  <span>Total Amount:</span>
                  <span className="text-blue-600">
                    ₨{selectedInvoice.total.toLocaleString()}
                  </span>
                </div>
              </div>

              <div className="flex gap-2 pt-4">
                <Button variant="outline" onClick={() => setShowEditDialog(false)} className="flex-1">
                  Cancel
                </Button>
                <Button onClick={handleUpdateInvoice} className="flex-1">
                  Save Changes
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};
