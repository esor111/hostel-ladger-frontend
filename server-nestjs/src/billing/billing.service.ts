import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Student, StudentStatus } from '../students/entities/student.entity';
import { Invoice, InvoiceStatus } from '../invoices/entities/invoice.entity';
import { StudentFinancialInfo, FeeType } from '../students/entities/student-financial-info.entity';
import { LedgerEntry } from '../ledger/entities/ledger-entry.entity';

@Injectable()
export class BillingService {
  constructor(
    @InjectRepository(Student)
    private studentRepository: Repository<Student>,
    @InjectRepository(Invoice)
    private invoiceRepository: Repository<Invoice>,
    @InjectRepository(StudentFinancialInfo)
    private financialInfoRepository: Repository<StudentFinancialInfo>,
    @InjectRepository(LedgerEntry)
    private ledgerRepository: Repository<LedgerEntry>,
  ) {}

  async getMonthlyStats() {
    const currentMonth = new Date();
    const firstDayOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
    const lastDayOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);

    // Get configured students (students with active financial info)
    const configuredStudents = await this.studentRepository
      .createQueryBuilder('student')
      .innerJoin('student.financialInfo', 'financial')
      .where('student.status = :status', { status: StudentStatus.ACTIVE })
      .andWhere('financial.isActive = :isActive', { isActive: true })
      .getCount();

    // Get current month invoices
    const currentMonthInvoices = await this.invoiceRepository
      .createQueryBuilder('invoice')
      .where('invoice.createdAt >= :startDate', { startDate: firstDayOfMonth })
      .andWhere('invoice.createdAt <= :endDate', { endDate: lastDayOfMonth })
      .getMany();

    const currentMonthAmount = currentMonthInvoices.reduce((sum, invoice) => sum + invoice.total, 0);
    const paidInvoices = currentMonthInvoices.filter(inv => inv.status === InvoiceStatus.PAID).length;
    const overdueInvoices = await this.invoiceRepository.count({
      where: { status: InvoiceStatus.OVERDUE }
    });

