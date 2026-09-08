import {
  Column,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { Doctor } from '../../doctors/entities/doctor.entity';

@Entity()
export class Department {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  name: string;

  @OneToMany(() => Doctor, (doctor) => doctor.department)
  doctors: Doctor[];
}


import {
  Column,
  Entity,
  JoinColumn,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { Department } from '../../departments/entities/department.entity';
import { Appointment } from '../../appointments/entities/appointment.entity';
import { Patient } from '../../patients/entities/patient.entity';

@Entity()
export class Doctor {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  specialization: string;

  // Department 1 : N Doctor
  @ManyToOne(() => Department, {
    nullable: false,
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'department_id' })
  department: Department;

  // Doctor 1 : N Appointment
  @OneToMany(
    () => Appointment,
    (appointment) => appointment.doctor,
  )
  appointments: Appointment[];

  // Doctor N : N Patient
  @ManyToMany(() => Patient, (patient) => patient.doctors)
  @JoinTable({
    name: 'doctor_patient',
    joinColumn: {
      name: 'doctor_id',
      referencedColumnName: 'id',
    },
    inverseJoinColumn: {
      name: 'patient_id',
      referencedColumnName: 'id',
    },
  })
  patients: Patient[];
}


import {
  Column,
  Entity,
  ManyToMany,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { Appointment } from '../../appointments/entities/appointment.entity';
import { Doctor } from '../../doctors/entities/doctor.entity';

@Entity()
export class Patient {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ unique: true })
  email: string;

  @Column()
  phone: string;

  // Patient 1 : N Appointment
  @OneToMany(
    () => Appointment,
    (appointment) => appointment.patient,
  )
  appointments: Appointment[];

  // Patient N : N Doctor
  @ManyToMany(() => Doctor, (doctor) => doctor.patients)
  doctors: Doctor[];
}


import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { Doctor } from '../../doctors/entities/doctor.entity';
import { Patient } from '../../patients/entities/patient.entity';

@Entity()
export class Appointment {
  @PrimaryGeneratedColumn()
  id: number;

  // Appointment N : 1 Doctor
  @ManyToOne(() => Doctor, {
    nullable: false,
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'doctor_id' })
  doctor: Doctor;

  // Appointment N : 1 Patient
  @ManyToOne(() => Patient, {
    nullable: false,
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'patient_id' })
  patient: Patient;

  @Column({ type: 'date' })
  appointmentDate: string;

  @Column()
  reason: string;
}


@ManyToMany(() => Patient, (patient) => patient.doctors)
@JoinTable({
  name: 'doctor_patient',
  joinColumn: {
    name: 'doctor_id',
    referencedColumnName: 'id',
  },
  inverseJoinColumn: {
    name: 'patient_id',
    referencedColumnName: 'id',
  },
})
patients: Patient[];