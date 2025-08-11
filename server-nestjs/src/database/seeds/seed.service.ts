import { Injectable, Logger } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";

// Import all entities
import { Student, StudentStatus } from "../../students/entities/student.entity";
import {
  StudentContact,
  ContactType,
} from "../../students/entities/student-contact.entity";
import { StudentAcademicInfo } from "../../students/entities/student-academic-info.entity";
import {
  StudentFinancialInfo,
  FeeType,
} from "../../students/entities/student-financial-info.entity";

import {
  Room,
  RoomStatus,
  MaintenanceStatus,
  Gender,
} from "../../rooms/entities/room.entity";
import { Building } from "../../rooms/entities/building.entity";
import { RoomType } from "../../rooms/entities/room-type.entity";
import { Amenity } from "../../rooms/entities/amenity.entity";
import { RoomAmenity } from "../../rooms/entities/room-amenity.entity";
import { RoomLayout } from "../../rooms/entities/room-layout.entity";
import { RoomOccupant } from "../../rooms/entities/room-occupant.entity";

import { Invoice, InvoiceStatus } from "../../invoices/entities/invoice.entity";
import {
  InvoiceItem,
  InvoiceItemCategory,
} from "../../invoices/entities/invoice-item.entity";

import {
  Payment,
  PaymentMethod,
  PaymentStatus,
} from "../../payments/entities/payment.entity";
import { PaymentInvoiceAllocation } from "../../payments/entities/payment-invoice-allocation.entity";

import {
  LedgerEntry,
  LedgerEntryType,
  BalanceType,
} from "../../ledger/entities/ledger-entry.entity";

import {
  Discount,
  DiscountStatus,
  DiscountApplication,
} from "../../discounts/entities/discount.entity";
import {
  DiscountType,
  DiscountCategory,
} from "../../discounts/entities/discount-type.entity";

import {
  BookingRequest,
  BookingStatus,
} from "../../bookings/entities/booking-request.entity";

import { Report } from "../../reports/entities/report.entity";

@Injectable()
export class SeedService {
  private readonly logger = new Logger(SeedService.name);

  constructor(
    // Student repositories
    @InjectRepository(Student)
    private studentRepository: Repository<Student>,
    @InjectRepository(StudentContact)
    private studentContactRepository: Repository<StudentContact>,
    @InjectRepository(StudentAcademicInfo)
    private studentAcademicRepository: Repository<StudentAcademicInfo>,
    @InjectRepository(StudentFinancialInfo)
    private studentFinancialRepository: Repository<StudentFinancialInfo>,

    // Room repositories
    @InjectRepository(Room)
    private roomRepository: Repository<Room>,
    @InjectRepository(Building)
    private buildingRepository: Repository<Building>,
    @InjectRepository(RoomType)
    private roomTypeRepository: Repository<RoomType>,
    @InjectRepository(Amenity)
    private amenityRepository: Repository<Amenity>,
    @InjectRepository(RoomAmenity)
    private roomAmenityRepository: Repository<RoomAmenity>,
    @InjectRepository(RoomLayout)
    private roomLayoutRepository: Repository<RoomLayout>,
    @InjectRepository(RoomOccupant)
    private roomOccupantRepository: Repository<RoomOccupant>,

    // Financial repositories
    @InjectRepository(Invoice)
    private invoiceRepository: Repository<Invoice>,
    @InjectRepository(InvoiceItem)
    private invoiceItemRepository: Repository<InvoiceItem>,
    @InjectRepository(Payment)
    private paymentRepository: Repository<Payment>,
    @InjectRepository(PaymentInvoiceAllocation)
    private paymentAllocationRepository: Repository<PaymentInvoiceAllocation>,
    @InjectRepository(LedgerEntry)
    private ledgerRepository: Repository<LedgerEntry>,

    // Discount repositories
    @InjectRepository(Discount)
    private discountRepository: Repository<Discount>,
    @InjectRepository(DiscountType)
    private discountTypeRepository: Repository<DiscountType>,

    // Booking repository
    @InjectRepository(BookingRequest)
    private bookingRepository: Repository<BookingRequest>,

    // Report repository
    @InjectRepository(Report)
    private reportRepository: Repository<Report>
  ) {}

  async checkSeedStatus() {
    const status = {
      buildings: await this.buildingRepository.count(),
      roomTypes: await this.roomTypeRepository.count(),
      amenities: await this.amenityRepository.count(),
      rooms: await this.roomRepository.count(),
      roomOccupants: await this.roomOccupantRepository.count(),
      students: await this.studentRepository.count(),
      studentContacts: await this.studentContactRepository.count(),
      studentAcademic: await this.studentAcademicRepository.count(),
      studentFinancial: await this.studentFinancialRepository.count(),
      discountTypes: await this.discountTypeRepository.count(),
      discounts: await this.discountRepository.count(),
      invoices: await this.invoiceRepository.count(),
      invoiceItems: await this.invoiceItemRepository.count(),
      payments: await this.paymentRepository.count(),
      paymentAllocations: await this.paymentAllocationRepository.count(),
      ledgerEntries: await this.ledgerRepository.count(),
      bookings: await this.bookingRepository.count(),
      reports: await this.reportRepository.count(),
      lastSeeded: new Date().toISOString(),
    };

    this.logger.log("Seed status checked", status);
    return status;
  }

