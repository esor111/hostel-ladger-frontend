// Booking Acceptance Service - Handles the flow from booking acceptance to configuration
import { studentService } from './studentService.js';
import { ledgerService } from './ledgerService.js';
import { monthlyBillingService } from './monthlyBillingService.js';
import { roomService } from './roomService.js';

export const bookingAcceptanceService = {
  // Accept booking and create student profile
  async acceptBooking(bookingData) {
    return new Promise(async (resolve, reject) => {
      try {
        const {
          studentName,
          phone,
          email,
          address,
          roomNumber,
          course,
          institution,
          guardianName,
          guardianPhone,
          emergencyContact,
          acceptedBy
        } = bookingData;

        // Create student profile
        const newStudent = {
          id: `STU${Date.now()}`,
          name: studentName,
          phone,
          email,
          address,
          roomNumber,
          course,
          institution,
          guardianName,
          guardianPhone,
          emergencyContact,
          joinDate: new Date().toISOString().split('T')[0],
          status: 'Pending Configuration',
          isCheckedOut: false,
          isConfigured: false,
          configurationDate: null,
          billingStartDate: null,
          currentBalance: 0,
          totalPaid: 0,
          totalDue: 0,
          lastPaymentDate: null,
          baseMonthlyFee: 0,
          laundryFee: 0,
          foodFee: 0,
          additionalCharges: [],
          acceptedBy: acceptedBy || 'Admin',
          acceptedAt: new Date().toISOString()
        };

        // Save student
        const savedStudent = await studentService.addStudent(newStudent);

        // Reserve room/bed
        await roomService.assignRoom(roomNumber, savedStudent.id);

        // Add initial ledger entry
        await ledgerService.addLedgerEntry({
          studentId: savedStudent.id,
          type: 'Booking Accepted',
          description: `Booking accepted - Student profile created`,
          debit: 0,
          credit: 0,
          referenceId: `BOOKING-${savedStudent.id}`,
          reason: `Booking accepted by ${acceptedBy} - Student awaiting fee configuration`,
          notes: `Student: ${studentName}, Room: ${roomNumber}`,
          acceptedBy
        });

        console.log(`✅ Booking Accepted: ${studentName} - Room ${roomNumber} - Status: Pending Configuration`);

        setTimeout(() => resolve({
          success: true,
          student: savedStudent,
          message: `Booking accepted for ${studentName}. Student is now pending fee configuration.`,
          nextStep: 'configuration'
        }), 500);

      } catch (error) {
        console.error('Error accepting booking:', error);
        setTimeout(() => reject({
          success: false,
          error: error.message
        }), 500);
      }
    });
  },

  // Configure student fees and activate billing
  async configureStudentFees(studentId, feeConfiguration) {
    return new Promise(async (resolve, reject) => {
      try {
        const {
          baseMonthlyFee,
          laundryFee,
          foodFee,
          wifiFee,
          maintenanceFee,
          securityDeposit,
          additionalCharges,
          configuredBy
        } = feeConfiguration;

        // Get student details
        const student = await studentService.getStudentById(studentId);
        if (!student) {
          throw new Error('Student not found');
        }

        if (student.isConfigured) {
          throw new Error('Student is already configured');
        }

        const configurationDate = new Date().toISOString().split('T')[0];
        const totalMonthlyFee = baseMonthlyFee + laundryFee + foodFee + (wifiFee || 0) + (maintenanceFee || 0);

        // Update student with fee configuration
        const updatedStudent = await studentService.updateStudent(studentId, {
          baseMonthlyFee,
          laundryFee,
          foodFee,
          wifiFee: wifiFee || 0,
          maintenanceFee: maintenanceFee || 0,
          securityDeposit: securityDeposit || 0,
          additionalCharges: additionalCharges || [],
          totalMonthlyFee,
          isConfigured: true,
          configurationDate,
          billingStartDate: configurationDate,
          status: 'Active',
          configuredBy: configuredBy || 'Admin'
        });

        // Generate prorated invoice for current month
        const billingResult = await monthlyBillingService.processBillingWorkflow(
          updatedStudent,
          'configuration',
          configurationDate,
          additionalCharges || []
        );

        // Add configuration entry to ledger
        await ledgerService.addLedgerEntry({
          studentId,
          type: 'Fee Configuration',
          description: `Fee configuration completed - Billing activated`,
          debit: 0,
          credit: 0,
          referenceId: `CONFIG-${studentId}`,
          reason: `Fee configuration completed by ${configuredBy || 'Admin'} - Monthly fee: NPR ${totalMonthlyFee}`,
          notes: `Base: ${baseMonthlyFee}, Laundry: ${laundryFee}, Food: ${foodFee}`,
          configuredBy: configuredBy || 'Admin',
          feeConfiguration: {
            baseMonthlyFee,
            laundryFee,
            foodFee,
            wifiFee,
            maintenanceFee,
            securityDeposit,
            totalMonthlyFee
          }
        });

        console.log(`⚙️ Configuration Complete: ${student.name} - Monthly Fee: NPR ${totalMonthlyFee}`);

        setTimeout(() => resolve({
          success: true,
          student: updatedStudent,
          billingResult,
          message: `Fee configuration completed for ${student.name}. Automatic monthly billing is now active.`
        }), 500);

      } catch (error) {
        console.error('Error configuring student fees:', error);
        setTimeout(() => reject({
          success: false,
          error: error.message
        }), 500);
      }
    });
  },

  // Get students pending configuration
  async getStudentsPendingConfiguration() {
    return new Promise(async (resolve) => {
      try {
        const students = await studentService.getStudents();
        const pendingStudents = students.filter(student => 
          student.status === 'Pending Configuration' && !student.isConfigured
        );

        setTimeout(() => resolve(pendingStudents), 200);
      } catch (error) {
        console.error('Error getting pending students:', error);
        setTimeout(() => resolve([]), 200);
      }
    });
  },

  // Get configuration statistics
  async getConfigurationStats() {
    return new Promise(async (resolve) => {
      try {
        const students = await studentService.getStudents();
        
        const stats = {
          totalStudents: students.length,
          pendingConfiguration: students.filter(s => s.status === 'Pending Configuration').length,
          configured: students.filter(s => s.isConfigured).length,
          active: students.filter(s => s.status === 'Active' && s.isConfigured).length,
          checkedOut: students.filter(s => s.isCheckedOut).length
        };

        setTimeout(() => resolve(stats), 200);
      } catch (error) {
        console.error('Error getting configuration stats:', error);
        setTimeout(() => resolve({
          totalStudents: 0,
          pendingConfiguration: 0,
          configured: 0,
          active: 0,
          checkedOut: 0
        }), 200);
      }
    });
  }
};