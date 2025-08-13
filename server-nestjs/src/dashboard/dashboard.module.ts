import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';
import { Student } from '../students/entities/student.entity';
import { LedgerEntry } from '../ledger/entities/ledger-entry.entity';
import { Payment } from '../payments/entities/payment.entity';
import { Invoice } from '../invoices/entities/invoice.entity';

@Module({
  imports: [TypeOrmModule.forFeature([
    Student,
    LedgerEntry,
    Payment,
    Invoice
  ])],
  controllers: [DashboardController],
  providers: [DashboardService],
  exports: [DashboardService],
})
export class DashboardModule {}