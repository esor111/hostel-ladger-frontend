import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  Query,
  HttpStatus,
} from "@nestjs/common";
import { ApiTags, ApiOperation, ApiResponse } from "@nestjs/swagger";
import { PaymentsService } from "./payments.service";
import { CreatePaymentDto } from "./dto/create-payment.dto";
import { UpdatePaymentDto } from "./dto/update-payment.dto";

@ApiTags("payments")
@Controller("payments")
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Get()
  @ApiOperation({ summary: "Get all payments" })
  @ApiResponse({
    status: 200,
    description: "List of payments retrieved successfully",
  })
  async getAllPayments(@Query() query: any) {
    const result = await this.paymentsService.findAll(query);

    // Return EXACT same format as current Express API
    return {
      status: HttpStatus.OK,
      result: result,
    };
  }

  @Get("stats")
  @ApiOperation({ summary: "Get payment statistics" })
  @ApiResponse({
    status: 200,
    description: "Payment statistics retrieved successfully",
  })
  async getPaymentStats() {
    const stats = await this.paymentsService.getStats();

    // Return EXACT same format as current Express API
    return {
      status: HttpStatus.OK,
      stats: stats,
    };
  }

  @Get("student/:studentId")
  @ApiOperation({ summary: "Get payments by student ID" })
  @ApiResponse({
    status: 200,
    description: "Student payments retrieved successfully",
  })
  async getPaymentsByStudentId(@Param("studentId") studentId: string) {
    const payments = await this.paymentsService.findByStudentId(studentId);

    // Return EXACT same format as current Express API
    return {
      status: HttpStatus.OK,
      data: payments,
    };
  }

  @Get(":id")
  @ApiOperation({ summary: "Get payment by ID" })
  @ApiResponse({ status: 200, description: "Payment retrieved successfully" })
  @ApiResponse({ status: 404, description: "Payment not found" })
  async getPaymentById(@Param("id") id: string) {
    const payment = await this.paymentsService.findOne(id);

    // Return EXACT same format as current Express API
    return {
      status: HttpStatus.OK,
      data: payment,
    };
  }

  @Post()
  @ApiOperation({ summary: "Record new payment" })
  @ApiResponse({ status: 201, description: "Payment recorded successfully" })
  async recordPayment(@Body() createPaymentDto: CreatePaymentDto) {
    const payment = await this.paymentsService.create(createPaymentDto);

    // Return EXACT same format as current Express API
    return {
      status: HttpStatus.CREATED,
      data: payment,
    };
  }

  @Put(":id")
  @ApiOperation({ summary: "Update payment" })
  @ApiResponse({ status: 200, description: "Payment updated successfully" })
  async updatePayment(
    @Param("id") id: string,
    @Body() updatePaymentDto: UpdatePaymentDto
  ) {
    const payment = await this.paymentsService.update(id, updatePaymentDto);

    // Return EXACT same format as current Express API
    return {
      status: HttpStatus.OK,
      data: payment,
    };
  }

  @Post("bulk")
  @ApiOperation({ summary: "Process bulk payments" })
  @ApiResponse({
    status: 200,
    description: "Bulk payments processed successfully",
  })
  async processBulkPayments(@Body() bulkPaymentDto: any) {
    const result = await this.paymentsService.processBulkPayments(
      bulkPaymentDto.payments
    );

    // Return EXACT same format as current Express API
    return {
      status: HttpStatus.OK,
      data: result,
    };
  }

  @Post(":id/allocate")
  @ApiOperation({ summary: "Allocate payment to invoices" })
  @ApiResponse({ status: 200, description: "Payment allocated successfully" })
  async allocatePaymentToInvoices(
    @Param("id") id: string,
    @Body() allocationDto: any
  ) {
    const result = await this.paymentsService.allocatePaymentToInvoices(
      id,
      allocationDto.invoiceAllocations
    );

    // Return EXACT same format as current Express API
    return {
      status: HttpStatus.OK,
      data: result,
    };
  }
}
