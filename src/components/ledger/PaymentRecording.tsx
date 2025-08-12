import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useLocation } from "react-router-dom";
import { useAppContext } from "@/contexts/AppContext";
import { useToast } from "@/hooks/use-toast";
import { Receipt } from "lucide-react";
import { paymentService } from "@/services/paymentService.js";

interface Payment {
  id: string;
  studentId: string;
  studentName: string;
  amount: number;
  paymentMethod: string;
  paymentDate: string;
  reference?: string;
  notes?: string;
  status: string;
  createdBy: string;
  createdAt: string;
  invoiceIds: string[];
}

const PaymentRecording = () => {
  const { state } = useAppContext();
  const location = useLocation();
  const { toast } = useToast();
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState("");
  const [paymentAmount, setPaymentAmount] = useState("");
  const [paymentMode, setPaymentMode] = useState("");
  const [referenceId, setReferenceId] = useState("");

  // Handle URL parameters to auto-select student and show payment form
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const studentParam = params.get("student");
    const amountParam = params.get("amount");
    const typeParam = params.get("type");

    if (studentParam && state.students.find((s) => s.id === studentParam)) {
      setSelectedStudent(studentParam);
      setShowPaymentForm(true);

      // Pre-fill amount if provided
      if (amountParam) {
        setPaymentAmount(amountParam);
      }

      // Set default payment mode for outstanding dues
      if (typeParam === "outstanding") {
        setPaymentMode("cash");
      }

      const student = state.students.find((s) => s.id === studentParam);
      toast({
        title: "Payment Form Ready",
        description: `Payment form opened for ${student?.name}${
          amountParam
            ? ` with amount NPR ${Number(amountParam).toLocaleString()}`
            : ""
        }.`,
      });
    }
  }, [location.search, state.students, toast]);

  // Real payment data from API
  const [payments, setPayments] = useState<Payment[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load payments from API
  useEffect(() => {
    const loadPayments = async () => {
      try {
        setIsLoading(true);
        const paymentsData = await paymentService.getPayments();
        setPayments(paymentsData);
      } catch (error) {
        console.error("Error loading payments:", error);
        toast({
          title: "Error",
          description: "Failed to load payment data",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadPayments();
  }, [toast]);

  // Use real student data from context
  const students = state.students.map((student) => ({
    id: student.id,
    name: student.name,
    room: student.roomNumber,
    outstandingDue: student.currentBalance || 0,
    advanceBalance: student.advanceBalance || 0,
  }));

  const paymentModes = [
    { value: "cash", label: "💵 Cash" },
    { value: "bank_transfer", label: "🏦 Bank Transfer" },
    { value: "upi", label: "📱 UPI" },
    { value: "card", label: "💳 Card" },
    { value: "cheque", label: "📝 Cheque" },
    { value: "online", label: "🌐 Online" },
  ];

  const needsReference =
    paymentMode === "upi" ||
    paymentMode === "bank_transfer" ||
    paymentMode === "card" ||
    paymentMode === "online";

  const handlePaymentSubmit = async () => {
    try {
      const selectedStudentData = students.find(
        (s) => s.id === selectedStudent
      );
      if (!selectedStudentData) {
        toast({
          title: "Error",
          description: "Please select a valid student",
          variant: "destructive",
        });
        return;
      }

      const paymentData = {
        studentId: selectedStudent,
        amount: parseFloat(paymentAmount),
        paymentMethod: paymentMode,
        referenceNumber: referenceId || null,
        notes: `Payment recorded for ${selectedStudentData.name}`,
        status: "Completed",
        processedBy: "admin",
      };

      await paymentService.recordPayment(paymentData);

      toast({
        title: "Success",
        description: `Payment of NPR ${Number(
          paymentAmount
        ).toLocaleString()} recorded successfully`,
      });

      // Refresh payments list
      const updatedPayments = await paymentService.getPayments();
      setPayments(updatedPayments);

      // Reset form
      setShowPaymentForm(false);
      setSelectedStudent("");
      setPaymentAmount("");
      setPaymentMode("");
      setReferenceId("");
    } catch (error) {
      console.error("Error recording payment:", error);
      toast({
        title: "Error",
        description: "Failed to record payment. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold text-gray-900">
          💰 Payment Recording
        </h2>
        <Button onClick={() => setShowPaymentForm(true)}>
          ➕ Record New Payment
        </Button>
      </div>

      {/* Outstanding Dues Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Outstanding Dues Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {students
              .filter((s) => s.outstandingDue < 0)
              .map((student) => (
                <div
                  key={student.id}
                  className="p-4 border rounded-lg bg-red-50 border-red-200"
                >
                  <div className="font-medium">{student.name}</div>
                  <div className="text-sm text-gray-600">
                    Room: {student.room}
                  </div>
                  <div className="text-lg font-bold text-red-600 mt-2">
                    NPR {Math.abs(student.outstandingDue).toLocaleString()}
                  </div>
                  <Button
                    size="sm"
                    className="mt-2 w-full"
                    onClick={() => {
                      setSelectedStudent(student.id);
                      setPaymentAmount(
                        Math.abs(student.outstandingDue).toString()
                      );
                      setShowPaymentForm(true);
                    }}
                  >
                    💰 Record Payment
                  </Button>
                </div>
              ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Payments */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Receipt className="h-5 w-5" />
            Recent Payments ({payments.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-2">Loading payments...</span>
            </div>
          ) : payments.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Payment ID</TableHead>
                  <TableHead>Student</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Mode</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payments.map((payment) => (
                  <TableRow key={payment.id}>
                    <TableCell className="font-medium">
                      {payment.id.slice(0, 8)}...
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{payment.studentName}</div>
                        <div className="text-sm text-gray-500">
                          ID: {payment.studentId.slice(0, 8)}...
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="font-bold text-green-600">
                      NPR {payment.amount.toLocaleString()}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{payment.paymentMethod}</Badge>
                    </TableCell>
                    <TableCell>
                      {new Date(payment.paymentDate).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <Badge className="bg-green-100 text-green-800">
                        {payment.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8">
              <Receipt className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <p className="text-gray-600">No payments found</p>
              <p className="text-sm text-gray-500">
                Payments will appear here once recorded
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Payment Recording Form Modal */}
      {showPaymentForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-lg m-4">
            <CardHeader>
              <CardTitle>Record New Payment</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="student">Select Student *</Label>
                <Select
                  value={selectedStudent}
                  onValueChange={setSelectedStudent}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Choose student" />
                  </SelectTrigger>
                  <SelectContent>
                    {students.map((student) => (
                      <SelectItem key={student.id} value={student.id}>
                        {student.name} - Room {student.room}
                        {student.outstandingDue < 0 && (
                          <span className="text-red-600 ml-2">
                            (Due: NPR{" "}
                            {Math.abs(student.outstandingDue).toLocaleString()})
                          </span>
                        )}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="amount">Payment Amount (NPR) *</Label>
                <Input
                  id="amount"
                  type="number"
                  placeholder="Enter amount"
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="mode">Payment Mode *</Label>
                <Select value={paymentMode} onValueChange={setPaymentMode}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select payment mode" />
                  </SelectTrigger>
                  <SelectContent>
                    {paymentModes.map((mode) => (
                      <SelectItem key={mode.value} value={mode.value}>
                        {mode.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {needsReference && (
                <div>
                  <Label htmlFor="reference">
                    Reference ID *
                    <span className="text-sm text-gray-500 ml-1">
                      (Transaction ID, Cheque Number, etc.)
                    </span>
                  </Label>
                  <Input
                    id="reference"
                    placeholder="Enter reference ID"
                    value={referenceId}
                    onChange={(e) => setReferenceId(e.target.value)}
                  />
                </div>
              )}

              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-medium text-blue-800 mb-2">
                  💡 Payment Application Rules:
                </h4>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>
                    • Payment will be applied to oldest outstanding invoice
                    first
                  </li>
                  <li>• Any excess amount will be stored as advance balance</li>
                  <li>• Advance balance auto-applies to future invoices</li>
                </ul>
              </div>

              <div className="flex justify-end space-x-2 pt-4">
                <Button
                  variant="outline"
                  onClick={() => setShowPaymentForm(false)}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handlePaymentSubmit}
                  disabled={
                    !selectedStudent ||
                    !paymentAmount ||
                    !paymentMode ||
                    (needsReference && !referenceId)
                  }
                >
                  💾 Record Payment
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default PaymentRecording;
