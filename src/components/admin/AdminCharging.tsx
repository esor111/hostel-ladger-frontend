import React, { useState, useEffect } from 'react';
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
  Search,
  Plus,
  Clock,
  TrendingUp,
  Edit,
  Trash2,
  Eye
} from 'lucide-react';

const AdminCharging = () => {
  const { state, refreshAllData } = useAppContext();
  const { toast } = useToast();
  
  // Form states
  const [selectedStudent, setSelectedStudent] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [chargeType, setChargeType] = useState('one-time');
  const [category, setCategory] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [isRecurring, setIsRecurring] = useState(false);
  const [recurringMonths, setRecurringMonths] = useState('');
  const [adminNotes, setAdminNotes] = useState('');
  
  // UI states
  const [isProcessing, setIsProcessing] = useState(false);
  const [adminCharges, setAdminCharges] = useState([]);
  const [chargeStats, setChargeStats] = useState(null);
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [showBulkCharge, setShowBulkCharge] = useState(false);
  const [showChargesList, setShowChargesList] = useState(false);
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    loadAdminCharges();
    loadChargeStats();
  }, []);

  const loadAdminCharges = async () => {
    try {
      const charges = await adminChargingService.getAllCharges();
      setAdminCharges(charges);
    } catch (error) {
      console.error('Error loading admin charges:', error);
      toast({
        title: 'Error',
        description: 'Failed to load admin charges',
        variant: 'destructive'
      });
    }
  };

  const loadChargeStats = async () => {
    try {
      const stats = await adminChargingService.getChargeStats();
      setChargeStats(stats);
    } catch (error) {
      console.error('Error loading charge statistics:', error);
    }
  };

  const handleCreateCharge = async () => {
    if (!selectedStudent || !title || !amount) {
      toast({
        title: 'Missing Information',
        description: 'Please fill in all required fields (Student, Title, Amount)',
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

    if (isRecurring && (!recurringMonths || parseInt(recurringMonths) <= 0)) {
      toast({
        title: 'Invalid Recurring Months',
        description: 'Please enter a valid number of months for recurring charges',
        variant: 'destructive'
      });
      return;
    }

    setIsProcessing(true);

    try {
      const chargeData = {
        studentId: selectedStudent,
        title: title.trim(),
        description: description.trim(),
        amount: parseFloat(amount),
        chargeType: chargeType,
        category: category || 'Miscellaneous',
        dueDate: dueDate || null,
        isRecurring: isRecurring,
        recurringMonths: isRecurring ? parseInt(recurringMonths) : null,
        adminNotes: adminNotes.trim(),
        createdBy: 'Admin'
      };

      const result = await adminChargingService.createCharge(chargeData);

      toast({
        title: 'Charge Created Successfully',
        description: `${title} - $${amount} created for student`,
      });

      // Reset form
      resetForm();

      // Refresh data
      await loadAdminCharges();
      await loadChargeStats();
      await refreshAllData();

    } catch (error) {
      toast({
        title: 'Error Creating Charge',
        description: error.message,
        variant: 'destructive'
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const resetForm = () => {
    setSelectedStudent('');
    setTitle('');
    setDescription('');
    setAmount('');
    setChargeType('one-time');
    setCategory('');
    setDueDate('');
    setIsRecurring(false);
    setRecurringMonths('');
    setAdminNotes('');
  };

  const handleBulkCharge = async () => {
    if (selectedStudents.length === 0 || !title || !amount) {
      toast({
        title: 'Missing Information',
        description: 'Please select students and fill in charge details',
        variant: 'destructive'
      });
      return;
    }

    setIsProcessing(true);

    try {
      const chargeData = {
        title: title.trim(),
        description: description.trim(),
        amount: parseFloat(amount),
        chargeType: chargeType,
        category: category || 'Miscellaneous',
        dueDate: dueDate || null,
        isRecurring: isRecurring,
        recurringMonths: isRecurring ? parseInt(recurringMonths) : null,
        adminNotes: adminNotes.trim(),
        createdBy: 'Admin'
      };

      const result = await adminChargingService.createBulkCharges(selectedStudents, chargeData);

      toast({
        title: 'Bulk Charges Created',
        description: `${result.successful.length} charges created successfully`,
      });

      if (result.failed.length > 0) {
        toast({
          title: 'Some Charges Failed',
          description: `${result.failed.length} charges failed to create`,
          variant: 'destructive'
        });
      }

      // Reset form
      setSelectedStudents([]);
      resetForm();
      setShowBulkCharge(false);

      // Refresh data
      await loadAdminCharges();
      await loadChargeStats();
      await refreshAllData();

    } catch (error) {
      toast({
        title: 'Bulk Charge Error',
        description: error.message,
        variant: 'destructive'
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleApplyCharge = async (chargeId) => {
    setIsProcessing(true);

    try {
      await adminChargingService.applyCharge(chargeId);
      
      toast({
        title: 'Charge Applied',
        description: 'Charge has been applied to student ledger',
      });

      await loadAdminCharges();
      await loadChargeStats();
      await refreshAllData();

    } catch (error) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive'
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCancelCharge = async (chargeId) => {
    setIsProcessing(true);

    try {
      await adminChargingService.cancelCharge(chargeId);
      
      toast({
        title: 'Charge Cancelled',
        description: 'Charge has been cancelled',
      });

      await loadAdminCharges();
      await loadChargeStats();

    } catch (error) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive'
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDeleteCharge = async (chargeId) => {
    if (!confirm('Are you sure you want to delete this charge?')) return;

    setIsProcessing(true);

    try {
      await adminChargingService.deleteCharge(chargeId);
      
      toast({
        title: 'Charge Deleted',
        description: 'Charge has been deleted successfully',
      });

      await loadAdminCharges();
      await loadChargeStats();

    } catch (error) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive'
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const selectedStudentData = state.students.find(s => s.id === selectedStudent);
  const filteredCharges = adminCharges.filter(charge => 
    filterStatus === 'all' || charge.status === filterStatus
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">⚡ Admin Charging System</h2>
          <p className="text-gray-600 mt-1">Create and manage custom charges for students</p>
        </div>
        <div className="flex gap-3">
          <Button 
            variant="outline" 
            onClick={() => setShowChargesList(!showChargesList)}
          >
            <Eye className="h-4 w-4 mr-2" />
            {showChargesList ? 'Hide Charges' : 'View Charges'}
          </Button>
          <Button 
            variant="outline" 
            onClick={() => setShowBulkCharge(!showBulkCharge)}
          >
            <Users className="h-4 w-4 mr-2" />
            {showBulkCharge ? 'Single Charge' : 'Bulk Charge'}
          </Button>
        </div>
      </div>

      {/* Statistics Summary */}
      {chargeStats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-blue-100">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-blue-600 font-medium">Total Charges</p>
                  <p className="text-2xl font-bold text-blue-700">{chargeStats.totalCharges}</p>
                </div>
                <Zap className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-yellow-50 to-yellow-100">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-yellow-600 font-medium">Pending</p>
                  <p className="text-2xl font-bold text-yellow-700">{chargeStats.pendingCharges}</p>
                  <p className="text-xs text-yellow-600">${chargeStats.totalPendingAmount.toFixed(2)}</p>
                </div>
                <Clock className="h-8 w-8 text-yellow-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-green-50 to-green-100">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-green-600 font-medium">Applied</p>
                  <p className="text-2xl font-bold text-green-700">{chargeStats.appliedCharges}</p>
                  <p className="text-xs text-green-600">${chargeStats.totalAppliedAmount.toFixed(2)}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-red-50 to-red-100">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-red-600 font-medium">Cancelled</p>
                  <p className="text-2xl font-bold text-red-700">{chargeStats.cancelledCharges}</p>
                </div>
                <AlertCircle className="h-8 w-8 text-red-600" />
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
              {showBulkCharge ? 'Create Bulk Charges' : 'Create New Charge'}
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
                    {state.students.map((student) => (
                      <SelectItem key={student.id} value={student.id}>
                        <div className="flex items-center justify-between w-full">
                          <span>{student.name} - Room {student.roomNumber}</span>
                          {student.currentBalance > 0 && (
                            <Badge variant="destructive" className="ml-2">
                              ${student.currentBalance.toFixed(2)} due
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
                      Current Balance: ${(selectedStudentData.currentBalance || 0).toFixed(2)}
                    </p>
                  </div>
                )}
              </div>
            ) : (
              /* Bulk Student Selection */
              <div className="space-y-2">
                <Label>Select Students * ({selectedStudents.length} selected)</Label>
                <div className="max-h-40 overflow-y-auto border rounded-lg p-2">
                  {state.students.map((student) => (
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
                            (${student.currentBalance.toFixed(2)} due)
                          </span>
                        )}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label>Charge Title *</Label>
              <Input
                placeholder="Enter charge title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Description</Label>
              <Input
                placeholder="Enter charge description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Amount ($) *</Label>
                <Input
                  type="number"
                  placeholder="Enter amount"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  min="0.01"
                  step="0.01"
                />
              </div>

              <div className="space-y-2">
                <Label>Charge Type</Label>
                <Select value={chargeType} onValueChange={setChargeType}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {adminChargingService.chargeTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Category</Label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {adminChargingService.chargeCategories.map((cat) => (
                      <SelectItem key={cat.value} value={cat.value}>
                        {cat.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Due Date</Label>
                <Input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="isRecurring"
                  checked={isRecurring}
                  onChange={(e) => setIsRecurring(e.target.checked)}
                  className="rounded"
                />
                <Label htmlFor="isRecurring">Recurring Charge</Label>
              </div>
              
              {isRecurring && (
                <div className="ml-6">
                  <Label>Number of Months</Label>
                  <Input
                    type="number"
                    placeholder="Enter months"
                    value={recurringMonths}
                    onChange={(e) => setRecurringMonths(e.target.value)}
                    min="1"
                    className="w-32"
                  />
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label>Admin Notes</Label>
              <Textarea
                placeholder="Optional notes about this charge"
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                rows={3}
              />
            </div>

            <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-200">
              <div className="flex items-start gap-2">
                <AlertCircle className="h-4 w-4 text-yellow-600 mt-0.5" />
                <div className="text-sm text-yellow-800">
                  <p className="font-medium">Charge will be created as "Pending"</p>
                  <ul className="mt-1 space-y-1">
                    <li>• Apply the charge to add it to student ledger</li>
                    <li>• You can edit or cancel pending charges</li>
                    <li>• Applied charges cannot be modified</li>
                  </ul>
                </div>
              </div>
            </div>

            <Button 
              onClick={showBulkCharge ? handleBulkCharge : handleCreateCharge}
              disabled={isProcessing}
              className="w-full"
            >
              {isProcessing ? 'Processing...' : showBulkCharge ? `Create for ${selectedStudents.length} Students` : 'Create Charge'}
            </Button>
          </CardContent>
        </Card>

        {/* Recent Charges */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Recent Admin Charges ({adminCharges.length})
            </CardTitle>
            <div className="flex gap-2">
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="applied">Applied</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {filteredCharges.length > 0 ? (
                filteredCharges.slice(0, 10).map((charge) => (
                  <div key={charge.id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-semibold text-gray-900">{charge.title}</p>
                          <Badge 
                            variant={
                              charge.status === 'pending' ? 'secondary' :
                              charge.status === 'applied' ? 'default' : 'destructive'
                            }
                          >
                            {adminChargingService.getChargeStatusLabel(charge.status)}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600">
                          {charge.student?.name} - {adminChargingService.formatAmount(charge.amount)}
                        </p>
                        <p className="text-xs text-gray-500">
                          {adminChargingService.getChargeTypeLabel(charge.chargeType)} • {charge.category}
                        </p>
                        {charge.description && (
                          <p className="text-xs text-gray-500 mt-1">{charge.description}</p>
                        )}
                      </div>
                      <div className="flex gap-1 ml-4">
                        {charge.status === 'pending' && (
                          <>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleApplyCharge(charge.id)}
                              disabled={isProcessing}
                              className="text-green-600 hover:text-green-700"
                            >
                              Apply
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleCancelCharge(charge.id)}
                              disabled={isProcessing}
                              className="text-yellow-600 hover:text-yellow-700"
                            >
                              Cancel
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleDeleteCharge(charge.id)}
                              disabled={isProcessing}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <Zap className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                  <p className="text-gray-600">No admin charges found</p>
                  <p className="text-sm text-gray-500">Create your first charge above</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Charges List */}
      {showChargesList && (
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5" />
              All Admin Charges
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2">Student</th>
                    <th className="text-left p-2">Title</th>
                    <th className="text-left p-2">Amount</th>
                    <th className="text-left p-2">Type</th>
                    <th className="text-left p-2">Category</th>
                    <th className="text-left p-2">Status</th>
                    <th className="text-left p-2">Created</th>
                    <th className="text-left p-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCharges.map((charge) => (
                    <tr key={charge.id} className="border-b hover:bg-gray-50">
                      <td className="p-2">
                        <div>
                          <p className="font-medium">{charge.student?.name}</p>
                          <p className="text-xs text-gray-500">Room {charge.student?.roomNumber}</p>
                        </div>
                      </td>
                      <td className="p-2">
                        <div>
                          <p className="font-medium">{charge.title}</p>
                          {charge.description && (
                            <p className="text-xs text-gray-500">{charge.description}</p>
                          )}
                        </div>
                      </td>
                      <td className="p-2 font-medium">
                        {adminChargingService.formatAmount(charge.amount)}
                      </td>
                      <td className="p-2">
                        <Badge variant="outline">
                          {adminChargingService.getChargeTypeLabel(charge.chargeType)}
                        </Badge>
                      </td>
                      <td className="p-2">{charge.category}</td>
                      <td className="p-2">
                        <Badge 
                          variant={
                            charge.status === 'pending' ? 'secondary' :
                            charge.status === 'applied' ? 'default' : 'destructive'
                          }
                        >
                          {adminChargingService.getChargeStatusLabel(charge.status)}
                        </Badge>
                      </td>
                      <td className="p-2 text-xs text-gray-500">
                        {new Date(charge.createdAt).toLocaleDateString()}
                      </td>
                      <td className="p-2">
                        <div className="flex gap-1">
                          {charge.status === 'pending' && (
                            <>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleApplyCharge(charge.id)}
                                disabled={isProcessing}
                                className="text-green-600 hover:text-green-700 px-2 py-1 h-auto"
                              >
                                Apply
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleCancelCharge(charge.id)}
                                disabled={isProcessing}
                                className="text-yellow-600 hover:text-yellow-700 px-2 py-1 h-auto"
                              >
                                Cancel
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleDeleteCharge(charge.id)}
                                disabled={isProcessing}
                                className="text-red-600 hover:text-red-700 px-2 py-1 h-auto"
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </>
                          )}
                          {charge.status === 'applied' && (
                            <Badge variant="outline" className="text-green-600">
                              Applied on {new Date(charge.appliedDate).toLocaleDateString()}
                            </Badge>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              
              {filteredCharges.length === 0 && (
                <div className="text-center py-8">
                  <Zap className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                  <p className="text-gray-600">No charges found</p>
                  <p className="text-sm text-gray-500">
                    {filterStatus === 'all' ? 'Create your first charge above' : `No ${filterStatus} charges`}
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AdminCharging;