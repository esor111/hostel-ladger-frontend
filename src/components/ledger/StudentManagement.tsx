import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import {
  Search,
  User,
  Phone,
  Mail,
  CreditCard,
  Home,
  Settings,
  Edit,
  Bed,
  Users,
  CheckCircle,
  Plus,
  Trash2,
  DollarSign,
  AlertTriangle,
  Calendar,
  MapPin,
  UserPlus,
  LogOut,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useAppContext } from "@/contexts/AppContext";
import { useNavigation } from "@/hooks/useNavigation";
import { studentService } from "@/services/studentService";
import { roomService } from "@/services/roomService";
import { checkoutService } from "@/services/checkoutService";
import { StudentCheckout } from "@/components/admin/StudentCheckout";
import { StudentChargeConfiguration } from "@/components/ledger/StudentChargeConfiguration";
import { monthlyInvoiceService } from "@/services/monthlyInvoiceService.js";

export const StudentManagement = () => {
  const { state, refreshAllData } = useAppContext();
  const { goToStudentLedger, goToStudentProfile } = useNavigation();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStudentId, setSelectedStudentId] = useState("");
  const [checkoutStudentId, setCheckoutStudentId] = useState("");
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [chargeConfigStudentId, setChargeConfigStudentId] = useState("");
  const [showAddStudentDialog, setShowAddStudentDialog] = useState(false);
  const [availableRooms, setAvailableRooms] = useState([]);
  const [newStudentForm, setNewStudentForm] = useState({
    name: "",
    phone: "",
    email: "",
    address: "",
    roomNumber: "",
    course: "",
    institution: "",
    guardianName: "",
    guardianPhone: "",
    emergencyContact: "",
    baseMonthlyFee: 0,
    laundryFee: 0,
    foodFee: 0,
  });

  // Parse URL parameters to auto-select student
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const studentParam = params.get("student");
    if (studentParam) {
      setSelectedStudentId(studentParam);
    }
  }, []);

  // Load available rooms when add student dialog opens
  useEffect(() => {
    if (showAddStudentDialog) {
      loadAvailableRooms();
    }
  }, [showAddStudentDialog]);

  const loadAvailableRooms = async () => {
    try {
      const rooms = await roomService.getAvailableRooms();
      setAvailableRooms(rooms);
    } catch (error) {
      console.error("Failed to load available rooms:", error);
      toast.error("Failed to load available rooms");
    }
  };

  const filteredStudents = state.students.filter(
    (student) =>
      student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.roomNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.phone.includes(searchTerm)
  );

  return (
    <div className="space-y-8">
      {/* Premium Header */}
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-[#07A64F]/5 via-[#1295D0]/5 to-[#07A64F]/5 rounded-3xl blur-xl"></div>
        <div className="relative bg-white/60 backdrop-blur-xl rounded-3xl p-8 border border-white/20 shadow-2xl shadow-black/5">
          <div className="flex justify-between items-start">
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-gradient-to-br from-[#07A64F] to-[#1295D0] rounded-2xl flex items-center justify-center shadow-lg shadow-[#07A64F]/30">
                  <span className="text-2xl">👥</span>
                </div>
                <div>
                  <h1 className="text-4xl font-bold bg-gradient-to-r from-[#07A64F] via-[#1295D0] to-[#07A64F] bg-clip-text text-transparent tracking-tight">
                    Student Management
                  </h1>
                  <p className="text-slate-600 font-medium text-lg">
                    Comprehensive Student Profiles & Management
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <Badge className="bg-gradient-to-r from-[#1295D0] to-[#0ea5e9] text-white border-0 px-4 py-2">
                  {state.students.length} Total Students
                </Badge>
                <Badge className="bg-gradient-to-r from-[#07A64F] to-[#059669] text-white border-0 px-4 py-2">
                  {state.students.filter(s => s.status === 'Active').length} Active
                </Badge>
              </div>
            </div>
            <Button 
              onClick={() => setShowAddStudentDialog(true)}
              className="bg-gradient-to-r from-[#07A64F] to-[#059669] hover:from-[#07A64F]/90 hover:to-[#059669]/90 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 px-6 py-3"
            >
              <UserPlus className="h-4 w-4 mr-2" />
              Add New Student
            </Button>
          </div>
        </div>
      </div>

      {/* Enhanced Search */}
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-[#07A64F]/5 to-[#1295D0]/5 rounded-2xl blur-lg"></div>
        <Card className="relative bg-white/80 backdrop-blur-sm border-white/20 shadow-xl">
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
                <Input
                  placeholder="Search students by name, room, or phone..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-white/50 border-slate-200/50 focus:bg-white/80 transition-all duration-200"
                />
              </div>
              <Badge variant="outline" className="text-slate-600 border-slate-300">
                {filteredStudents.length} Results
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Premium Student Cards */}
      <div className="grid gap-6">
        {filteredStudents.map((student) => (
          <Card key={student.id} className="group hover:shadow-2xl transition-all duration-300 border-slate-200/50 bg-white/80 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-14 h-14 bg-gradient-to-br from-[#07A64F] to-[#1295D0] rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-lg">
                    {student.name.charAt(0)}
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-xl font-semibold text-slate-800">{student.name}</h3>
                    <div className="flex items-center space-x-4 text-sm text-slate-600">
                      <div className="flex items-center space-x-1">
                        <Home className="h-4 w-4 text-[#1295D0]" />
                        <span>Room {student.roomNumber}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Phone className="h-4 w-4 text-[#07A64F]" />
                        <span>{student.phone}</span>
                      </div>
                      {student.email && (
                        <div className="flex items-center space-x-1">
                          <Mail className="h-4 w-4 text-slate-500" />
                          <span>{student.email}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <Badge 
                    className={`px-3 py-1 ${
                      student.status === 'Active' 
                        ? 'bg-gradient-to-r from-[#07A64F] to-[#059669] text-white' 
                        : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {student.status}
                  </Badge>
                  
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => goToStudentProfile(student.id)}
                      className="hover:bg-[#07A64F]/10 hover:border-[#07A64F]/30 hover:text-[#07A64F] transition-all duration-200"
                    >
                      <User className="h-4 w-4 mr-1" />
                      Profile
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => goToStudentLedger(student.id)}
                      className="hover:bg-[#1295D0]/10 hover:border-[#1295D0]/30 hover:text-[#1295D0] transition-all duration-200"
                    >
                      <CreditCard className="h-4 w-4 mr-1" />
                      Ledger
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setChargeConfigStudentId(student.id)}
                      className="hover:bg-[#07A64F]/10 hover:border-[#07A64F]/30 hover:text-[#07A64F] transition-all duration-200"
                    >
                      <Settings className="h-4 w-4 mr-1" />
                      Configure
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCheckoutStudentId(student.id)}
                      className="hover:bg-red-50 hover:border-red-200 hover:text-red-600 transition-all duration-200"
                    >
                      <LogOut className="h-4 w-4 mr-1" />
                      Checkout
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredStudents.length === 0 && (
        <Card className="bg-slate-50/50 border-slate-200/50">
          <CardContent className="p-12 text-center">
            <Users className="h-16 w-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-slate-600 mb-2">No Students Found</h3>
            <p className="text-slate-500 mb-6">
              {searchTerm ? 'No students match your search criteria.' : 'No students have been added yet.'}
            </p>
            {!searchTerm && (
              <Button 
                onClick={() => setShowAddStudentDialog(true)}
                className="bg-gradient-to-r from-[#07A64F] to-[#059669] hover:from-[#07A64F]/90 hover:to-[#059669]/90 text-white"
              >
                <UserPlus className="h-4 w-4 mr-2" />
                Add Your First Student
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* Student Checkout Modal */}
      {checkoutStudentId && (
        <StudentCheckout
          student={state.students.find(s => s.id === checkoutStudentId)}
          isOpen={!!checkoutStudentId}
          onClose={() => setCheckoutStudentId("")}
          onComplete={() => {
            setCheckoutStudentId("");
            refreshAllData();
          }}
        />
      )}

      {/* Student Charge Configuration Modal */}
      {chargeConfigStudentId && (
        <StudentChargeConfiguration
          student={state.students.find(s => s.id === chargeConfigStudentId)}
          isOpen={!!chargeConfigStudentId}
          onClose={() => setChargeConfigStudentId("")}
          onSuccess={() => {
            toast.success("Student charges have been configured and initial invoice generated.");
            setChargeConfigStudentId("");
            refreshAllData();
          }}
        />
      )}
    </div>
  );
};