  async seedAll(force = false) {
    this.logger.log("Starting complete database seeding...");

    try {
      // If force is true, clear all data first in proper order
      if (force) {
        await this.clearAllData();
      }

      // Seed in proper dependency order (without force to avoid individual deletions)
      const results = {
        // 1. Independent entities first
        buildings: await this.seedBuildings(false),
        roomTypes: await this.seedRoomTypes(false),
        amenities: await this.seedAmenities(false),

        // 2. Rooms depend on buildings, room types, and amenities
        rooms: await this.seedRooms(false),

        // 3. Students depend on rooms
        students: await this.seedStudents(false),

        // 4. Room occupants depend on students and rooms
        roomOccupants: await this.seedRoomOccupants(false),

        // 5. Discount types before discounts
        discountTypes: await this.seedDiscountTypes(false),

        // 6. Financial entities
        invoices: await this.seedInvoices(false),
        payments: await this.seedPayments(false),
        paymentAllocations: await this.seedPaymentAllocations(false),

        // 7. Discounts depend on students and discount types
        discounts: await this.seedDiscounts(false),

        // 8. Ledger entries depend on all financial entities
        ledgerEntries: await this.seedLedgerEntries(false),

        // 9. Bookings are independent
        bookings: await this.seedBookings(false),
      };

      this.logger.log("Complete database seeding finished", results);
      return results;
    } catch (error) {
      this.logger.error("Error during complete seeding:", error);
      throw error;
    }
  }

  async seedBuildings(force = false) {
    if (!force && (await this.buildingRepository.count()) > 0) {
      return {
        message: "Buildings already exist, use ?force=true to reseed",
        count: 0,
      };
    }

    const buildings = [
      {
        name: "Main Building",
        address: "123 Hostel Street, City",
        floors: 4,
        totalRooms: 50,
        isActive: true,
      },
      {
        name: "Annex Building",
        address: "456 Hostel Avenue, City",
        floors: 3,
        totalRooms: 30,
        isActive: true,
      },
    ];

    if (force) {
      await this.buildingRepository.createQueryBuilder().delete().execute();
    }

    const savedBuildings = await this.buildingRepository.save(buildings);
    this.logger.log(`Seeded ${savedBuildings.length} buildings`);

    return { count: savedBuildings.length, data: savedBuildings };
  }

  async seedRoomTypes(force = false) {
    if (!force && (await this.roomTypeRepository.count()) > 0) {
      return {
        message: "Room types already exist, use ?force=true to reseed",
        count: 0,
      };
    }

    const roomTypes = [
      {
        name: "Single AC",
        description: "Single occupancy room with air conditioning",
        defaultBedCount: 1,
        maxOccupancy: 1,
        baseMonthlyRate: 8000,
        baseDailyRate: 267,
        pricingModel: "monthly",
        isActive: true,
      },
      {
        name: "Double AC",
        description: "Double occupancy room with air conditioning",
        defaultBedCount: 2,
        maxOccupancy: 2,
        baseMonthlyRate: 6000,
        baseDailyRate: 200,
        pricingModel: "monthly",
        isActive: true,
      },
      {
        name: "Triple Non-AC",
        description: "Triple occupancy room without air conditioning",
        defaultBedCount: 3,
        maxOccupancy: 3,
        baseMonthlyRate: 4000,
        baseDailyRate: 133,
        pricingModel: "monthly",
        isActive: true,
      },
    ];

    if (force) {
      await this.roomTypeRepository.createQueryBuilder().delete().execute();
    }

    const savedRoomTypes = await this.roomTypeRepository.save(roomTypes);
    this.logger.log(`Seeded ${savedRoomTypes.length} room types`);

    return { count: savedRoomTypes.length, data: savedRoomTypes };
  }

  async seedAmenities(force = false) {
    if (!force && (await this.amenityRepository.count()) > 0) {
      return {
        message: "Amenities already exist, use ?force=true to reseed",
        count: 0,
      };
    }

    const amenities = [
      {
        name: "Air Conditioning",
        category: "UTILITIES",
        description: "Split AC unit for room cooling",
        isActive: true,
      },
      {
        name: "WiFi",
        category: "UTILITIES",
        description: "High-speed internet connection",
        isActive: true,
      },
      {
        name: "Study Table",
        category: "FURNITURE",
        description: "Wooden study table with drawers",
        isActive: true,
      },
      {
        name: "Wardrobe",
        category: "FURNITURE",
        description: "3-door wooden wardrobe",
        isActive: true,
      },
      {
        name: "Ceiling Fan",
        category: "UTILITIES",
        description: "High-speed ceiling fan",
        isActive: true,
      },
    ];

    if (force) {
      await this.amenityRepository.createQueryBuilder().delete().execute();
    }

    const savedAmenities = await this.amenityRepository.save(amenities);
    this.logger.log(`Seeded ${savedAmenities.length} amenities`);

    return { count: savedAmenities.length, data: savedAmenities };
  }

