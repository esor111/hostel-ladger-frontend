import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Student, StudentStatus } from '../students/entities/student.entity';
import { LedgerEntry } from '../ledger/entities/ledger-entry.entity';
import { Payment, PaymentStatus } from '../payments/entities/payment.entity';
import { Invoice, InvoiceStatus } from '../invoices/entities/invoice.entity';

@Injectable()
export class DashboardService {
  constructor(
    @InjectRepository(Student)
    private studentRepository: Repository<Student>,
    @InjectRepository(LedgerEntry)
    private ledgerRepository: Repository<LedgerEntry>,
    @InjectRepository(Payment)
    private paymentRepository: Repository<Payment>,
    @InjectRepository(Invoice)
    private invoiceRepository: Repository<Invoice>,
  ) {}

  async getDashboardStats() {
    // Get student counts
    const totalStudents = await this.studentRepository.count();
    const activeStudents = await this.studentRepository.count({
      where: { status: StudentStatus.ACTIVE }
    });
    const checkedOutStudents = await this.studentRepository.count({
      where: { status: StudentStatus.INACTIVE }
    });

    // Get financial totals
    const totalCollectedResult = await this.paymentRepository
      .createQueryBuilder('payment')
      .select('SUM(payment.amount)', 'total')
      .where('payment.status = :status', { status: PaymentStatus.COMPLETED })
      .getRawOne();

    const totalCollected = parseFloat(totalCollectedResult?.total) || 0;

    // Get outstanding dues
    const outstandingDuesResult = await this.ledgerRepository
      .createQueryBuilder('ledger')
      .select('SUM(ledger.balance)', 'total')
      .where('ledger.balanceType = :type', { type: 'Dr' })
      .getRawOne();

    const totalDues = parseFloat(outstandingDuesResult?.total) || 0;

    // Get this month's collection
    const currentMonth = new Date();
    const firstDayOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
    
    const thisMonthCollectionResult = await this.paymentRepository
      .createQueryBuilder('payment')
      .select('SUM(payment.amount)', 'total')
      .where('payment.paymentDate >= :startDate', { startDate: firstDayOfMonth })
      .andWhere('payment.status = :status', { status: PaymentStatus.COMPLETED })
      .getRawOne();

    const thisMonthCollection = parseFloat(thisMonthCollectionResult?.total) || 0;

    // Get advance balances
    const advanceBalancesResult = await this.ledgerRepository
      .createQueryBuilder('ledger')
      .select('SUM(ledger.balance)', 'total')
      .where('ledger.balanceType = :type', { type: 'Cr' })
      .getRawOne();

    const advanceBalances = parseFloat(advanceBalancesResult?.total) || 0;

    // Get overdue invoices count
    const overdueInvoices = await this.invoiceRepository.count({
      where: {
        status: InvoiceStatus.OVERDUE
      }
    });

    return {
      totalStudents,
      activeStudents,
      checkedOutStudents,
      totalCollected,
      totalDues,
      thisMonthCollection,
      advanceBalances,
      overdueInvoices
    };
  }

