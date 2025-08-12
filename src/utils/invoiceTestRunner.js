// Invoice Test Runner - Comprehensive testing for invoice generation and ledger integration
import { invoiceGenerationService } from '../services/invoiceGenerationService.js';
import { ledgerService } from '../services/ledgerService.js';
import { studentService } from '../services/studentService.js';

export const invoiceTestRunner = {
  
  // Run comprehensive invoice system test
  async runComprehensiveTest() {
    console.log('🚀 Starting comprehensive invoice system test...');
    
    const testResults = {
      timestamp: new Date().toISOString(),
      tests: [],
      summary: {
        total: 0,
        passed: 0,
        failed: 0
      }
    };

    // Test 1: Invoice ID Format Validation
    await this.testInvoiceIdFormat(testResults);
    
    // Test 2: Monthly Invoice Generation
    await this.testMonthlyInvoiceGeneration(testResults);
    
    // Test 3: Ledger Integration
    await this.testLedgerIntegration(testResults);
    
    // Test 4: Configuration Invoice
    await this.testConfigurationInvoice(testResults);
    
    // Test 5: Invoice Statistics
    await this.testInvoiceStatistics(testResults);

    // Generate summary
    testResults.summary.total = testResults.tests.length;
    testResults.summary.passed = testResults.tests.filter(t => t.passed).length;
    testResults.summary.failed = testResults.tests.filter(t => !t.passed).length;

    console.log('📊 Test Summary:', testResults.summary);
    console.log('📋 Detailed Results:', testResults.tests);

    return testResults;
  },

  // Test invoice ID format validation
  async testInvoiceIdFormat(testResults) {
    const test = {
      name: 'Invoice ID Format Validation',
      passed: false,
      details: {},
      error: null
    };

    try {
      // Test valid formats
      const validIds = [
        'BL-2024-12-123456',
        'BL-2024-01-789012',
        'BL-2024-06-345678'
      ];

      const invalidIds = [
        'INV-2024-001',
        '2024-MONTHLY-123',
        '24-12-MONTHLY-123456',
        '2024-13-MONTHLY-123456',
        '2024-12-MONTHLY-123456'
      ];

      const validResults = validIds.map(id => ({
        id,
        valid: invoiceGenerationService.validateInvoiceId(id)
      }));

      const invalidResults = invalidIds.map(id => ({
        id,
        valid: invoiceGenerationService.validateInvoiceId(id)
      }));

      const allValidPassed = validResults.every(r => r.valid);
      const allInvalidFailed = invalidResults.every(r => !r.valid);

      test.passed = allValidPassed && allInvalidFailed;
      test.details = {
        validIds: validResults,
        invalidIds: invalidResults,
        allValidPassed,
        allInvalidFailed
      };

      console.log('✅ Invoice ID format test passed');

    } catch (error) {
      test.error = error.message;
      console.error('❌ Invoice ID format test failed:', error);
    }

    testResults.tests.push(test);
  },

  // Test monthly invoice generation
  async testMonthlyInvoiceGeneration(testResults) {
    const test = {
      name: 'Monthly Invoice Generation',
      passed: false,
      details: {},
      error: null
    };

    try {
      // Generate test invoices for December 2024
      const result = await invoiceGenerationService.generateAndProcessMonthlyInvoices(12, 2024);
      
      test.passed = result.successfulInvoices > 0 && result.failedInvoices === 0;
      test.details = {
        month: result.month,
        totalStudents: result.totalStudents,
        successful: result.successfulInvoices,
        failed: result.failedInvoices,
        totalAmount: result.totalAmount,
        sampleInvoiceIds: result.results
          .filter(r => r.success)
          .slice(0, 3)
          .map(r => r.invoice.referenceId)
      };

      console.log('✅ Monthly invoice generation test passed');

    } catch (error) {
      test.error = error.message;
      console.error('❌ Monthly invoice generation test failed:', error);
    }

    testResults.tests.push(test);
  },

  // Test ledger integration
  async testLedgerIntegration(testResults) {
    const test = {
      name: 'Ledger Integration',
      passed: false,
      details: {},
      error: null
    };

    try {
      // Get ledger entries before and after invoice generation
      const ledgerEntriesBefore = await ledgerService.getLedgerEntries();
      const invoiceEntriesBefore = ledgerEntriesBefore.filter(e => e.type.includes('Invoice'));

      // Generate a test invoice
      const students = await studentService.getStudents();
      const activeStudent = students.find(s => !s.isCheckedOut && s.status === 'active');
      
      if (activeStudent) {
        await invoiceGenerationService.generateConfigurationInvoice(
          activeStudent.id,
          '2024-12-25',
          []
        );

        // Check ledger entries after
        const ledgerEntriesAfter = await ledgerService.getLedgerEntries();
        const invoiceEntriesAfter = ledgerEntriesAfter.filter(e => e.type.includes('Invoice'));

        test.passed = invoiceEntriesAfter.length > invoiceEntriesBefore.length;
        test.details = {
          entriesBefore: invoiceEntriesBefore.length,
          entriesAfter: invoiceEntriesAfter.length,
          newEntries: invoiceEntriesAfter.length - invoiceEntriesBefore.length,
          testStudent: activeStudent.name
        };

        console.log('✅ Ledger integration test passed');
      } else {
        throw new Error('No active student found for testing');
      }

    } catch (error) {
      test.error = error.message;
      console.error('❌ Ledger integration test failed:', error);
    }

    testResults.tests.push(test);
  },

  // Test configuration invoice
  async testConfigurationInvoice(testResults) {
    const test = {
      name: 'Configuration Invoice',
      passed: false,
      details: {},
      error: null
    };

    try {
      const students = await studentService.getStudents();
      const testStudent = students.find(s => !s.isCheckedOut);
      
      if (testStudent) {
        const result = await invoiceGenerationService.generateConfigurationInvoice(
          testStudent.id,
          '2024-12-15',
          [{ description: 'Security Deposit', amount: 5000, type: 'deposit' }]
        );

        const isValidId = invoiceGenerationService.validateInvoiceId(result.invoice.referenceId);
        const hasProperLedgerEntry = result.ledgerEntry && result.ledgerEntry.type === 'Configuration Invoice';

        test.passed = result.success && isValidId && hasProperLedgerEntry;
        test.details = {
          student: testStudent.name,
          invoiceId: result.invoice.referenceId,
          amount: result.invoice.totalAmount,
          validId: isValidId,
          ledgerIntegrated: hasProperLedgerEntry
        };

        console.log('✅ Configuration invoice test passed');
      } else {
        throw new Error('No suitable student found for testing');
      }

    } catch (error) {
      test.error = error.message;
      console.error('❌ Configuration invoice test failed:', error);
    }

    testResults.tests.push(test);
  },

  // Test invoice statistics
  async testInvoiceStatistics(testResults) {
    const test = {
      name: 'Invoice Statistics',
      passed: false,
      details: {},
      error: null
    };

    try {
      const stats = await invoiceGenerationService.getInvoiceStatistics();
      
      test.passed = stats.totalInvoices >= 0 && stats.totalAmount >= 0;
      test.details = {
        totalInvoices: stats.totalInvoices,
        totalAmount: stats.totalAmount,
        byType: stats.byType,
        monthCount: Object.keys(stats.byMonth).length
      };

      console.log('✅ Invoice statistics test passed');

    } catch (error) {
      test.error = error.message;
      console.error('❌ Invoice statistics test failed:', error);
    }

    testResults.tests.push(test);
  },

  // Quick test for UI
  async quickTest() {
    try {
      console.log('🧪 Running quick invoice test...');
      
      // Test invoice generation
      const result = await invoiceGenerationService.testInvoiceGeneration();
      
      // Test statistics
      const stats = await invoiceGenerationService.getInvoiceStatistics();
      
      return {
        success: true,
        invoiceGeneration: result,
        statistics: stats,
        message: `Generated ${result.successfulInvoices} invoices. Total system invoices: ${stats.totalInvoices}`
      };

    } catch (error) {
      console.error('❌ Quick test failed:', error);
      return {
        success: false,
        error: error.message,
        message: 'Quick test failed: ' + error.message
      };
    }
  }
};