  async seedRooms(force = false) {
    if (!force && (await this.roomRepository.count()) > 0) {
      return {
        message: "Rooms already exist, use ?force=true to reseed",
        count: 0,
      };
    }

    // Ensure dependencies exist
    await this.seedBuildings(false);
    await this.seedRoomTypes(false);
    await this.seedAmenities(false);

    // Get first building and room type for simplicity
    const building = await this.buildingRepository.findOne({ where: {} });
    const roomType = await this.roomTypeRepository.findOne({ where: {} });

    const rooms = [
      {
        name: "Room 101",
        roomNumber: "101",
        bedCount: 2,
        occupancy: 0,
        gender: "Male",
        status: "ACTIVE",
        maintenanceStatus: "Good",
        description: "Double occupancy room on first floor",
        buildingId: building?.id,
        roomTypeId: roomType?.id,
      },
      {
        name: "Room 102",
        roomNumber: "102",
        bedCount: 2,
        occupancy: 1,
        gender: "Male",
        status: "ACTIVE",
        maintenanceStatus: "Good",
        description: "Double occupancy room on first floor",
        buildingId: building?.id,
        roomTypeId: roomType?.id,
      },
      {
        name: "Room 201",
        roomNumber: "201",
        bedCount: 1,
        occupancy: 0,
        gender: "Female",
        status: "ACTIVE",
        maintenanceStatus: "Excellent",
        description: "Single occupancy room on second floor",
        buildingId: building?.id,
        roomTypeId: roomType?.id,
      },
    ];

    if (force) {
      await this.roomRepository.createQueryBuilder().delete().execute();
    }

    const savedRooms = await this.roomRepository.save(rooms);
    this.logger.log(`Seeded ${savedRooms.length} rooms`);

    return { count: savedRooms.length, data: savedRooms };
  }

  async seedStudents(force = false) {
    if (!force && (await this.studentRepository.count()) > 0) {
      return {
        message: "Students already exist, use ?force=true to reseed",
        count: 0,
      };
    }

    // Ensure rooms exist (don't force dependencies)
    await this.seedRooms(false);

    const students = [
      {
        name: "John Doe",
        phone: "+1234567890",
        email: "john.doe@example.com",
        enrollmentDate: new Date("2024-01-15"),
        status: StudentStatus.ACTIVE,
        address: "123 Main Street, City",
      },
      {
        name: "Jane Smith",
        phone: "+1234567891",
        email: "jane.smith@example.com",
        enrollmentDate: new Date("2024-02-01"),
        status: StudentStatus.ACTIVE,
        address: "456 Oak Avenue, City",
      },
      {
        name: "Mike Johnson",
        phone: "+1234567892",
        email: "mike.johnson@example.com",
        enrollmentDate: new Date("2024-02-15"),
        status: StudentStatus.ACTIVE,
        address: "789 Pine Road, City",
      },
    ];

    if (force) {
      await this.studentFinancialRepository
        .createQueryBuilder()
        .delete()
        .execute();
      await this.studentAcademicRepository
        .createQueryBuilder()
        .delete()
        .execute();
      await this.studentContactRepository
        .createQueryBuilder()
        .delete()
        .execute();
      await this.studentRepository.createQueryBuilder().delete().execute();
    }

    const savedStudents = await this.studentRepository.save(students);

    // Add contacts
    const contacts = [];
    const guardianData = [
      { name: "Robert Doe", phone: "+1234567800" },
      { name: "Mary Smith", phone: "+1234567801" },
      { name: "David Johnson", phone: "+1234567802" },
    ];

    savedStudents.forEach((student, index) => {
      const guardian = guardianData[index] || guardianData[0];
      contacts.push(
        {
          studentId: student.id,
          type: ContactType.EMERGENCY,
          name: guardian.name,
          phone: guardian.phone,
          relationship: "Guardian",
          isActive: true,
        },
        {
          studentId: student.id,
          type: ContactType.GUARDIAN,
          name: student.name,
          phone: student.phone,
          email: student.email,
          relationship: "Self",
          isActive: true,
        }
      );
    });
    await this.studentContactRepository.save(contacts);

    // Add academic info
    const academicInfo = [
      {
        studentId: "STU001",
        course: "Computer Science",
        institution: "Tech University",
        academicYear: "2023-2024",
        semester: "4th",
        studentIdNumber: "CS2022001",
        isActive: true,
      },
      {
        studentId: "STU002",
        course: "Business Administration",
        institution: "Business College",
        academicYear: "2021-2024",
        semester: "6th",
        studentIdNumber: "BA2021002",
        isActive: true,
      },
      {
        studentId: "STU003",
        course: "Mechanical Engineering",
        institution: "Engineering College",
        academicYear: "2023-2027",
        semester: "2nd",
        studentIdNumber: "ME2023003",
        isActive: true,
      },
    ];
    await this.studentAcademicRepository.save(academicInfo);

    // Add financial info
    const financialInfo = [
      {
        studentId: "STU001",
        feeType: FeeType.BASE_MONTHLY,
        amount: 8000,
        effectiveFrom: new Date("2024-07-01"),
        isActive: true,
      },
      {
        studentId: "STU002",
        feeType: FeeType.BASE_MONTHLY,
        amount: 6000,
        effectiveFrom: new Date("2024-07-01"),
        isActive: true,
      },
      {
        studentId: "STU003",
        feeType: FeeType.BASE_MONTHLY,
        amount: 6000,
        effectiveFrom: new Date("2024-07-01"),
        isActive: true,
      },
    ];
    await this.studentFinancialRepository.save(financialInfo);

    this.logger.log(
      `Seeded ${savedStudents.length} students with contacts, academic, and financial info`
    );

    return {
      count: savedStudents.length,
      data: {
        students: savedStudents.length,
        contacts: contacts.length,
        academic: academicInfo.length,
        financial: financialInfo.length,
      },
    };
  }

