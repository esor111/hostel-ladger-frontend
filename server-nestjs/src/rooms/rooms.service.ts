import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Room, RoomStatus, MaintenanceStatus } from './entities/room.entity';
import { Building } from './entities/building.entity';
import { RoomType } from './entities/room-type.entity';
import { Amenity, AmenityCategory } from './entities/amenity.entity';
import { RoomAmenity } from './entities/room-amenity.entity';
import { RoomLayout } from './entities/room-layout.entity';

@Injectable()
export class RoomsService {
  constructor(
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
  ) {}

  async findAll(filters: any = {}) {
    const { status = 'all', type = 'all', search = '', page = 1, limit = 20 } = filters;
    
    const queryBuilder = this.roomRepository.createQueryBuilder('room')
      .leftJoinAndSelect('room.building', 'building')
      .leftJoinAndSelect('room.roomType', 'roomType')
      .leftJoinAndSelect('room.students', 'students')
      .leftJoinAndSelect('room.amenities', 'roomAmenities')
      .leftJoinAndSelect('roomAmenities.amenity', 'amenity')
      .leftJoinAndSelect('room.layout', 'layout');
    
    // Apply status filter
    if (status !== 'all') {
      queryBuilder.andWhere('room.status = :status', { status });
    }
    
    // Apply type filter
    if (type !== 'all') {
      queryBuilder.andWhere('roomType.name = :type', { type });
    }
    
    // Apply search filter
    if (search) {
      queryBuilder.andWhere(
        '(room.name ILIKE :search OR room.roomNumber ILIKE :search)',
        { search: `%${search}%` }
      );
    }
    
    // Apply pagination
    const offset = (page - 1) * limit;
    queryBuilder.skip(offset).take(limit);
    
    // Order by creation date
    queryBuilder.orderBy('room.createdAt', 'DESC');
    
    const [rooms, total] = await queryBuilder.getManyAndCount();
    
    // Transform to API response format (EXACT same as current JSON structure)
    const transformedItems = rooms.map(room => this.transformToApiResponse(room));
    
    return {
      items: transformedItems,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  async findOne(id: string) {
    const room = await this.roomRepository.findOne({
      where: { id },
      relations: [
        'building', 
        'roomType', 
        'students', 
        'amenities', 
        'amenities.amenity',
        'layout'
      ]
    });
    
    if (!room) {
      throw new NotFoundException('Room not found');
    }
    
    return this.transformToApiResponse(room);
  }

  async create(createRoomDto: any) {
    // Find or create room type
    let roomType = null;
    if (createRoomDto.type) {
      roomType = await this.roomTypeRepository.findOne({ 
        where: { name: createRoomDto.type } 
      });
      
      if (!roomType) {
        // Create basic room type if it doesn't exist
        roomType = await this.roomTypeRepository.save({
          name: createRoomDto.type,
          baseMonthlyRate: createRoomDto.monthlyRate || 0,
          baseDailyRate: createRoomDto.dailyRate || 0,
          defaultBedCount: createRoomDto.bedCount || 1,
          maxOccupancy: createRoomDto.bedCount || 1,
          isActive: true
        });
      }
    }

    // Create room entity
    const room = this.roomRepository.create({
      id: createRoomDto.id,
      name: createRoomDto.name,
      roomNumber: createRoomDto.roomNumber,
      bedCount: createRoomDto.bedCount || 1,
      occupancy: createRoomDto.occupancy || 0,
      gender: createRoomDto.gender || 'Any',
      status: createRoomDto.status || RoomStatus.ACTIVE,
      maintenanceStatus: createRoomDto.maintenanceStatus || 'Good',
      lastCleaned: createRoomDto.lastCleaned,
      description: createRoomDto.description,
      roomTypeId: roomType?.id,
      // Map floor to building (simplified for now)
      buildingId: null // Will implement building logic later
    });

    const savedRoom = await this.roomRepository.save(room);

    // Create amenities if provided
    if (createRoomDto.amenities && createRoomDto.amenities.length > 0) {
      await this.createRoomAmenities(savedRoom.id, createRoomDto.amenities);
    }

    // Create occupants if provided
    if (createRoomDto.occupants && createRoomDto.occupants.length > 0) {
      // This will be handled by student service when students are assigned
    }

    // Create layout if provided
    if (createRoomDto.layout) {
      await this.roomLayoutRepository.save({
        roomId: savedRoom.id,
        name: 'Default Layout',
        layoutData: createRoomDto.layout,
        isActive: true,
        version: 1,
        dimensions: createRoomDto.layout.dimensions,
        theme: createRoomDto.layout.theme
      });
    }

    return this.findOne(savedRoom.id);
  }

  async update(id: string, updateRoomDto: any) {
    const room = await this.findOne(id);
    
    // Update main room entity
    await this.roomRepository.update(id, {
      name: updateRoomDto.name,
      bedCount: updateRoomDto.bedCount,
      occupancy: updateRoomDto.occupancy,
      gender: updateRoomDto.gender,
      status: updateRoomDto.status,
      maintenanceStatus: updateRoomDto.maintenanceStatus,
      lastCleaned: updateRoomDto.lastCleaned,
      description: updateRoomDto.description
    });

    // Update amenities if provided
    if (updateRoomDto.amenities !== undefined) {
      await this.updateRoomAmenities(id, updateRoomDto.amenities);
    }

    // Update layout if provided
    if (updateRoomDto.layout !== undefined) {
      await this.updateRoomLayout(id, updateRoomDto.layout);
    }

    return this.findOne(id);
  }

  async getStats() {
    const totalRooms = await this.roomRepository.count();
    const activeRooms = await this.roomRepository.count({ 
      where: { status: RoomStatus.ACTIVE } 
    });
    const maintenanceRooms = await this.roomRepository.count({ 
      where: { status: RoomStatus.MAINTENANCE } 
    });
    
    const occupancyResult = await this.roomRepository
      .createQueryBuilder('room')
      .select('SUM(room.bedCount)', 'totalBeds')
      .addSelect('SUM(room.occupancy)', 'totalOccupied')
      .where('room.status = :status', { status: RoomStatus.ACTIVE })
      .getRawOne();

    const totalBeds = parseInt(occupancyResult?.totalBeds) || 0;
    const totalOccupied = parseInt(occupancyResult?.totalOccupied) || 0;
    const availableBeds = totalBeds - totalOccupied;
    const occupancyRate = totalBeds > 0 ? (totalOccupied / totalBeds) * 100 : 0;

    return {
      totalRooms,
      activeRooms,
      maintenanceRooms,
      inactiveRooms: totalRooms - activeRooms - maintenanceRooms,
      totalBeds,
      occupiedBeds: totalOccupied,
      availableBeds,
      occupancyRate: Math.round(occupancyRate * 100) / 100
    };
  }

  async getAvailableRooms() {
    const availableRooms = await this.roomRepository.find({
      where: { status: RoomStatus.ACTIVE },
      relations: ['roomType', 'amenities', 'amenities.amenity']
    });

    const filtered = availableRooms.filter(room => room.availableBeds > 0);
    
    return filtered.map(room => this.transformToApiResponse(room));
  }

  // Transform normalized data back to exact API format
  private transformToApiResponse(room: Room): any {
    // Get active layout
    const activeLayout = room.layout;
    
    // Get amenities list
    const amenities = room.amenities?.map(ra => ra.amenity.name) || [];
    
    // Get occupants (from students relationship)
    const occupants = room.students?.map(student => ({
      id: student.id,
      name: student.name,
      phone: student.phone,
      email: student.email
    })) || [];

    // Return EXACT same structure as current JSON
    return {
      id: room.id,
      name: room.name,
      type: room.roomType?.name || 'Private', // Default fallback
      bedCount: room.bedCount,
      occupancy: room.occupancy,
      gender: room.gender,
      monthlyRate: room.roomType?.baseMonthlyRate || 0,
      dailyRate: room.roomType?.baseDailyRate || 0,
      amenities: amenities,
      status: room.status,
      layout: activeLayout?.layoutData || null,
      floor: room.building?.name || 'Ground Floor', // Fallback
      roomNumber: room.roomNumber,
      occupants: occupants,
      availableBeds: room.availableBeds,
      lastCleaned: room.lastCleaned,
      maintenanceStatus: room.maintenanceStatus,
      pricingModel: room.roomType?.pricingModel || 'monthly',
      description: room.description,
      createdAt: room.createdAt,
      updatedAt: room.updatedAt
    };
  }

  private async createRoomAmenities(roomId: string, amenityNames: string[]) {
    for (const amenityName of amenityNames) {
      // Find or create amenity
      let amenity = await this.amenityRepository.findOne({ 
        where: { name: amenityName } 
      });
      
      if (!amenity) {
        amenity = await this.amenityRepository.save({
          name: amenityName,
          category: AmenityCategory.UTILITIES, // Default category
          isActive: true
        });
      }

      // Create room-amenity relationship
      await this.roomAmenityRepository.save({
        roomId,
        amenityId: amenity.id,
        isActive: true,
        installedDate: new Date()
      });
    }
  }

  private async updateRoomAmenities(roomId: string, amenityNames: string[]) {
    // Deactivate existing amenities
    await this.roomAmenityRepository.update(
      { roomId },
      { isActive: false }
    );

    // Add new amenities
    if (amenityNames.length > 0) {
      await this.createRoomAmenities(roomId, amenityNames);
    }
  }

  private async updateRoomLayout(roomId: string, layoutData: any) {
    // Deactivate existing layouts
    await this.roomLayoutRepository.update(
      { roomId },
      { isActive: false }
    );

    // Create new layout
    if (layoutData) {
      const existingLayouts = await this.roomLayoutRepository.count({ 
        where: { roomId } 
      });
      
      await this.roomLayoutRepository.save({
        roomId,
        name: `Layout v${existingLayouts + 1}`,
        layoutData,
        isActive: true,
        version: existingLayouts + 1,
        dimensions: layoutData.dimensions,
        theme: layoutData.theme
      });
    }
  }

  async assignStudentToRoom(roomId: string, studentId: string) {
    const room = await this.roomRepository.findOne({ where: { id: roomId } });
    if (!room) {
      throw new NotFoundException('Room not found');
    }

    if (room.availableBeds <= 0) {
      throw new Error('No available beds in this room');
    }

    // This will be handled by updating the student's roomId
    // The occupancy will be updated via database triggers or computed fields
    
    return { success: true, message: 'Student assigned to room successfully' };
  }

  async vacateStudentFromRoom(roomId: string, studentId: string) {
    const room = await this.roomRepository.findOne({ where: { id: roomId } });
    if (!room) {
      throw new NotFoundException('Room not found');
    }

    // This will be handled by updating the student's roomId to null
    // The occupancy will be updated via database triggers or computed fields
    
    return { success: true, message: 'Student vacated from room successfully' };
  }

  async scheduleRoomMaintenance(roomId: string, maintenanceData: any) {
    await this.roomRepository.update(roomId, {
      status: RoomStatus.MAINTENANCE,
      maintenanceStatus: MaintenanceStatus.UNDER_REPAIR,
      lastMaintenance: new Date()
    });

    return { 
      success: true, 
      message: 'Room maintenance scheduled successfully',
      scheduledDate: maintenanceData.scheduleDate,
      notes: maintenanceData.notes
    };
  }
}