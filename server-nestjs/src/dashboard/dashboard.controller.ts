import { Controller, Get, Query, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { DashboardService } from './dashboard.service';

@ApiTags('dashboard')
@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('stats')
  @ApiOperation({ summary: 'Get dashboard statistics' })
  @ApiResponse({ status: 200, description: 'Dashboard statistics retrieved successfully' })
  async getDashboardStats() {
    const stats = await this.dashboardService.getDashboardStats();
    
    return {
      status: HttpStatus.OK,
      data: stats
    };
  }

  @Get('recent-activity')
  @ApiOperation({ summary: 'Get recent activities' })
  @ApiResponse({ status: 200, description: 'Recent activities retrieved successfully' })
  async getRecentActivity(@Query('limit') limit: number = 10) {
    const activities = await this.dashboardService.getRecentActivity(limit);
    
    return {
      status: HttpStatus.OK,
      data: activities
    };
  }

  @Get('checked-out-dues')
  @ApiOperation({ summary: 'Get students with outstanding dues after checkout' })
  @ApiResponse({ status: 200, description: 'Checked out students with dues retrieved successfully' })
  async getCheckedOutWithDues() {
    const students = await this.dashboardService.getCheckedOutWithDues();
    
    return {
      status: HttpStatus.OK,
      data: students
    };
  }

  @Get('monthly-revenue')
  @ApiOperation({ summary: 'Get monthly revenue data' })
  @ApiResponse({ status: 200, description: 'Monthly revenue data retrieved successfully' })
  async getMonthlyRevenue(@Query('months') months: number = 12) {
    const revenue = await this.dashboardService.getMonthlyRevenue(months);
    
    return {
      status: HttpStatus.OK,
      data: revenue
    };
  }

  @Get('overdue-invoices')
  @ApiOperation({ summary: 'Get overdue invoices' })
  @ApiResponse({ status: 200, description: 'Overdue invoices retrieved successfully' })
  async getOverdueInvoices() {
    const invoices = await this.dashboardService.getOverdueInvoices();
    
    return {
      status: HttpStatus.OK,
      data: invoices
    };
  }

  @Get('summary')
  @ApiOperation({ summary: 'Get comprehensive dashboard summary' })
  @ApiResponse({ status: 200, description: 'Dashboard summary retrieved successfully' })
  async getDashboardSummary() {
    const summary = await this.dashboardService.getDashboardSummary();
    
    return {
      status: HttpStatus.OK,
      data: summary
    };
  }
}