  async seedInvoices(force = false) {
    if (!force && (await this.invoiceRepository.count()) > 0) {
      return {
        message: "Invoices already exist, use ?force=true to reseed",
        count: 0,
      };
    }

    // Ensure students exist
    await this.seedStudents(force);

    const invoices = [
      {
        id: "INV001",
        studentId: "STU001",
        month: "July 2024",
        issueDate: new Date("2024-07-01"),
        dueDate: new Date("2024-07-31"),
        total: 8500,
        paidAmount: 8500,
        status: InvoiceStatus.PAID,
        notes: "Monthly rent and utilities",
        createdBy: "admin",
      },
      {
        id: "INV002",
        studentId: "STU002",
        month: "July 2024",
        issueDate: new Date("2024-07-01"),
        dueDate: new Date("2024-07-31"),
        total: 6200,
        paidAmount: 6200,
        status: InvoiceStatus.PAID,
        notes: "Monthly rent and utilities",
        createdBy: "admin",
      },
      {
        id: "INV003",
        studentId: "STU003",
        month: "July 2024",
        issueDate: new Date("2024-07-01"),
        dueDate: new Date("2024-07-31"),
        total: 6200,
        paidAmount: 3000,
        status: InvoiceStatus.PARTIALLY_PAID,
        notes: "Monthly rent and utilities",
        createdBy: "admin",
      },
    ];

    if (force) {
      await this.invoiceItemRepository.createQueryBuilder().delete().execute();
      await this.invoiceRepository.createQueryBuilder().delete().execute();
    }

    const savedInvoices = await this.invoiceRepository.save(invoices);

    // Add invoice items
    const invoiceItems = [
      // Invoice 1 items
      {
        id: "ITEM001",
        invoiceId: "INV001",
        description: "Room Rent - Single AC",
        quantity: 1,
        unitPrice: 8000,
        amount: 8000,
        category: InvoiceItemCategory.ACCOMMODATION,
      },
      {
        id: "ITEM002",
        invoiceId: "INV001",
        description: "Electricity Charges",
        quantity: 1,
        unitPrice: 500,
        amount: 500,
        category: InvoiceItemCategory.UTILITIES,
      },
      // Invoice 2 items
      {
        id: "ITEM003",
        invoiceId: "INV002",
        description: "Room Rent - Double AC",
        quantity: 1,
        unitPrice: 6000,
        amount: 6000,
        category: InvoiceItemCategory.ACCOMMODATION,
      },
      {
        id: "ITEM004",
        invoiceId: "INV002",
        description: "Maintenance Fee",
        quantity: 1,
        unitPrice: 200,
        amount: 200,
        category: InvoiceItemCategory.SERVICES,
      },
      // Invoice 3 items
      {
        id: "ITEM005",
        invoiceId: "INV003",
        description: "Room Rent - Double AC",
        quantity: 1,
        unitPrice: 6000,
        amount: 6000,
        category: InvoiceItemCategory.ACCOMMODATION,
      },
      {
        id: "ITEM006",
        invoiceId: "INV003",
        description: "Maintenance Fee",
        quantity: 1,
        unitPrice: 200,
        amount: 200,
        category: InvoiceItemCategory.SERVICES,
      },
    ];

    const savedItems = await this.invoiceItemRepository.save(invoiceItems);

    this.logger.log(
      `Seeded ${savedInvoices.length} invoices with ${savedItems.length} items`
    );

    return {
      count: savedInvoices.length,
      data: {
        invoices: savedInvoices.length,
        items: savedItems.length,
      },
    };
  }