  async getRecentActivity(limit: number = 10) {
    // Get recent payments
    const recentPayments = await this.paymentRepository
      .createQueryBuilder('payment')
      .leftJoinAndSelect('payment.student', 'student')
      .orderBy('payment.paymentDate', 'DESC')
      .limit(5)
      .getMany();

    // Get recent invoices
    const recentInvoices = await this.invoiceRepository
      .createQueryBuilder('invoice')
      .leftJoinAndSelect('invoice.student', 'student')
      .orderBy('invoice.createdAt', 'DESC')
      .limit(5)
      .getMany();

    // Combine and format activities
    const activities = [];

    recentPayments.forEach(payment => {
      activities.push({
        id: `payment-${payment.id}`,
        type: 'payment',
        description: `Payment received from ${payment.student?.name}`,
        amount: payment.amount,
        date: payment.paymentDate,
        status: payment.status
      });
    });

    recentInvoices.forEach(invoice => {
      activities.push({
        id: `invoice-${invoice.id}`,
        type: 'invoice',
        description: `Invoice generated for ${invoice.student?.name}`,
        amount: invoice.total,
        date: invoice.createdAt,
        status: invoice.status
      });
    });

    // Sort by date and limit
    return activities
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, limit);
  }

  async getCheckedOutWithDues() {
    const studentsWithDues = await this.studentRepository
      .createQueryBuilder('student')
      .leftJoinAndSelect('student.room', 'room')
      .leftJoin('student.ledgerEntries', 'ledger')
      .select([
        'student.id',
        'student.name',
        'student.phone',
        'student.email',
        'room.roomNumber',
        'SUM(CASE WHEN ledger.balanceType = \'Dr\' THEN ledger.balance ELSE -ledger.balance END) as outstandingDues'
      ])
      .where('student.status = :status', { status: StudentStatus.INACTIVE })
      .groupBy('student.id, room.roomNumber')
      .having('SUM(CASE WHEN ledger.balanceType = \'Dr\' THEN ledger.balance ELSE -ledger.balance END) > 0')
      .getRawMany();

    return studentsWithDues.map(student => ({
      studentId: student.student_id,
      studentName: student.student_name,
      roomNumber: student.room_roomNumber,
      phone: student.student_phone,
      email: student.student_email,
      outstandingDues: parseFloat(student.outstandingDues) || 0,
      checkoutDate: student.student_updatedAt, // Assuming checkout updates the student record
      status: 'pending_payment'
    }));
  }

  async getMonthlyRevenue(months: number = 12) {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - months);

    const monthlyData = await this.paymentRepository
      .createQueryBuilder('payment')
      .select([
        'EXTRACT(YEAR FROM payment.paymentDate) as year',
        'EXTRACT(MONTH FROM payment.paymentDate) as month',
        'SUM(payment.amount) as amount'
      ])
      .where('payment.paymentDate >= :startDate', { startDate })
      .andWhere('payment.paymentDate <= :endDate', { endDate })
      .andWhere('payment.status = :status', { status: PaymentStatus.COMPLETED })
      .groupBy('EXTRACT(YEAR FROM payment.paymentDate), EXTRACT(MONTH FROM payment.paymentDate)')
      .orderBy('year, month')
      .getRawMany();

    // Format the data
    return monthlyData.map(data => ({
      month: new Date(data.year, data.month - 1).toLocaleDateString('en-US', { month: 'short' }),
      amount: parseFloat(data.amount) || 0
    }));
  }

  async getOverdueInvoices() {
    const overdueInvoices = await this.invoiceRepository
      .createQueryBuilder('invoice')
      .leftJoinAndSelect('invoice.student', 'student')
      .leftJoinAndSelect('student.room', 'room')
      .where('invoice.status = :status', { status: InvoiceStatus.OVERDUE })
      .orderBy('invoice.dueDate', 'ASC')
      .getMany();

    return overdueInvoices.map(invoice => ({
      id: invoice.id,
      studentId: invoice.student?.id,
      studentName: invoice.student?.name,
      roomNumber: invoice.student?.room?.roomNumber,
      invoiceNumber: invoice.invoiceNumber,
      amount: invoice.total,
      dueDate: invoice.dueDate,
      daysPastDue: Math.floor((new Date().getTime() - new Date(invoice.dueDate).getTime()) / (1000 * 60 * 60 * 24))
    }));
  }

  async getDashboardSummary() {
    const [
      stats,
      recentActivity,
      checkedOutWithDues,
      monthlyRevenue,
      overdueInvoices
    ] = await Promise.all([
      this.getDashboardStats(),
      this.getRecentActivity(6),
      this.getCheckedOutWithDues(),
      this.getMonthlyRevenue(12),
      this.getOverdueInvoices()
    ]);

    return {
      stats,
      recentActivity,
      checkedOutWithDues,
      monthlyRevenue,
      overdueInvoices: overdueInvoices.slice(0, 5) // Limit to top 5 overdue
    };
  }
}