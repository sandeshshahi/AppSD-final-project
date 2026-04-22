import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  CreateDateColumn,
} from "typeorm";
import { Appointment } from "../appointment/appointment.entity";
import { Invoice } from "../billing/invoice.entity";
import { XRay } from "./xray.entity";

// Embedded Class: This stores address fields directly in the Patient table
export class Address {
  @Column({ type: "varchar", nullable: true })
  street!: string;

  @Column({ type: "varchar", nullable: true })
  city!: string;

  @Column({ type: "varchar", length: 20, nullable: true })
  zipCode!: string;
}

@Entity("patients")
export class Patient {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: "varchar", length: 100 })
  firstName!: string;

  @Column({ type: "varchar", length: 100 })
  lastName!: string;

  @Column({ type: "varchar", length: 20, nullable: true })
  contactPhone!: string;

  @Column({ type: "varchar", length: 100, unique: true })
  email!: string;

  @Column({ type: "date", nullable: true })
  dateOfBirth!: string;

  // Replaces the standalone Address table for cleaner enterprise mapping
  @Column(() => Address)
  address!: Address;

  @OneToMany(() => Appointment, (appointment) => appointment.patient)
  appointments!: Appointment[];

  @OneToMany(() => Invoice, (invoice) => invoice.patient)
  invoices!: Invoice[];

  @CreateDateColumn()
  createdAt!: Date;

  @OneToMany(() => XRay, (xray) => xray.patient)
  xrays!: XRay[];
}
