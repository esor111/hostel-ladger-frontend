;
    phone: string;
    email: string;
    roomNumber: string;
    course: string;
    institution: string;
    baseMonthlyFee: number;
    laundryFee: number;
    foodFee: number;
    joinDate: string;
    status: string;
    isCheckedOut: boolean;
    checkoutDate: string | null;
    currentBalance: number;
    totalPaid: number;
    totalDue: number;
    lastPaymentDate: string;
    configurationDate?: string;
    additionalCharges?: any[];
}

interface LedgerEntry {
    id: string;
    studentId: string;
    date: string;
    type: string;
    description: string;
    referenceId: string | null;
    debit: number;
    credit: number;
    balance?: number;
    balanceType?: string;
    remark?: string;
}

// Checkout Dialog Component
interface CheckoutDialogProps {
    student: Student;
    isOpen: boolean;
    onClose: () => void;
    onCheckoutComplete: (studentId: string) => void;
}

const CheckoutDialog = ({ student, isOpen, onClose, onCheckoutComplete }: CheckoutDialogProps) => {
    const [ledgerEntries, setLedgerEntries] = useState<LedgerEntry[]>([]);
    const [currentMonthBilling, setCurrentMonthBilling] = useState<any>(null);
    const [totalDueAmount, setTotalDueAmount] = useState(0);
    const [allowCheckoutWithoutPayment, setAllowCheckoutWithoutPayment] = useState(false);
    const [paymentAmount, setPaymentAmount] = useState("");
    const [paymentRemark, setPaymentRemark] = useState("");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (isOpen && student) {
            loadCheckoutData();
        }
    }, [isOpen, student]);

    const loadCheckoutData = async () => {
        try {
            setLoading(true);

            // Create sample ledger entries for demonstration
            const studentLedger: LedgerEntry[] = [
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

            setLedgerEntries(studentLedger);

            // Calculate current month's partial billing
            const today = new Date();
            const monthlyFee = student.baseMonthlyFee + student.laundryFee + student.foodFee;
            const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
            const daysCharged = today.getDate();
            const dailyRate = monthlyFee / daysInMonth;
            const partialAmount = dailyRate * daysCharged;

            const currentMonthProration = {
                period: today.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
                daysCharged,
                daysInMonth,
                dailyRate,
                amount: partialAmount
            };

            setCurrentMonthBilling(currentMonthProration);

            // Calculate total ledger balance
            const ledgerBalance = studentLedger.reduce((sum: number, entry: LedgerEntry) => {
                return sum + (entry.debit || 0) - (entry.credit || 0);
            }, 0);

            // Total due = existing ledger balance + current month's partial amount
            const totalDue = ledgerBalance + partialAmount;
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

            // Create local entry for immediate UI update
            const localPaymentEntry: LedgerEntry = {
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

            // Complete checkout
            onCheckoutComplete(student.id);
            onClose();

            // Show appropriate success message
            if (hasDues) {
                toast.warning(
                    `⚠️ Student checked out with dues of NPR ${totalDueAmount.toLocaleString()}. Bed ${student.roomNumber} freed and monthly invoices stopped.`,
                    { duration: 8000 }
                );
            } else {
                toast.success(
                    `✅ Student checked out successfully! All dues cleared. Bed ${student.roomNumber} freed and monthly invoices stopped.`,
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
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                    <LogOut className="h-5 w-5 text-[#1295D0]" />
                    Checkout - {student.name}
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
                            <p className="text-sm text-gray-600">{student.roomNumber} • {student.course}</p>
                        </div>
                    </div>
                </div>

                {/* Existing Ledger */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Calendar className="h-5 w-5" />
                                Existing Ledger
                            </div>
                            <Badge variant="outline" className="text-blue-600">
                                {ledgerEntries.length} Entries
                            </Badge>
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3 max-h-80 overflow-y-auto">
                            {ledgerEntries.map((entry, index) => (
                                <div key={entry.id} className={`p-4 rounded-lg border-l-4 ${entry.type === 'Invoice' ? 'bg-red-50 border-red-400' :
                                    entry.type === 'Payment' ? 'bg-green-50 border-green-400' :
                                        'bg-blue-50 border-blue-400'
                                    }`}>
                                    <div className="flex justify-between items-start">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-1">
                                                <Badge variant={entry.type === 'Invoice' ? 'destructive' : entry.type === 'Payment' ? 'default' : 'secondary'} className="text-xs">
                                                    {entry.type}
                                                </Badge>
                                                <span className="text-xs text-gray-500">#{entry.id}</span>
                                            </div>
                                            <p className="font-medium text-gray-900">{entry.description}</p>
                                            <p className="text-sm text-gray-600 mt-1">
                                                📅 {new Date(entry.date).toLocaleDateString('en-US', {
                                                    year: 'numeric',
                                                    month: 'short',
                                                    day: 'numeric'
                                                })}
                                                {entry.referenceId && (
                                                    <span className="ml-2">📄 Ref: {entry.referenceId}</span>
                                                )}
                                            </p>
                                            {entry.remark && (
                                                <p className="text-xs text-gray-500 mt-1 italic">💬 {entry.remark}</p>
                                            )}
                                        </div>
                                        <div className="text-right ml-4">
                                            {entry.debit > 0 && (
                                                <div className="text-red-600">
                                                    <p className="font-bold text-lg">NPR {entry.debit.toLocaleString()}</p>
                                                    <p className="text-xs">Debit</p>
                                                </div>
                                            )}
                                            {entry.credit > 0 && (
                                                <div className="text-green-600">
                                                    <p className="font-bold text-lg">NPR {entry.credit.toLocaleString()}</p>
                                                    <p className="text-xs">Credit</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}

                            {/* Ledger Summary */}
                            <div className="mt-4 p-4 bg-gray-100 rounded-lg border-t-4 border-gray-400">
                                <div className="flex justify-between items-center">
                                    <span className="font-medium text-gray-700">Ledger Balance:</span>
                                    <span className={`font-bold text-lg ${ledgerEntries.reduce((sum, entry) => sum + (entry.debit || 0) - (entry.credit || 0), 0) > 0
                                        ? 'text-red-600'
                                        : 'text-green-600'
                                        }`}>
                                        NPR {Math.abs(ledgerEntries.reduce((sum, entry) => sum + (entry.debit || 0) - (entry.credit || 0), 0)).toLocaleString()}
                                        {ledgerEntries.reduce((sum, entry) => sum + (entry.debit || 0) - (entry.credit || 0), 0) > 0 ? ' (Due)' : ' (Credit)'}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Current Month's Partial Billing */}
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
                                    <div className="flex justify-between">
                                        <span>Daily Rate:</span>
                                        <span className="font-medium">NPR {currentMonthBilling.dailyRate.toLocaleString()}</span>
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
                        <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                            <div className="flex justify-between items-center">
                                <span className="text-red-800 font-medium">Total Amount Due:</span>
                                <span className="text-3xl font-bold text-red-900">
                                    NPR {totalDueAmount.toLocaleString()}
                                </span>
                            </div>
                            <p className="text-sm text-red-600 mt-2">
                                Ledger Balance + Current Month's Partial Billing
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
                                    If enabled, student can checkout with dues (will be added to ledger)
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

export const StudentCheckoutManagement = () => {
    const [students, setStudents] = useState<Student[]>([]);
    const [filteredStudents, setFilteredStudents] = useState<Student[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [loading, setLoading] = useState(true);
    const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
    const [showCheckoutDialog, setShowCheckoutDialog] = useState(false);

    // Sample students data
    const sampleStudents: Student[] = [
        {
            id: "student_001",
            name: "Rajesh Kumar",
            phone: "+977-9841234567",
            email: "rajesh@example.com",
            roomNumber: "A-101",
            course: "Computer Science",
            institution: "Tribhuvan University",
            baseMonthlyFee: 8000,
            laundryFee: 1500,
            foodFee: 2000,
            joinDate: "2024-01-15",
            status: "active",
            isCheckedOut: false,
            checkoutDate: null,
            currentBalance: 2500,
            totalPaid: 45000,
            totalDue: 2500,
            lastPaymentDate: "2024-01-20"
        },
        {
            id: "student_002",
            name: "Priya Sharma",
            phone: "+977-9851234567",
            email: "priya@example.com",
            roomNumber: "B-205",
            course: "Business Administration",
            institution: "Kathmandu University",
            baseMonthlyFee: 7500,
            laundryFee: 1500,
            foodFee: 2500,
            joinDate: "2024-02-01",
            status: "active",
            isCheckedOut: false,
            checkoutDate: null,
            currentBalance: 0,
            totalPaid: 33000,
            totalDue: 0,
            lastPaymentDate: "2024-01-25"
        }
    ];

    // Load students data
    useEffect(() => {
        const loadStudents = async () => {
            try {
                const activeStudents = sampleStudents.filter((student: Student) =>
                    student.status === 'active' && !student.isCheckedOut
                );

                setStudents(activeStudents);
                setFilteredStudents(activeStudents);
            } catch (error) {
                console.error('Error loading students:', error);
                toast.error('Failed to load students data');
            } finally {
                setLoading(false);
            }
        };

        loadStudents();
    }, []);

    // Filter students based on search term
    useEffect(() => {
        if (!searchTerm.trim()) {
            setFilteredStudents(students);
        } else {
            const filtered = students.filter(student =>
                student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                student.roomNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                student.course.toLowerCase().includes(searchTerm.toLowerCase()) ||
                student.phone.includes(searchTerm)
            );
            setFilteredStudents(filtered);
        }
    }, [searchTerm, students]);

    const handleCheckoutComplete = (studentId: string) => {
        // Update student status
        setStudents(prev => prev.filter(s => s.id !== studentId));
        setFilteredStudents(prev => prev.filter(s => s.id !== studentId));
        
        toast.success('Student checkout completed successfully!');
    };

    const openCheckoutDialog = (student: Student) => {
        setSelectedStudent(student);
        setShowCheckoutDialog(true);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#07A64F]"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">Student Checkout Management</h2>
                    <p className="text-gray-600">Process student checkouts and manage dues</p>
                </div>
                <Badge variant="outline" className="text-lg px-3 py-1">
                    {filteredStudents.length} Active Students
                </Badge>
            </div>

            {/* Search */}
            <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                    placeholder="Search students by name, room, course, or phone..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                />
            </div>

            {/* Students Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredStudents.map((student) => (
                    <Card key={student.id} className="hover:shadow-lg transition-shadow">
                        <CardHeader className="pb-3">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 bg-gradient-to-br from-[#07A64F] to-[#1295D0] rounded-full flex items-center justify-center text-white font-bold">
                                    {student.name.charAt(0)}
                                </div>
                                <div className="flex-1">
                                    <CardTitle className="text-lg">{student.name}</CardTitle>
                                    <div className="flex items-center gap-2 text-sm text-gray-600">
                                        <Bed className="h-4 w-4" />
                                        {student.roomNumber}
                                    </div>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-gray-600">Course:</span>
                                    <span className="font-medium">{student.course}</span>
                                </div>
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-gray-600">Monthly Fee:</span>
                                    <span className="font-medium">NPR {(student.baseMonthlyFee + student.laundryFee + student.foodFee).toLocaleString()}</span>
                                </div>
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-gray-600">Current Balance:</span>
                                    <span className={`font-bold ${student.currentBalance > 0 ? 'text-red-600' : 'text-green-600'}`}>
                                        NPR {Math.abs(student.currentBalance).toLocaleString()}
                                        {student.currentBalance > 0 ? ' (Due)' : ' (Credit)'}
                                    </span>
                                </div>
                            </div>

                            <Button
                                onClick={() => openCheckoutDialog(student)}
                                className="w-full bg-[#1295D0] hover:bg-[#1295D0]/90"
                            >
                                <LogOut className="h-4 w-4 mr-2" />
                                Checkout Student
                            </Button>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {filteredStudents.length === 0 && (
                <div className="text-center py-12">
                    <User className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No students found</h3>
                    <p className="text-gray-500">
                        {searchTerm ? 'Try adjusting your search criteria' : 'No active students available for checkout'}
                    </p>
                </div>
            )}

            {/* Checkout Dialog */}
            <Dialog open={showCheckoutDialog} onOpenChange={setShowCheckoutDialog}>
                {selectedStudent && (
                    <CheckoutDialog
                        student={selectedStudent}
                        isOpen={showCheckoutDialog}
                        onClose={() => setShowCheckoutDialog(false)}
                        onCheckoutComplete={handleCheckoutComplete}
                    />
                )}
            </Dialog>
        </div>
    );
};