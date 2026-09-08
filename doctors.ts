import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { Department } from '../../departments/entities/department.entity';

@Entity()
export class Doctor {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  specialization: string;

  @ManyToOne(() => Department, {
    nullable: false,
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'department_id' })
  department: Department;
}



import { IsInt, IsNotEmpty, IsString } from 'class-validator';

export class CreateDoctorDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  specialization: string;

  @IsInt()
  departmentId: number;
}


import { PartialType } from '@nestjs/mapped-types';
import { CreateDoctorDto } from './create-doctor.dto';

export class UpdateDoctorDto extends PartialType(CreateDoctorDto) {}


import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Doctor } from './entities/doctor.entity';
import { Department } from '../departments/entities/department.entity';

import { CreateDoctorDto } from './dto/create-doctor.dto';
import { UpdateDoctorDto } from './dto/update-doctor.dto';

@Injectable()
export class DoctorsService {
  constructor(
    @InjectRepository(Doctor)
    private readonly doctorRepository: Repository<Doctor>,

    @InjectRepository(Department)
    private readonly departmentRepository: Repository<Department>,
  ) {}

  async create(createDoctorDto: CreateDoctorDto) {
    const { departmentId, ...doctorData } = createDoctorDto;

    const department = await this.departmentRepository.findOne({
      where: { id: departmentId },
    });

    if (!department) {
      throw new NotFoundException('Department not found');
    }

    const doctor = this.doctorRepository.create({
      ...doctorData,
      department,
    });

    return await this.doctorRepository.save(doctor);
  }

  async findAll() {
    return await this.doctorRepository.find({
      relations: {
        department: true,
      },
      order: {
        id: 'ASC',
      },
    });
  }

  async findOne(id: number) {
    const doctor = await this.doctorRepository.findOne({
      where: { id },
      relations: {
        department: true,
      },
    });

    if (!doctor) {
      throw new NotFoundException('Doctor not found');
    }

    return doctor;
  }

  async update(id: number, updateDoctorDto: UpdateDoctorDto) {
    const doctor = await this.findOne(id);

    const { departmentId, ...doctorData } = updateDoctorDto;

    if (departmentId !== undefined) {
      const department = await this.departmentRepository.findOne({
        where: { id: departmentId },
      });

      if (!department) {
        throw new NotFoundException('Department not found');
      }

      doctor.department = department;
    }

    Object.assign(doctor, doctorData);

    return await this.doctorRepository.save(doctor);
  }

  async remove(id: number) {
    const doctor = await this.findOne(id);

    await this.doctorRepository.remove(doctor);

    return {
      message: 'Doctor deleted successfully',
    };
  }
}




import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
} from '@nestjs/common';

import { DoctorsService } from './doctors.service';

import { CreateDoctorDto } from './dto/create-doctor.dto';
import { UpdateDoctorDto } from './dto/update-doctor.dto';

@Controller('doctors')
export class DoctorsController {
  constructor(private readonly doctorsService: DoctorsService) {}

  @Post()
  create(@Body() createDoctorDto: CreateDoctorDto) {
    return this.doctorsService.create(createDoctorDto);
  }

  @Get()
  findAll() {
    return this.doctorsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.doctorsService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDoctorDto: UpdateDoctorDto,
  ) {
    return this.doctorsService.update(id, updateDoctorDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.doctorsService.remove(id);
  }
}


import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Doctor } from './entities/doctor.entity';
import { Department } from '../departments/entities/department.entity';

import { DoctorsController } from './doctors.controller';
import { DoctorsService } from './doctors.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Doctor,
      Department,
    ]),
  ],
  controllers: [DoctorsController],
  providers: [DoctorsService],
})
export class DoctorsModule {}