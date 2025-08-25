
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useAppContext } from "@/contexts/AppContext";
import { discountService } from "@/services/discountService";
import { CheckCircle, History, Gift } from "lucide-react";

interface Discount {
  id: string;
  studentName: string;
  room: string;
  amount: number;
  reason: string;
  appliedTo: string;
  date: string;
  status: 'active' | 'expired';
}

export const DiscountManagement = () => {
  const { state, refreshAllData } = useAppContext();
  const { toast } = useToast();
  const [showDiscountForm, setShowDiscountForm] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState("");
  const [discountAmount, setDiscountAmount] = useState("");
  const [discountReason, setDiscountReason] = useState("");
  const [customReason, setCustomReason] = useState("");
  const [notes, setNotes] = useState("");
  const [discountHistory, setDiscountHistory] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);

  // Load discount history on component mount
  useEffect(() => {
    loadDiscountHistory();
  }, []);

  const loadDiscountHistory = async () => {
    try {
      const history = await discountService.getDiscountHistory();
      setDiscountHistory(history);
    } catch (error) {
      console.error('Error loading discount history:', error);
    }
  };

  // Use real student data from context
  const students = state.students;

  const discountReasons = [
    "Good Behavior",
    "Early Payment", 
    "Referral Bonus",
    "Financial Hardship",
    "Long-term Stay",
    "Sibling Discount",
    "Academic Excellence",
    "Custom reason"
  ];

  // Calculate totals
  const totalActiveDiscounts = discountHistory
    .filter(d => d.status === 'active')
    .reduce((sum, d) => sum + parseFloat(d.amount || 0), 0);

  const handleDiscountSubmit = async () => {
    if (!selectedStudent || !discountAmount || !discountReason) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    if (parseFloat(discountAmount) <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Discount amount must be greater than 0",
        variant: "destructive"
      });
      return;
    }

    if (discountReason === "Custom reason" && !customReason.trim()) {
      toast({
        title: "Missing Custom Reason",
        description: "Please enter a custom reason for the discount",
        variant: "destructive"
      });
      return;
    }

    setIsProcessing(true);

    try {
      const discountData = {
        studentId: selectedStudent,
        amount: parseFloat(discountAmount),
        reason: discountReason === "Custom reason" ? customReason : discountReason,
        notes: notes.trim(),
        appliedBy: "Admin" // In real app, get from auth context
      };

      const result = await discountService.applyDiscount(discountData);

      if (result.success) {
        toast({
          title: "Discount Applied Successfully",
          description: `NPR ${discountAmount} discount applied to ${result.studentName}'s ledger`,
        });

        // Reset form
        setSelectedStudent("");
        setDiscountAmount("");
        setDiscountReason("");
        setCustomReason("");
        setNotes("");
        setShowDiscountForm(false);

        // Refresh data
        await refreshAllData();
        await loadDiscountHistory();
      } else {
        throw new Error(result.error);
      }

    } catch (error) {
      toast({
        title: "Error Applying Discount",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold text-[#231F20]">🏷️ Discount Management</h2>
        <Button 
          onClick={() => setShowDiscountForm(true)}
          className="bg-[#07A64F] hover:bg-[#07A64F]/90 text-white border-0"
        >
          ➕ Apply New Discount
        </Button>
      </div>

      {/* Discount Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-[#1295D0]/20">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="bg-[#1295D0]/10 p-2 rounded-full">
              <Gift className="h-5 w-5 text-[#1295D0]" />
            </div>
            <div>
              <div className="text-2xl font-bold text-[#1295D0]">
                ₨{totalActiveDiscounts.toLocaleString()}
              </div>
              <div className="text-sm text-gray-500">Total Active Discounts</div>
              <div className="text-xs mt-1 text-[#1295D0]">💰 Currently applied</div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-[#07A64F]/20">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="bg-[#07A64F]/10 p-2 rounded-full">
              <CheckCircle className="h-5 w-5 text-[#07A64F]" />
            </div>
            <div>
              <div className="text-2xl font-bold text-[#07A64F]">
                {discountHistory.filter(d => d.status === 'active').length}
              </div>
              <div className="text-sm text-gray-500">Active Discount Records</div>
              <div className="text-xs mt-1 text-[#07A64F]">📊 Current count</div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-gray-200">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="bg-gray-100 p-2 rounded-full">
              <History className="h-5 w-5 text-gray-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-600">
                {discountHistory.length}
              </div>
              <div className="text-sm text-gray-500">Total Discount History</div>
              <div className="text-xs mt-1 text-gray-600">📋 All time</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Discounts Table */}
      <Card>
        <CardHeader>
          <CardTitle>Discount Records</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Discount ID</TableHead>
                <TableHead>Student</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Reason</TableHead>
                <TableHead>Applied To</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {discountHistory.length > 0 ? (
                discountHistory.map((discount) => (
                  <TableRow key={discount.id}>
                    <TableCell className="font-medium">{discount.id}</TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{discount.studentName}</div>
                        <div className="text-sm text-gray-500">Room: {discount.room}</div>
                      </div>
                    </TableCell>
                    <TableCell className="font-bold text-green-600">
                      ₨{discount.amount.toLocaleString()}
                    </TableCell>
                    <TableCell>{discount.reason}</TableCell>
                    <TableCell>Ledger</TableCell>
                    <TableCell>{new Date(discount.date).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <Badge variant={discount.status === 'active' ? 'default' : 'secondary'}>
                        {discount.status === 'active' ? '✅ Active' : '⏰ Expired'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-1">
                        <Button size="sm" variant="outline">👁️</Button>
                        {discount.status === 'active' && (
                          <Button size="sm" variant="outline">❌</Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-4 text-gray-500">
                    No discount history found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Apply Discount Form Modal */}
      {showDiscountForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-lg m-4">
            <CardHeader>
              <CardTitle>🏷️ Apply New Discount</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="student">Select Student *</Label>
                <Select value={selectedStudent} onValueChange={setSelectedStudent}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose student" />
                  </SelectTrigger>
                  <SelectContent>
                    {students.map((student) => (
                      <SelectItem key={student.id} value={student.id}>
                        {student.name} - Room {student.roomNumber}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="amount">Discount Amount (₨) *</Label>
                <Input
                  id="amount"
                  type="number"
                  placeholder="Enter discount amount"
                  value={discountAmount}
                  onChange={(e) => setDiscountAmount(e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="reason">Discount Reason *</Label>
                <Select value={discountReason} onValueChange={setDiscountReason}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select discount reason" />
                  </SelectTrigger>
                  <SelectContent>
                    {discountReasons.map((reason) => (
                      <SelectItem key={reason} value={reason}>
                        {reason}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {discountReason === "Custom reason" && (
                <div>
                  <Label htmlFor="customReason">Custom Reason *</Label>
                  <Input
                    id="customReason"
                    placeholder="Enter custom reason"
                    value={customReason}
                    onChange={(e) => setCustomReason(e.target.value)}
                  />
                </div>
              )}

              <div>
                <Label htmlFor="notes">Admin Notes</Label>
                <Textarea
                  id="notes"
                  placeholder="Optional notes about this discount"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                />
              </div>

              <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                <div className="flex items-start gap-2">
                  <Gift className="h-4 w-4 text-green-600 mt-0.5" />
                  <div className="text-sm text-green-800">
                    <p className="font-medium">Discount will be:</p>
                    <ul className="mt-1 space-y-1">
                      <li>• Applied directly to student ledger (not invoice)</li>
                      <li>• Recorded as one-time discount with history</li>
                      <li>• Student balance reduced immediately</li>
                      <li>• Cannot be applied multiple times</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-4">
                <Button variant="outline" onClick={() => setShowDiscountForm(false)}>
                  Cancel
                </Button>
                <Button 
                  onClick={handleDiscountSubmit}
                  disabled={!selectedStudent || !discountAmount || !discountReason || isProcessing}
                  className="bg-[#07A64F] hover:bg-[#07A64F]/90 text-white border-0"
                >
                  {isProcessing ? 'Processing...' : '💾 Apply Discount to Ledger'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};