  async seedPayments(force = false) {
    if (!force && (await this.paymentRepository.count()) > 0) {
      return {
        message: "Payments already exist, use ?force=true to reseed",
        count: 0,
      };
    }

    // Ensure invoices exist
    await this.seedInvoices(force);

    const payments = [
      {
        id: "PAY001",
        studentId: "STU001",
        amount: 8500,
        paymentDate: new Date("2024-07-05"),
        paymentMethod: PaymentMethod.UPI,
        transactionId: "UPI123456789",
        referenceNumber: "REF001",
        status: PaymentStatus.COMPLETED,
        notes: "Payment for July 2024",
        processedBy: "admin",
      },
      {
        id: "PAY002",
        studentId: "STU002",
        amount: 6200,
        paymentDate: new Date("2024-07-03"),
        paymentMethod: PaymentMethod.CASH,
        transactionId: null,
        referenceNumber: "CASH001",
        status: PaymentStatus.COMPLETED,
        notes: "Cash payment for July 2024",
        processedBy: "admin",
      },
      {
        id: "PAY003",
        studentId: "STU003",
        amount: 3000,
        paymentDate: new Date("2024-07-10"),
        paymentMethod: PaymentMethod.BANK_TRANSFER,
        transactionId: "TXN987654321",
        referenceNumber: "NEFT001",
        status: PaymentStatus.COMPLETED,
        notes: "Partial payment for July 2024",
        processedBy: "admin",
        bankName: "State Bank",
      },
    ];

    if (force) {
      await this.paymentRepository.createQueryBuilder().delete().execute();
    }

    const savedPayments = await this.paymentRepository.save(payments);

    this.logger.log(`Seeded ${savedPayments.length} payments`);

    return { count: savedPayments.length, data: savedPayments };
  }

  async seedDiscounts(force = false) {
    if (!force && (await this.discountRepository.count()) > 0) {
      return {
        message: "Discounts already exist, use ?force=true to reseed",
        count: 0,
      };
    }

    // Ensure students and discount types exist
    await this.seedStudents(false);
    await this.seedDiscountTypes(false);

    // Then seed actual discounts
    const discounts = [
      {
        id: "DSC001",
        studentId: "STU001",
        discountTypeId: "DT001",
        amount: 200,
        reason: "Early payment for July 2024",
        notes: "Paid 5 days before due date",
        appliedBy: "admin",
        date: new Date("2024-07-05"),
        status: DiscountStatus.ACTIVE,
        appliedTo: DiscountApplication.LEDGER,
        validFrom: new Date("2024-07-01"),
        validTo: new Date("2024-07-31"),
        isPercentage: false,
        percentageValue: null,
        maxAmount: null,
        referenceId: "INV001",
      },
      {
        id: "DSC002",
        studentId: "STU003",
        discountTypeId: "DT002",
        amount: 600,
        reason: "Financial hardship assistance",
        notes: "Approved by management for financial difficulties",
        appliedBy: "manager",
        date: new Date("2024-07-01"),
        status: DiscountStatus.ACTIVE,
        appliedTo: DiscountApplication.LEDGER,
        validFrom: new Date("2024-07-01"),
        validTo: new Date("2024-12-31"),
        isPercentage: true,
        percentageValue: 10,
        maxAmount: 1000,
        referenceId: "INV003",
      },
    ];

    if (force) {
      await this.discountRepository.createQueryBuilder().delete().execute();
    }

    const savedDiscounts = await this.discountRepository.save(discounts);

    this.logger.log(`Seeded ${savedDiscounts.length} discounts`);

    return {
      count: savedDiscounts.length,
      data: savedDiscounts,
    };
  }

  async seedRoomOccupants(force = false) {
    if (!force && (await this.roomOccupantRepository.count()) > 0) {
      return {
        message: "Room occupants already exist, use ?force=true to reseed",
        count: 0,
      };
    }

    // Ensure students exist
    await this.seedStudents(false);

    const roomOccupants = [
      {
        roomId: "ROOM101",
        studentId: "STU001",
        checkInDate: new Date("2024-01-15"),
        bedNumber: "1",
        status: "Active",
        notes: "Primary occupant",
        assignedBy: "admin",
      },
      {
        roomId: "ROOM301",
        studentId: "STU002",
        checkInDate: new Date("2024-01-20"),
        bedNumber: "1",
        status: "Active",
        notes: "Primary occupant",
        assignedBy: "admin",
      },
      {
        roomId: "ROOM205",
        studentId: "STU003",
        checkInDate: new Date("2024-02-01"),
        bedNumber: "1",
        status: "Active",
        notes: "Primary occupant",
        assignedBy: "admin",
      },
    ];

    if (force) {
      await this.roomOccupantRepository.createQueryBuilder().delete().execute();
    }

    const savedOccupants =
      await this.roomOccupantRepository.save(roomOccupants);

    // Update room occupancy counts
    await this.roomRepository.update("ROOM101", { occupancy: 1 });
    await this.roomRepository.update("ROOM301", { occupancy: 1 });
    await this.roomRepository.update("ROOM205", { occupancy: 1 });

    this.logger.log(`Seeded ${savedOccupants.length} room occupants`);

    return { count: savedOccupants.length, data: savedOccupants };
  }

