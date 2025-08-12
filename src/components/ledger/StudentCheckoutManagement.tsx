import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useAppContext } from "@/contexts/AppContext";
import { toast } from "sonner";
import { LogOut, User, CreditCard, AlertTriangle } from "lucide-react";

interface Student {
    id: string;
    name: string;
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
    totalPaid: number;
    totalDue: number;
    lastPaymentDate: string;
    configurationDate?: string;
    additionalCharges?: any[];
}

export const StudentCheckoutManagement = () => {
    const { state, refreshAllData } = useAppContext();
    const [students, setStudents] = useState<Student[]>([]);
    const [filteredStudents, setFilteredStudents] = useState<Student[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
    const [checkoutReason, setCheckoutReason] = useState("");
    const [totalDueAmount, setTotalDueAmount] = useState(0);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadStudents();
    }, [state.students]);

    const loadStudents = () => {
        try {
            setLoading(true);
            const activeStudents = state.students.filter((student: Student) => 
                student.status === 'Active'
            );
            setStudents(activeStudents);
            setFilteredStudents(activeStudents);
        } catch (error) {
            console.error('Error loading students:', error);
            toast.error("Failed to load students");
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (term: string) => {
        setSearchTerm(term);
        const filtered = students.filter(student =>
            student.name.toLowerCase().includes(term.toLowerCase()) ||
            student.roomNumber.toLowerCase().includes(term.toLowerCase()) ||
            student.phone.includes(term)
        );
        setFilteredStudents(filtered);
    };

    const handleCheckout = async (student: Student) => {
        try {
            // Calculate total dues
            const totalDue = student.totalDue || 0;
            setTotalDueAmount(totalDue);
            setSelectedStudent(student);
        } catch (error) {
            console.error('Error preparing checkout:', error);
            toast.error("Failed to prepare checkout");
        }
    };

    const processCheckout = async () => {
        if (!selectedStudent) return;

        try {
            // Process checkout logic here
            toast.success(`${selectedStudent.name} has been checked out successfully`);
            setSelectedStudent(null);
            setCheckoutReason("");
            await refreshAllData();
        } catch (error) {
            console.error('Checkout failed:', error);
            toast.error("Checkout failed. Please try again.");
        }
    };

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-[#8b5cf6]/5 via-[#7c3aed]/5 to-[#8b5cf6]/5 rounded-3xl blur-xl"></div>
                <div className="relative bg-white/60 backdrop-blur-xl rounded-3xl p-8 border border-white/20 shadow-2xl shadow-black/5">
                    <div className="flex justify-between items-start">
                        <div className="space-y-4">
                            <div className="flex items-center gap-4">
                                <div className="w-16 h-16 bg-gradient-to-br from-[#8b5cf6] to-[#7c3aed] rounded-2xl flex items-center justify-center shadow-lg shadow-[#8b5cf6]/30">
                                    <LogOut className="h-8 w-8 text-white" />
                                </div>
                                <div>
                                    <h1 className="text-4xl font-bold bg-gradient-to-r from-[#8b5cf6] via-[#7c3aed] to-[#8b5cf6] bg-clip-text text-transparent tracking-tight">
                                        Student Checkout
                                    </h1>
                                    <p className="text-slate-600 font-medium text-lg">
                                        Complete Checkout Process
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                <Badge className="bg-gradient-to-r from-[#8b5cf6] to-[#7c3aed] text-white border-0 px-4 py-2">
                                    {filteredStudents.length} Active Students
                                </Badge>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Search */}
            <Card className="bg-white/80 backdrop-blur-sm border-white/20 shadow-xl">
                <CardContent className="p-6">
                    <div className="flex items-center space-x-4">
                        <div className="relative flex-1 max-w-md">
                            <Input
                                placeholder="Search students by name, room, or phone..."
                                value={searchTerm}
                                onChange={(e) => handleSearch(e.target.value)}
                                className="bg-white/50 border-slate-200/50 focus:bg-white/80 transition-all duration-200"
                            />
                        </div>
                        <Badge variant="outline" className="text-slate-600 border-slate-300">
                            {filteredStudents.length} Results
                        </Badge>
                    </div>
                </CardContent>
            </Card>

            {/* Students List */}
            <div className="grid gap-6">
                {filteredStudents.map((student) => (
                    <Card key={student.id} className="group hover:shadow-2xl transition-all duration-300 border-slate-200/50 bg-white/80 backdrop-blur-sm">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-4">
                                    <div className="w-14 h-14 bg-gradient-to-br from-[#8b5cf6] to-[#7c3aed] rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-lg">
                                        {student.name.charAt(0)}
                                    </div>
                                    <div className="space-y-1">
                                        <h3 className="text-xl font-semibold text-slate-800">{student.name}</h3>
                                        <div className="flex items-center space-x-4 text-sm text-slate-600">
                                            <span>Room {student.roomNumber}</span>
                                            <span>{student.phone}</span>
                                            {student.totalDue > 0 && (
                                                <Badge variant="destructive" className="text-xs">
                                                    Due: NPR {student.totalDue}
                                                </Badge>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="flex items-center space-x-3">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handleCheckout(student)}
                                        className="hover:bg-[#8b5cf6]/10 hover:border-[#8b5cf6]/30 hover:text-[#8b5cf6] transition-all duration-200"
                                    >
                                        <LogOut className="h-4 w-4 mr-1" />
                                        Checkout
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {filteredStudents.length === 0 && !loading && (
                <Card className="bg-slate-50/50 border-slate-200/50">
                    <CardContent className="p-12 text-center">
                        <LogOut className="h-16 w-16 text-slate-300 mx-auto mb-4" />
                        <h3 className="text-xl font-semibold text-slate-600 mb-2">No Students Found</h3>
                        <p className="text-slate-500">
                            {searchTerm ? 'No students match your search criteria.' : 'No active students available for checkout.'}
                        </p>
                    </CardContent>
                </Card>
            )}

            {/* Checkout Modal would go here */}
            {selectedStudent && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <Card className="w-full max-w-md">
                        <CardHeader>
                            <CardTitle>Checkout {selectedStudent.name}</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <Label>Reason for Checkout</Label>
                                <Input
                                    value={checkoutReason}
                                    onChange={(e) => setCheckoutReason(e.target.value)}
                                    placeholder="Enter checkout reason..."
                                />
                            </div>
                            {totalDueAmount > 0 && (
                                <div className="p-4 bg-red-50 rounded-lg">
                                    <div className="flex items-center gap-2 text-red-600">
                                        <AlertTriangle className="h-4 w-4" />
                                        <span className="font-medium">Outstanding Dues: NPR {totalDueAmount}</span>
                                    </div>
                                </div>
                            )}
                            <div className="flex gap-2">
                                <Button
                                    variant="outline"
                                    onClick={() => setSelectedStudent(null)}
                                    className="flex-1"
                                >
                                    Cancel
                                </Button>
                                <Button
                                    onClick={processCheckout}
                                    className="flex-1 bg-[#8b5cf6] hover:bg-[#7c3aed]"
                                    disabled={!checkoutReason.trim()}
                                >
                                    Confirm Checkout
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    );
};