import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useAppContext } from '@/contexts/AppContext';
import { adminChargingService } from '@/services/adminChargingService.js';
import { 
  Zap, 
  Users, 
  DollarSign, 
  AlertCircle, 
  CheckCircle, 
  Plus,
  Clock
} from 'lucide-react';

export const AdminCharging = () => {
  const { state, refreshAllData } = useAppContext();
  const { toast } = useToast();
  
  const [selectedStudent, setSelectedStudent] = useState('');
  const [chargeType, setChargeType] = useState('');
  const [customDescription, setCustomDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [notes, setNotes] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [overdueStudents, setOverdueStudents] = useState([]);
  const [chargeSummary, setChargeSummary] = useState(null);
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
  const [showBulkCharge, setShowBulkCharge] = useState(false);

  useEffect(() => {
    loadOverdueStudents();
    loadChargeSummary();
  }, []);

  const loadOverdueStudents = async () => {
    try {
      const overdue = await adminChargingService.getOverdueStudents();
      setOverdueStudents(overdue);
    } catch (error) {
      console.error('Error loading overdue students:', error);
    }
  };

  const loadChargeSummary = async () => {
    try {
      const summary = await adminChargingService.getTodayChargeSummary();
      setChargeSummary(summary);
    } catch (error) {
      console.error('Error loading charge summary:', error);
    }
  };

  const handleAddCharge = async () => {
    if (!selectedStudent || !chargeType || !amount) {
      toast({
        title: 'Missing Information',
        description: 'Please fill in all required fields',
        variant: 'destructive'
      });
      return;
    }

    if (parseFloat(amount) <= 0) {
      toast({
        title: 'Invalid Amount',
        description: 'Amount must be greater than 0',
        variant: 'destructive'
      });
      return;
    }

    if (chargeType === 'custom' && !customDescription.trim()) {
      toast({
        title: 'Missing Description',
        description: 'Please enter a description for custom charge',
        variant: 'destructive'
      });
      return;
    }

    setIsProcessing(true);

    try {
      const chargeData = {
        type: chargeType,
        amount: parseFloat(amount),
        description: chargeType === 'custom' ? customDescription : '',
        notes: notes.trim(),
        sendNotification: true
      };

      const result = await adminChargingService.addChargeToStudent(selectedStudent, chargeData, 'Admin');

      if (result.success) {
        toast({
          title: 'Charge Added Successfully',
          description: `NPR ${amount} ${result.description} added to ${result.student.name}'s account`,
        });

        // Reset form
        setSelectedStudent('');
        setChargeType('');
        setCustomDescription('');
        setAmount('');
        setNotes('');

        // Refresh data
        await refreshAllData();
        await loadOverdueStudents();
        await loadChargeSummary();
      } else {
        throw new Error(result.error);
      }

    } catch (error: any) {
      toast({
        title: 'Error Adding Charge',
        description: error.message,
        variant: 'destructive'
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleQuickCharge = async (studentId: string, type: string, suggestedAmount: number) => {
    setIsProcessing(true);

    try {
      const chargeData = {
        type: type,
        amount: suggestedAmount,
        notes: 'Quick charge applied',
        sendNotification: true
      };

      const result = await adminChargingService.addChargeToStudent(studentId, chargeData, 'Admin');

      if (result.success) {
        toast({
          title: 'Quick Charge Applied',
          description: `NPR ${suggestedAmount} late fee added to ${result.student.name}'s account`,
        });

        await refreshAllData();
        await loadOverdueStudents();
        await loadChargeSummary();
      }

    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive'
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const selectedStudentData = state.students.find((s: any) => s.id === selectedStudent);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">⚡ Admin Charging System</h2>
          <p className="text-gray-600 mt-1">Complete flexibility to charge students for any reason</p>
        </div>
        <div className="flex gap-3">
          <Button 
            variant="outline" 
            onClick={() => setShowBulkCharge(!showBulkCharge)}
          >
            <Users className="h-4 w-4 mr-2" />
            {showBulkCharge ? 'Single Charge' : 'Bulk Charge'}
          </Button>
        </div>
      </div>

      {/* Today's Summary */}
      {chargeSummary && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-blue-100">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-blue-600 font-medium">Total Charges</p>
                  <p className="text-2xl font-bold text-blue-700">{chargeSummary.totalCharges}</p>
                </div>
                <Zap className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-green-50 to-green-100">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-green-600 font-medium">Total Amount</p>
                  <p className="text-2xl font-bold text-green-700">NPR {chargeSummary.totalAmount.toLocaleString()}</p>
                </div>
                <DollarSign className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-50 to-purple-100">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-purple-600 font-medium">Students Charged</p>
                  <p className="text-2xl font-bold text-purple-700">{chargeSummary.studentsCharged}</p>
                </div>
                <Users className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-orange-50 to-orange-100">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-orange-600 font-medium">Overdue Students</p>
                  <p className="text-2xl font-bold text-orange-700">{overdueStudents.length}</p>
                </div>
                <AlertCircle className="h-8 w-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Charge Form */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5" />
              {showBulkCharge ? 'Bulk Charge Students' : 'Add Charge to Student'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {!showBulkCharge ? (
              /* Single Student Charge */
              <div className="space-y-2">
                <Label>Select Student *</Label>
                <Select value={selectedStudent} onValueChange={setSelectedStudent}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose student" />
                  </SelectTrigger>
                  <SelectContent>
                    {state.students.map((student: any) => (
                      <SelectItem key={student.id} value={student.id}>
                        <div className="flex items-center justify-between w-full">
                          <span>{student.name} - Room {student.roomNumber}</span>
                          {student.currentBalance > 0 && (
                            <Badge variant="destructive" className="ml-2">
                              NPR {student.currentBalance.toLocaleString()} due
                            </Badge>
                          )}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                {selectedStudentData && (
                  <div className="bg-blue-50 p-3 rounded-lg">
                    <p className="text-sm text-blue-800">
                      <strong>{selectedStudentData.name}</strong> - Room {selectedStudentData.roomNumber}
                    </p>
                    <p className="text-sm text-blue-600">
                      Current Balance: NPR {(selectedStudentData.currentBalance || 0).toLocaleString()}
                    </p>
                  </div>
                )}
              </div>
            ) : (
              /* Bulk Student Selection */
              <div className="space-y-2">
                <Label>Select Students * ({selectedStudents.length} selected)</Label>
                <div className="max-h-40 overflow-y-auto border rounded-lg p-2">
                  {state.students.map((student: any) => (
                    <div key={student.id} className="flex items-center space-x-2 p-2 hover:bg-gray-50 rounded">
                      <input
                        type="checkbox"
                        id={student.id}
                        checked={selectedStudents.includes(student.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedStudents([...selectedStudents, student.id]);
                          } else {
                            setSelectedStudents(selectedStudents.filter(id => id !== student.id));
                          }
                        }}
                        className="rounded"
                      />
                      <label htmlFor={student.id} className="flex-1 text-sm cursor-pointer">
                        {student.name} - Room {student.roomNumber}
                        {student.currentBalance > 0 && (
                          <span className="text-red-600 ml-2">
                            (NPR {student.currentBalance.toLocaleString()} due)
                          </span>
                        )}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label>Charge Type *</Label>
              <Select value={chargeType} onValueChange={setChargeType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select charge type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="late_fee">Late Payment Fee</SelectItem>
                  <SelectItem value="damage_fee">Damage Fee</SelectItem>
                  <SelectItem value="cleaning_fee">Cleaning Fee</SelectItem>
                  <SelectItem value="maintenance_fee">Maintenance Fee</SelectItem>
                  <SelectItem value="custom">Custom Charge</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {chargeType === 'custom' && (
              <div className="space-y-2">
                <Label>Custom Description *</Label>
                <Input
                  placeholder="Enter custom charge description"
                  value={customDescription}
                  onChange={(e) => setCustomDescription(e.target.value)}
                />
              </div>
            )}

            <div className="space-y-2">
              <Label>Amount (NPR) *</Label>
              <Input
                type="number"
                placeholder="Enter amount"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                min="1"
              />
            </div>

            <div className="space-y-2">
              <Label>Admin Notes</Label>
              <Textarea
                placeholder="Optional notes about this charge"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
              />
            </div>

            <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-200">
              <div className="flex items-start gap-2">
                <AlertCircle className="h-4 w-4 text-yellow-600 mt-0.5" />
                <div className="text-sm text-yellow-800">
                  <p className="font-medium">Charge will be:</p>
                  <ul className="mt-1 space-y-1">
                    <li>• Added directly to student ledger</li>
                    <li>• Student will be notified via system</li>
                    <li>• Balance will be updated immediately</li>
                  </ul>
                </div>
              </div>
            </div>

            <Button 
              onClick={handleAddCharge}
              disabled={isProcessing}
              className="w-full"
            >
              {isProcessing ? 'Processing...' : showBulkCharge ? `Apply to ${selectedStudents.length} Students` : 'Add Charge to Ledger'}
            </Button>
          </CardContent>
        </Card>

        {/* Overdue Students */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Students with Overdue Payments ({overdueStudents.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {overdueStudents.length > 0 ? (
                overdueStudents.map((student: any) => (
                  <div key={student.id} className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-semibold text-gray-900">{student.name}</p>
                        <p className="text-sm text-gray-600">Room: {student.roomNumber}</p>
                        <p className="text-sm text-red-600">
                          {student.daysOverdue} days overdue • NPR {(student.currentBalance || 0).toLocaleString()} due
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-600 mb-2">
                          Suggested: NPR {student.suggestedLateFee}
                        </p>
                        <Button
                          size="sm"
                          onClick={() => handleQuickCharge(student.id, 'late_fee_overdue', student.suggestedLateFee)}
                          disabled={isProcessing}
                          className="bg-red-600 hover:bg-red-700"
                        >
                          Quick Charge
                        </Button>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <CheckCircle className="h-12 w-12 mx-auto text-green-500 mb-4" />
                  <p className="text-gray-600">No overdue payments!</p>
                  <p className="text-sm text-gray-500">All students are up to date</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};