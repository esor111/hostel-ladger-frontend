// Invoice Generation Service - Comprehensive invoice management with ledger integration
import { monthlyBillingService } from './monthlyBillingService.js';
import { ledgerService } from './ledgerService.js';
import { studentService } from './studentService.js';

export const invoiceGenerationService = {
  
  // Generate and process monthly invoices with full ledger integration
  async generateAndProcessMonthlyInvoices(targetMonth, targetYear) {
    try {
      console.log(`🚀 Starting monthly invoice generation for ${targetMonth}/${targetYear}`);
      
      // Get all active students
      const students = await studentService.getStudents();
      const activeStudents = students.filter(student => 
        student.isConfigured && 
        !student.isCheckedOut && 
        student.status === 'active'
      );

      console.log(`📋 Found ${activeStudents.length} active students for billing`);

      const results = [];
      const billingDate = new Date(targetYear, targetMonth - 1, 1).toISOString().split('T')[0];

      for (const student of activeStudents) {
        try {
          // Calculate monthly fee
          const monthlyFee = (student.baseMonthlyFee || 0) + 
                           (student.laundryFee || 0) + 
                           (student.foodFee || 0);
          
          // Get additional charges if any
          const additionalCharges = student.additionalCharges || [];

          // Generate the invoice using existing service
          const invoice = await monthlyBillingService.generateMonthlyInvoice(
            student.id,
            billingDate,
            monthlyFee,
            additionalCharges
          );

          // Add to ledger with comprehensive data
          const ledgerEntry = await ledgerService.addLedgerEntry({
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

          results.push({
            success: true,
            studentId: student.id,
            studentName: student.name,
            roomNumber: student.roomNumber,
            invoice: invoice,
            ledgerEntry: ledgerEntry,
            amount: invoice.totalAmount
          });

          console.log(`✅ Invoice generated for ${student.name}: ${invoice.referenceId} - NPR ${invoice.totalAmount}`);

        } catch (error) {
          console.error(`❌ Error generating invoice for ${student.name}:`, error);
          results.push({
            success: false,
            studentId: student.id,
            studentName: student.name,
            roomNumber: student.roomNumber,
            error: error.message
          });
        }
      }

      // Generate summary
      const successful = results.filter(r => r.success);
      const failed = results.filter(r => !r.success);
      const totalAmount = successful.reduce((sum, r) => sum + r.amount, 0);

      const summary = {
        month: new Date(targetYear, targetMonth - 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
        monthKey: `${targetYear}-${String(targetMonth).padStart(2, '0')}`,
        totalStudents: activeStudents.length,
        successfulInvoices: successful.length,
        failedInvoices: failed.length,
        totalAmount: totalAmount,
        generatedAt: new Date().toISOString(),
        results: results
      };

      console.log(`📊 Invoice generation completed:`, {
        successful: successful.length,
        failed: failed.length,
        totalAmount: totalAmount
      });

      return summary;

    } catch (error) {
      console.error('❌ Error in invoice generation process:', error);
      throw error;
    }
  },

  // Validate invoice ID format
  validateInvoiceId(invoiceId) {
    // Expected format: BL-YYYY-MM-NNNNNN
    const pattern = /^BL-\d{4}-\d{2}-\d{6}$/;
    return pattern.test(invoiceId);
  },

  // Get invoice statistics
  async getInvoiceStatistics() {
    try {
      const ledgerEntries = await ledgerService.getLedgerEntries();
      const invoiceEntries = ledgerEntries.filter(entry => 
        entry.type.includes('Invoice') && entry.invoiceData
      );

      const stats = {
        totalInvoices: invoiceEntries.length,
        totalAmount: invoiceEntries.reduce((sum, entry) => sum + (entry.debit || 0), 0),
        byType: {
          monthly: invoiceEntries.filter(e => e.type === 'Monthly Invoice').length,
          configuration: invoiceEntries.filter(e => e.type === 'Configuration Invoice').length,
          checkout: invoiceEntries.filter(e => e.type === 'Checkout Invoice').length
        },
        byMonth: {}
      };

      // Group by month
      invoiceEntries.forEach(entry => {
        const date = new Date(entry.date);
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        
        if (!stats.byMonth[monthKey]) {
          stats.byMonth[monthKey] = {
            count: 0,
            amount: 0,
            month: date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
          };
        }
        
        stats.byMonth[monthKey].count++;
        stats.byMonth[monthKey].amount += entry.debit || 0;
      });

      return stats;

    } catch (error) {
      console.error('❌ Error getting invoice statistics:', error);
      return {
        totalInvoices: 0,
        totalAmount: 0,
        byType: { monthly: 0, configuration: 0, checkout: 0 },
        byMonth: {}
      };
    }
  }
};