    return {
      configuredStudents,
      currentMonthAmount,
      currentMonthInvoices: currentMonthInvoices.length,
      paidInvoices,
      overdueInvoices
    };
  }

  async generateMonthlyInvoices(month: number, year: number, dueDate?: Date) {
    const activeStudents = await this.studentRepository
      .createQueryBuilder('student')
      .leftJoinAndSelect('student.financialInfo', 'financial')
      .leftJoinAndSelect('student.room', 'room')
      .where('student.status = :status', { status: StudentStatus.ACTIVE })
      .andWhere('financial.isActive = :isActive', { isActive: true })
      .getMany();

    const generatedInvoices = [];
    const errors = [];

    for (const student of activeStudents) {
      try {
        const invoice = await this.generateStudentInvoice(student, month, year, dueDate);
        generatedInvoices.push(invoice);
      } catch (error) {
        errors.push({
          studentId: student.id,
          studentName: student.name,
          error: error.message
        });
      }
    }

    return {
      success: true,
      generated: generatedInvoices.length,
      failed: errors.length,
      totalAmount: generatedInvoices.reduce((sum, inv) => sum + inv.total, 0),
      invoices: generatedInvoices,
      errors: errors.length > 0 ? errors : undefined
    };
  }

  private async generateStudentInvoice(student: Student, month: number, year: number, dueDate?: Date) {
    // Calculate total amount from active financial info
    let totalAmount = 0;
    const lineItems = [];

    for (const financial of student.financialInfo.filter(f => f.isActive)) {
      totalAmount += financial.amount;
      lineItems.push({
        description: this.getFeeTypeDescription(financial.feeType),
        amount: financial.amount,
        feeType: financial.feeType
      });
    }

    // Set due date (default to 15th of the month)
    const invoiceDueDate = dueDate || new Date(year, month, 15);
    
    // Generate invoice number
    const invoiceNumber = `INV-${year}${String(month + 1).padStart(2, '0')}-${student.id}`;

    const invoice = this.invoiceRepository.create({
      invoiceNumber,
      studentId: student.id,
      month: `${this.getMonthName(month)} ${year}`,
      total: totalAmount,
      status: InvoiceStatus.UNPAID,
      dueDate: invoiceDueDate,
      notes: JSON.stringify(lineItems)
    });

    return await this.invoiceRepository.save(invoice);
  }

  private getFeeTypeDescription(feeType: FeeType): string {
    switch (feeType) {
      case FeeType.BASE_MONTHLY:
        return 'Monthly Room Rent';
      case FeeType.LAUNDRY:
        return 'Laundry Service';
      case FeeType.FOOD:
        return 'Food Service';
      default:
        return 'Additional Charge';
    }
  }

  private getMonthName(month: number): string {
    const months = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    return months[month];
  }

  async getBillingSchedule(months: number = 6) {
    const schedule = [];
    const currentDate = new Date();

    for (let i = 0; i < months; i++) {
      const scheduleDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + i, 1);
      const monthName = scheduleDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
      
      schedule.push({
        month: monthName,
        date: scheduleDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        year: scheduleDate.getFullYear(),
        monthNumber: scheduleDate.getMonth(),
        isCurrentMonth: i === 0
      });
    }

    return schedule;
  }

  async previewMonthlyBilling(month: number, year: number) {
    const activeStudents = await this.studentRepository
      .createQueryBuilder('student')
      .leftJoinAndSelect('student.financialInfo', 'financial')
      .leftJoinAndSelect('student.room', 'room')
      .where('student.status = :status', { status: StudentStatus.ACTIVE })
      .andWhere('financial.isActive = :isActive', { isActive: true })
      .getMany();

    let totalAmount = 0;
    const studentPreviews = [];

    for (const student of activeStudents) {
      const activeCharges = student.financialInfo.filter(f => f.isActive);
      const monthlyAmount = activeCharges.reduce((sum, charge) => sum + charge.amount, 0);
      
      totalAmount += monthlyAmount;
      studentPreviews.push({
        id: student.id,
        name: student.name,
        roomNumber: student.room?.roomNumber,
        activeCharges: activeCharges.length,
        monthlyAmount
      });
    }

    return {
      month: this.getMonthName(month),
      year,
      totalAmount,
      totalStudents: activeStudents.length,
      students: studentPreviews
    };
  }

  async getStudentsReadyForBilling() {
    const students = await this.studentRepository
      .createQueryBuilder('student')
      .leftJoinAndSelect('student.financialInfo', 'financial')
      .leftJoinAndSelect('student.room', 'room')
      .leftJoin('student.invoices', 'invoice')
      .where('student.status = :status', { status: StudentStatus.ACTIVE })
      .andWhere('financial.isActive = :isActive', { isActive: true })
      .getMany();

    return students.map(student => {
      const activeCharges = student.financialInfo.filter(f => f.isActive);
      const monthlyTotal = activeCharges.reduce((sum, charge) => sum + charge.amount, 0);
      
      // Get last invoice date (placeholder - will implement when invoice relations are set up)
      const lastInvoiceDate = null; // student.invoices?.[0]?.createdAt || null;

      return {
        id: student.id,
        name: student.name,
        roomNumber: student.room?.roomNumber,
        monthlyTotal,
        activeCharges: activeCharges.length,
        lastInvoiceDate: lastInvoiceDate ? 
          new Date(lastInvoiceDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 
          'Never'
      };
    });
  }

  async getBillingHistory(page: number = 1, limit: number = 20) {
    const offset = (page - 1) * limit;

    const [invoices, total] = await this.invoiceRepository
      .createQueryBuilder('invoice')
      .leftJoinAndSelect('invoice.student', 'student')
      .leftJoinAndSelect('student.room', 'room')
      .orderBy('invoice.createdAt', 'DESC')
      .skip(offset)
      .take(limit)
      .getManyAndCount();

    const items = invoices.map(invoice => ({
      id: invoice.id,
      invoiceNumber: invoice.invoiceNumber,
      studentId: invoice.student?.id,
      studentName: invoice.student?.name,
      roomNumber: invoice.student?.room?.roomNumber,
      month: invoice.month,
      amount: invoice.total,
      status: invoice.status,
      generatedDate: invoice.createdAt,
      dueDate: invoice.dueDate,
      paidDate: null // Will be set when payment is made
    }));

    return {
      items,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  }
}