  async seedDiscountTypes(force = false) {
    if (!force && (await this.discountTypeRepository.count()) > 0) {
      return {
        message: "Discount types already exist, use ?force=true to reseed",
        count: 0,
      };
    }

    const discountTypes = [
      {
        name: "Early Payment Discount",
        category: DiscountCategory.PROMOTIONAL,
        description: "Discount for payments made before due date",
        defaultAmount: 200,
        isPercentage: false,
        percentageValue: null,
        maxAmount: 500,
        requiresApproval: false,
        autoApply: false,
        isActive: true,
      },
      {
        name: "Student Hardship",
        category: DiscountCategory.FINANCIAL_HARDSHIP,
        description: "Financial assistance for students in need",
        defaultAmount: null,
        isPercentage: true,
        percentageValue: 10,
        maxAmount: 1000,
        requiresApproval: true,
        autoApply: false,
        isActive: true,
      },
      {
        name: "Sibling Discount",
        category: DiscountCategory.PROMOTIONAL,
        description: "Discount for students with siblings in the hostel",
        defaultAmount: null,
        isPercentage: true,
        percentageValue: 5,
        maxAmount: 300,
        requiresApproval: false,
        autoApply: true,
        isActive: true,
      },
    ];

    if (force) {
      await this.discountTypeRepository.createQueryBuilder().delete().execute();
    }

    const savedDiscountTypes =
      await this.discountTypeRepository.save(discountTypes);

    this.logger.log(`Seeded ${savedDiscountTypes.length} discount types`);

    return { count: savedDiscountTypes.length, data: savedDiscountTypes };
  }

  async seedPaymentAllocations(force = false) {
    if (!force && (await this.paymentAllocationRepository.count()) > 0) {
      return {
        message: "Payment allocations already exist, use ?force=true to reseed",
        count: 0,
      };
    }

    // Ensure payments and invoices exist
    await this.seedPayments(false);
    await this.seedInvoices(false);

    const paymentAllocations = [
      {
        paymentId: "PAY001",
        invoiceId: "INV001",
        amount: 8500,
        allocationDate: new Date("2024-07-05"),
        notes: "Full payment allocation for July 2024",
        isActive: true,
      },
      {
        paymentId: "PAY002",
        invoiceId: "INV002",
        amount: 6200,
        allocationDate: new Date("2024-07-03"),
        notes: "Full payment allocation for July 2024",
        isActive: true,
      },
      {
        paymentId: "PAY003",
        invoiceId: "INV003",
        amount: 3000,
        allocationDate: new Date("2024-07-10"),
        notes: "Partial payment allocation for July 2024",
        isActive: true,
      },
    ];

    if (force) {
      await this.paymentAllocationRepository
        .createQueryBuilder()
        .delete()
        .execute();
    }

    const savedAllocations =
      await this.paymentAllocationRepository.save(paymentAllocations);

    this.logger.log(`Seeded ${savedAllocations.length} payment allocations`);

    return { count: savedAllocations.length, data: savedAllocations };
  }

