// Automated Billing Service - Month-wise invoice management
import { studentService } from './studentService.js';
import { monthlyBillingService } from './monthlyBillingService.js';
import { ledgerService } from './ledgerService.js';

export const automatedBillingService = {
  // Generate monthly invoices for all configured students
  async generateMonthlyInvoices(targetMonth, targetYear) {
    return new Promise(async (resolve, reject) => {
      try {
        const students = await studentService.getStudents();
        const configuredStudents = students.filter(student => 
          student.isConfigured && 
          !student.isCheckedOut && 
          student.status === 'active'
        );

        const invoiceResults = [];
        const billingDate = new Date(targetYear, targetMonth - 1, 1).toISOString().split('T')[0];

        for (const student of configuredStudents) {
          try {
            const monthlyFee = (student.baseMonthlyFee || 0) + 
                             (student.laundryFee || 0) + 
                             (student.foodFee || 0);
            
            const additionalCharges = student.additionalCharges || [];

            // Generate monthly invoice using existing service
            const invoice = await monthlyBillingService.generateMonthlyInvoice(
              student.id,
              billingDate,
              monthlyFee,
              additionalCharges
            );

            // Add invoice to ledger with proper integration
            await ledgerService.addLedgerEntry({
              studentId: student.id,
              studentName: student.name,
              type: 'Monthly Invoice',
              description: `Monthly Invoice - ${new Date(targetYear, targetMonth - 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}`,
              debit: invoice.totalAmount,
              credit: 0,
              referenceId: invoice.referenceId,
              reason: `Automated monthly billing for ${new Date(targetYear, targetMonth - 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}`,
              invoiceData: invoice,
              date: billingDate
            });

            invoiceResults.push({
              studentId: student.id,
              studentName: student.name,
              roomNumber: student.roomNumber,
              invoice: invoice,
              success: true
            });

            console.log(`📧 Monthly invoice generated for ${student.name}: NPR ${invoice.totalAmount}`);

          } catch (error) {
            console.error(`Error generating invoice for ${student.name}:`, error);
            invoiceResults.push({
              studentId: student.id,
              studentName: student.name,
              roomNumber: student.roomNumber,
              error: error.message,
              success: false
            });
          }
        }

        const summary = {
          month: new Date(targetYear, targetMonth - 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
          totalStudents: configuredStudents.length,
          successfulInvoices: invoiceResults.filter(r => r.success).length,
          failedInvoices: invoiceResults.filter(r => !r.success).length,
          totalAmount: invoiceResults
            .filter(r => r.success)
            .reduce((sum, r) => sum + r.invoice.totalAmount, 0),
          generatedAt: new Date().toISOString(),
          invoiceResults
        };

        setTimeout(() => resolve(summary), 500);

      } catch (error) {
        console.error('Error in automated billing:', error);
        setTimeout(() => reject(error), 500);
      }
    });
  },

  // Get month-wise invoice summary
  async getMonthlyInvoiceSummary() {
    return new Promise(async (resolve) => {
      try {
        // Get all ledger entries that are monthly invoices
        const ledgerEntries = await ledgerService.getLedgerEntries();
        const monthlyInvoices = ledgerEntries.filter(entry => entry.type === 'Monthly Invoice');

        // Group by month
        const monthlyData = {};
        
        monthlyInvoices.forEach(entry => {
          const date = new Date(entry.date);
          const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
          const monthName = date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

          if (!monthlyData[monthKey]) {
            monthlyData[monthKey] = {
              month: monthName,
              monthKey: monthKey,
              year: date.getFullYear(),
              monthNumber: date.getMonth() + 1,
              totalInvoices: 0,
              totalAmount: 0,
              students: [],
              invoices: []
            };
          }

          monthlyData[monthKey].totalInvoices++;
          monthlyData[monthKey].totalAmount += entry.debit || 0;
          monthlyData[monthKey].invoices.push({
            id: entry.id,
            studentId: entry.studentId,
            amount: entry.debit || 0,
            description: entry.description,
            date: entry.date,
            referenceId: entry.referenceId,
            invoiceData: entry.invoiceData
          });
        });

        // Get student details for each month
        const students = await studentService.getStudents();
        Object.keys(monthlyData).forEach(monthKey => {
          const uniqueStudentIds = [...new Set(monthlyData[monthKey].invoices.map(inv => inv.studentId))];
          monthlyData[monthKey].students = uniqueStudentIds.map(studentId => {
            const student = students.find(s => s.id === studentId);
            const studentInvoices = monthlyData[monthKey].invoices.filter(inv => inv.studentId === studentId);
            const studentTotal = studentInvoices.reduce((sum, inv) => sum + inv.amount, 0);
            
            return {
              id: studentId,
              name: student?.name || 'Unknown Student',
              roomNumber: student?.roomNumber || 'N/A',
              totalAmount: studentTotal,
              invoiceCount: studentInvoices.length,
              invoices: studentInvoices
            };
          });
        });

        // Convert to array and sort by date (newest first)
        const monthlyArray = Object.values(monthlyData).sort((a, b) => {
          return new Date(b.year, b.monthNumber - 1) - new Date(a.year, a.monthNumber - 1);
        });

        setTimeout(() => resolve(monthlyArray), 200);

      } catch (error) {
        console.error('Error getting monthly invoice summary:', error);
        setTimeout(() => resolve([]), 200);
      }
    });
  },

  // Get billing statistics
  async getBillingStatistics() {
    return new Promise(async (resolve) => {
      try {
        const monthlyData = await this.getMonthlyInvoiceSummary();
        const currentMonth = new Date();
        const currentMonthKey = `${currentMonth.getFullYear()}-${String(currentMonth.getMonth() + 1).padStart(2, '0')}`;
        
        const currentMonthData = monthlyData.find(m => m.monthKey === currentMonthKey);
        const lastMonthData = monthlyData.find(m => {
          const lastMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1);
          const lastMonthKey = `${lastMonth.getFullYear()}-${String(lastMonth.getMonth() + 1).padStart(2, '0')}`;
          return m.monthKey === lastMonthKey;
        });

        const stats = {
          totalMonths: monthlyData.length,
          currentMonth: {
            invoices: currentMonthData?.totalInvoices || 0,
            amount: currentMonthData?.totalAmount || 0,
            students: currentMonthData?.students?.length || 0
          },
          lastMonth: {
            invoices: lastMonthData?.totalInvoices || 0,
            amount: lastMonthData?.totalAmount || 0,
            students: lastMonthData?.students?.length || 0
          },
          allTime: {
            totalInvoices: monthlyData.reduce((sum, m) => sum + m.totalInvoices, 0),
            totalAmount: monthlyData.reduce((sum, m) => sum + m.totalAmount, 0),
            averageMonthlyAmount: monthlyData.length > 0 ? 
              Math.round(monthlyData.reduce((sum, m) => sum + m.totalAmount, 0) / monthlyData.length) : 0
          }
        };

        setTimeout(() => resolve(stats), 200);

      } catch (error) {
        console.error('Error getting billing statistics:', error);
        setTimeout(() => resolve({
          totalMonths: 0,
          currentMonth: { invoices: 0, amount: 0, students: 0 },
          lastMonth: { invoices: 0, amount: 0, students: 0 },
          allTime: { totalInvoices: 0, totalAmount: 0, averageMonthlyAmount: 0 }
        }), 200);
      }
    });
  },

  // Check if monthly billing is due (first day of month)
  shouldRunAutomatedBilling() {
    const today = new Date();
    return today.getDate() === 1; // Run on first day of month
  },

  // Get next billing date
  getNextBillingDate() {
    const today = new Date();
    const nextMonth = new Date(today.getFullYear(), today.getMonth() + 1, 1);
    return nextMonth.toISOString().split('T')[0];
  }
};