import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Student, StudentStatus } from '../students/entities/student.entity';
import { LedgerEntry } from '../ledger/entities/ledger-entry.entity';
import { Payment, PaymentStatus } from '../payments/entities/payment.entity';
import { Invoice, InvoiceStatus } from '../invoices/entities/invoice.entity';
import { BookingRequest, BookingStatus } from '../bookings/entities/booking-request.entity';

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
    @InjectRepository(BookingRequest)
    private bookingRepository: Repository<BookingRequest>,
  ) {}

  async getDashboardStats() {
    // Get active students count
    const totalStudents = await this.studentRepository.count({
      where: { status: StudentStatus.ACTIVE }
    });

    // Calculate available rooms (mock calculation - would need Room entity)
    // For now, assume 200 total rooms and calculate occupancy
    const totalRooms = 200;
    const occupiedRooms = await this.studentRepository.count({
      where: { status: StudentStatus.ACTIVE }
    });
    const availableRooms = Math.max(0, totalRooms - occupiedRooms);

    // Get this month's revenue
    const currentMonth = new Date();
    const firstDayOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
    
    const thisMonthRevenueResult = await this.paymentRepository
      .createQueryBuilder('payment')
      .select('SUM(payment.amount)', 'total')
      .where('payment.paymentDate >= :startDate', { startDate: firstDayOfMonth })
      .andWhere('payment.status = :status', { status: PaymentStatus.COMPLETED })
      .getRawOne();

    const thisMonthRevenue = parseFloat(thisMonthRevenueResult?.total) || 0;

    // Get pending payments count (failed + pending)
    const pendingPayments = await this.paymentRepository.count({
      where: [
        { status: PaymentStatus.PENDING },
        { status: PaymentStatus.FAILED }
      ]
    });

    // Calculate occupancy percentage
    const occupancyPercentage = totalRooms > 0 ? Math.round((occupiedRooms / totalRooms) * 100) : 0;

    return {
      totalStudents,
      availableRooms,
      monthlyRevenue: {
        value: `NPR ${thisMonthRevenue.toLocaleString()}`,
        amount: thisMonthRevenue
      },
      pendingPayments,
      occupancyPercentage // This is a meaningful percentage to keep
    };
  }

  async getRecentActivity(limit: number = 10) {
    const activities = [];

    // Get recent payments
    const recentPayments = await this.paymentRepository
      .createQueryBuilder('payment')
      .leftJoinAndSelect('payment.student', 'student')
      .where('payment.status = :status', { status: PaymentStatus.COMPLETED })
      .orderBy('payment.createdAt', 'DESC')
      .limit(5)
      .getMany();

    recentPayments.forEach(payment => {
      activities.push({
        id: `payment-${payment.id}`,
        type: 'payment',
        message: `Payment received from ${payment.student?.name || 'Unknown'} - NPR ${payment.amount.toLocaleString()}`,
        time: this.getRelativeTime(payment.createdAt),
        timestamp: payment.createdAt,
        icon: 'DollarSign',
        color: 'text-green-600'
      });
    });

    // Get recent student check-ins (new students)
    const recentStudents = await this.studentRepository
      .createQueryBuilder('student')
      .leftJoinAndSelect('student.room', 'room')
      .where('student.status = :status', { status: StudentStatus.ACTIVE })
      .orderBy('student.createdAt', 'DESC')
      .limit(3)
      .getMany();

    recentStudents.forEach(student => {
      activities.push({
        id: `checkin-${student.id}`,
        type: 'checkin',
        message: `New student checked in - ${student.name}${student.room ? ` (Room ${student.room.roomNumber})` : ''}`,
        time: this.getRelativeTime(student.createdAt),
        timestamp: student.createdAt,
        icon: 'Users',
        color: 'text-blue-600'
      });
    });

    // Get recent booking requests
    const recentBookings = await this.bookingRepository
      .createQueryBuilder('booking')
      .where('booking.status = :status', { status: BookingStatus.PENDING })
      .orderBy('booking.createdAt', 'DESC')
      .limit(2)
      .getMany();

    recentBookings.forEach(booking => {
      activities.push({
        id: `booking-${booking.id}`,
        type: 'booking',
        message: `New booking request from ${booking.name}`,
        time: this.getRelativeTime(booking.createdAt),
        timestamp: booking.createdAt,
        icon: 'Gift',
        color: 'text-purple-600'
      });
    });

    // Get overdue invoices
    const overdueInvoices = await this.invoiceRepository
      .createQueryBuilder('invoice')
      .leftJoinAndSelect('invoice.student', 'student')
      .where('invoice.status = :status', { status: InvoiceStatus.OVERDUE })
      .orderBy('invoice.dueDate', 'ASC')
      .limit(2)
      .getMany();

    overdueInvoices.forEach(invoice => {
      activities.push({
        id: `overdue-${invoice.id}`,
        type: 'overdue',
        message: `Payment overdue - ${invoice.student?.name || 'Unknown Student'}`,
        time: this.getRelativeTime(invoice.dueDate),
        timestamp: invoice.dueDate,
        icon: 'DollarSign',
        color: 'text-red-600'
      });
    });

    // Sort by timestamp and limit
    return activities
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, limit);
  }

  private getRelativeTime(date: Date): string {
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes} minute${diffInMinutes > 1 ? 's' : ''} ago`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
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