  async seedLedgerEntries(force = false) {
    if (!force && (await this.ledgerRepository.count()) > 0) {
      return {
        message: "Ledger entries already exist, use ?force=true to reseed",
        count: 0,
      };
    }

    // Ensure all financial entities exist
    await this.seedInvoices(false);
    await this.seedPayments(false);
    await this.seedDiscounts(false);

    const ledgerEntries = [
      // Student 1 - John Doe ledger entries
      {
        id: "LED001",
        studentId: "STU001",
        type: LedgerEntryType.INVOICE,
        date: new Date("2024-07-01"),
        description: "Monthly rent and utilities - July 2024",
        referenceId: "INV001",
        debit: 8500,
        credit: 0,
        balance: 8500,
        balanceType: BalanceType.DR,
        notes: "Invoice generated for July 2024",
      },
      {
        id: "LED002",
        studentId: "STU001",
        type: LedgerEntryType.PAYMENT,
        date: new Date("2024-07-05"),
        description: "Payment received - July 2024",
        referenceId: "PAY001",
        debit: 0,
        credit: 8500,
        balance: 0,
        balanceType: BalanceType.NIL,
        notes: "Full payment received",
      },
      {
        id: "LED003",
        studentId: "STU001",
        type: LedgerEntryType.DISCOUNT,
        date: new Date("2024-07-05"),
        description: "Early payment discount",
        referenceId: "DSC001",
        debit: 0,
        credit: 200,
        balance: -200,
        balanceType: BalanceType.CR,
        notes: "Early payment discount applied",
      },

      // Student 2 - Jane Smith ledger entries
      {
        id: "LED004",
        studentId: "STU002",
        type: LedgerEntryType.INVOICE,
        date: new Date("2024-07-01"),
        description: "Monthly rent and utilities - July 2024",
        referenceId: "INV002",
        debit: 6200,
        credit: 0,
        balance: 6200,
        balanceType: BalanceType.DR,
        notes: "Invoice generated for July 2024",
      },
      {
        id: "LED005",
        studentId: "STU002",
        type: LedgerEntryType.PAYMENT,
        date: new Date("2024-07-03"),
        description: "Payment received - July 2024",
        referenceId: "PAY002",
        debit: 0,
        credit: 6200,
        balance: 0,
        balanceType: BalanceType.NIL,
        notes: "Full payment received",
      },

      // Student 3 - Mike Johnson ledger entries
      {
        id: "LED006",
        studentId: "STU003",
        type: LedgerEntryType.INVOICE,
        date: new Date("2024-07-01"),
        description: "Monthly rent and utilities - July 2024",
        referenceId: "INV003",
        debit: 6200,
        credit: 0,
        balance: 6200,
        balanceType: BalanceType.DR,
        notes: "Invoice generated for July 2024",
      },
      {
        id: "LED007",
        studentId: "STU003",
        type: LedgerEntryType.PAYMENT,
        date: new Date("2024-07-10"),
        description: "Partial payment received - July 2024",
        referenceId: "PAY003",
        debit: 0,
        credit: 3000,
        balance: 3200,
        balanceType: BalanceType.DR,
        notes: "Partial payment received",
      },
      {
        id: "LED008",
        studentId: "STU003",
        type: LedgerEntryType.DISCOUNT,
        date: new Date("2024-07-01"),
        description: "Financial hardship assistance",
        referenceId: "DSC002",
        debit: 0,
        credit: 600,
        balance: 2600,
        balanceType: BalanceType.DR,
        notes: "Financial hardship discount applied",
      },
    ];

    if (force) {
      await this.ledgerRepository.createQueryBuilder().delete().execute();
    }

    const savedEntries = await this.ledgerRepository.save(ledgerEntries);

    this.logger.log(`Seeded ${savedEntries.length} ledger entries`);

    return { count: savedEntries.length, data: savedEntries };
  }

  async seedBookings(force = false) {
    if (!force && (await this.bookingRepository.count()) > 0) {
      return {
        message: "Booking requests already exist, use ?force=true to reseed",
        count: 0,
      };
    }

    const bookings = [
      {
        id: "BKG001",
        name: "Alice Brown",
        phone: "9876543240",
        email: "alice.brown@email.com",
        guardianName: "Tom Brown",
        guardianPhone: "9876543241",
        preferredRoom: "Single AC",
        course: "Computer Science",
        institution: "Tech University",
        requestDate: new Date("2024-07-15"),
        checkInDate: new Date("2024-08-01"),
        duration: "12 months",
        status: BookingStatus.PENDING,
        notes: "Prefers ground floor room",
        emergencyContact: "9876543241",
        address: "321 Applicant Street, City",
        idProofType: "Aadhar",
        idProofNumber: "123456789014",
        priorityScore: 85,
        source: "website",
      },
      {
        id: "BKG002",
        name: "Bob Wilson",
        phone: "9876543250",
        email: "bob.wilson@email.com",
        guardianName: "Sarah Wilson",
        guardianPhone: "9876543251",
        preferredRoom: "Double AC",
        course: "Mechanical Engineering",
        institution: "Engineering College",
        requestDate: new Date("2024-07-20"),
        checkInDate: new Date("2024-08-15"),
        duration: "10 months",
        status: BookingStatus.APPROVED,
        notes: "Approved for room 102",
        emergencyContact: "9876543251",
        address: "654 Applicant Avenue, City",
        idProofType: "Passport",
        idProofNumber: "P2345678",
        priorityScore: 92,
        source: "referral",
        approvedDate: new Date("2024-07-22"),
        processedBy: "admin",
        assignedRoom: "102",
      },
    ];

    if (force) {
      await this.bookingRepository.createQueryBuilder().delete().execute();
    }

    const savedBookings = await this.bookingRepository.save(bookings);

    this.logger.log(`Seeded ${savedBookings.length} booking requests`);

    return { count: savedBookings.length, data: savedBookings };
  }

  async seedCustomData(seedData: any) {
    this.logger.log("Seeding custom data", seedData);

    const results = {};

    for (const [entityType, data] of Object.entries(seedData)) {
      try {
        switch (entityType) {
          case "students":
            results[entityType] = await this.studentRepository.save(data);
            break;
          case "rooms":
            results[entityType] = await this.roomRepository.save(data);
            break;
          case "invoices":
            results[entityType] = await this.invoiceRepository.save(data);
            break;
          case "payments":
            results[entityType] = await this.paymentRepository.save(data);
            break;
          // Add more cases as needed
          default:
            this.logger.warn(`Unknown entity type: ${entityType}`);
        }
      } catch (error) {
        this.logger.error(`Failed to seed ${entityType}:`, error);
        results[entityType] = { error: error.message };
      }
    }

    return results;
  }

