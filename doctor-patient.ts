import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Doctor } from '../doctors/entities/doctor.entity';
import { Patient } from '../patients/entities/patient.entity';

@Injectable()
export class DoctorPatientsService {
  constructor(
    @InjectRepository(Doctor)
    private readonly doctorRepository: Repository<Doctor>,

    @InjectRepository(Patient)
    private readonly patientRepository: Repository<Patient>,
  ) {}

  async assignPatient(
    doctorId: number,
    patientId: number,
  ) {
    const doctor = await this.doctorRepository.findOne({
      where: { id: doctorId },
      relations: {
        patients: true,
      },
    });

    if (!doctor) {
      throw new NotFoundException('Doctor not found');
    }

    const patient = await this.patientRepository.findOne({
      where: { id: patientId },
    });

    if (!patient) {
      throw new NotFoundException('Patient not found');
    }

    const alreadyAssigned = doctor.patients.some(
      (item) => item.id === patientId,
    );

    if (alreadyAssigned) {
      throw new ConflictException(
        'Patient is already assigned to this doctor',
      );
    }

    doctor.patients.push(patient);

    await this.doctorRepository.save(doctor);

    return {
      message: 'Patient assigned to doctor successfully',
    };
  }

  async getDoctorPatients(doctorId: number) {
    const doctor = await this.doctorRepository.findOne({
      where: { id: doctorId },
      relations: {
        patients: true,
      },
    });

    if (!doctor) {
      throw new NotFoundException('Doctor not found');
    }

    return doctor.patients;
  }

  async getPatientDoctors(patientId: number) {
    const patient = await this.patientRepository.findOne({
      where: { id: patientId },
      relations: {
        doctors: true,
      },
    });

    if (!patient) {
      throw new NotFoundException('Patient not found');
    }

    return patient.doctors;
  }

  async removePatient(
    doctorId: number,
    patientId: number,
  ) {
    const doctor = await this.doctorRepository.findOne({
      where: { id: doctorId },
      relations: {
        patients: true,
      },
    });

    if (!doctor) {
      throw new NotFoundException('Doctor not found');
    }

    const patientExists = doctor.patients.some(
      (patient) => patient.id === patientId,
    );

    if (!patientExists) {
      throw new NotFoundException(
        'Patient is not assigned to this doctor',
      );
    }

    doctor.patients = doctor.patients.filter(
      (patient) => patient.id !== patientId,
    );

    await this.doctorRepository.save(doctor);

    return {
      message: 'Patient removed from doctor successfully',
    };
  }
}


import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Doctor } from '../doctors/entities/doctor.entity';
import { Patient } from '../patients/entities/patient.entity';

import { DoctorPatientsController } from './doctor-patients.controller';
import { DoctorPatientsService } from './doctor-patients.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Doctor,
      Patient,
    ]),
  ],
  controllers: [DoctorPatientsController],
  providers: [DoctorPatientsService],
})
export class DoctorPatientsModule {}