  async clearAllData() {
    this.logger.log("Clearing all seeded data...");

    // Clear in proper order to handle foreign key constraints
    const results: any = {};

    try {
      // Clear child tables first (most dependent entities first)
      results.reports = await this.reportRepository
        .createQueryBuilder()
        .delete()
        .execute();
      results.bookings = await this.bookingRepository
        .createQueryBuilder()
        .delete()
        .execute();
      results.ledgerEntries = await this.ledgerRepository
        .createQueryBuilder()
        .delete()
        .execute();
      results.discounts = await this.discountRepository
        .createQueryBuilder()
        .delete()
        .execute();
      results.paymentAllocations = await this.paymentAllocationRepository
        .createQueryBuilder()
        .delete()
        .execute();
      results.payments = await this.paymentRepository
        .createQueryBuilder()
        .delete()
        .execute();
      results.invoiceItems = await this.invoiceItemRepository
        .createQueryBuilder()
        .delete()
        .execute();
      results.invoices = await this.invoiceRepository
        .createQueryBuilder()
        .delete()
        .execute();
      results.roomOccupants = await this.roomOccupantRepository
        .createQueryBuilder()
        .delete()
        .execute();
      results.studentFinancial = await this.studentFinancialRepository
        .createQueryBuilder()
        .delete()
        .execute();
      results.studentAcademic = await this.studentAcademicRepository
        .createQueryBuilder()
        .delete()
        .execute();
      results.studentContacts = await this.studentContactRepository
        .createQueryBuilder()
        .delete()
        .execute();
      results.students = await this.studentRepository
        .createQueryBuilder()
        .delete()
        .execute();
      results.roomLayouts = await this.roomLayoutRepository
        .createQueryBuilder()
        .delete()
        .execute();
      results.roomAmenities = await this.roomAmenityRepository
        .createQueryBuilder()
        .delete()
        .execute();
      results.rooms = await this.roomRepository
        .createQueryBuilder()
        .delete()
        .execute();
      results.discountTypes = await this.discountTypeRepository
        .createQueryBuilder()
        .delete()
        .execute();
      results.amenities = await this.amenityRepository
        .createQueryBuilder()
        .delete()
        .execute();
      results.roomTypes = await this.roomTypeRepository
        .createQueryBuilder()
        .delete()
        .execute();
      results.buildings = await this.buildingRepository
        .createQueryBuilder()
        .delete()
        .execute();
    } catch (error) {
      this.logger.error("Error clearing data:", error);
      throw error;
    }

    this.logger.log("All data cleared successfully");
    return results;
  }

  async clearEntityData(entityType: string) {
    this.logger.log(`Clearing ${entityType} data...`);

    let result;
    switch (entityType.toLowerCase()) {
      case "students":
        result = await this.studentRepository
          .createQueryBuilder()
          .delete()
          .execute();
        break;
      case "rooms":
        result = await this.roomRepository
          .createQueryBuilder()
          .delete()
          .execute();
        break;
      case "room-occupants":
        result = await this.roomOccupantRepository
          .createQueryBuilder()
          .delete()
          .execute();
        break;
      case "buildings":
        result = await this.buildingRepository
          .createQueryBuilder()
          .delete()
          .execute();
        break;
      case "room-types":
        result = await this.roomTypeRepository
          .createQueryBuilder()
          .delete()
          .execute();
        break;
      case "amenities":
        result = await this.amenityRepository
          .createQueryBuilder()
          .delete()
          .execute();
        break;
      case "invoices":
        result = await this.invoiceRepository
          .createQueryBuilder()
          .delete()
          .execute();
        break;
      case "payments":
        result = await this.paymentRepository
          .createQueryBuilder()
          .delete()
          .execute();
        break;
      case "payment-allocations":
        result = await this.paymentAllocationRepository
          .createQueryBuilder()
          .delete()
          .execute();
        break;
      case "ledger-entries":
        result = await this.ledgerRepository
          .createQueryBuilder()
          .delete()
          .execute();
        break;
      case "discounts":
        result = await this.discountRepository
          .createQueryBuilder()
          .delete()
          .execute();
        break;
      case "discount-types":
        result = await this.discountTypeRepository
          .createQueryBuilder()
          .delete()
          .execute();
        break;
      case "bookings":
        result = await this.bookingRepository
          .createQueryBuilder()
          .delete()
          .execute();
        break;
      case "reports":
        result = await this.reportRepository
          .createQueryBuilder()
          .delete()
          .execute();
        break;
      default:
        throw new Error(`Unknown entity type: ${entityType}`);
    }

    this.logger.log(`${entityType} data cleared successfully`);
    return result;
  }
}
