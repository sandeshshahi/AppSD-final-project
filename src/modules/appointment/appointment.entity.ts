import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  OneToOne,
} from "typeorm";
import { Patient } from "../patient/patient.entity";
import { Dentist } from "../dentist/dentist.entity";
import { Surgery } from "../surgery/surgery.entity";
import { Invoice } from "../billing/invoice.entity";

@Entity("appointments")
export class Appointment {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: "date" })
  appointmentDate!: string;

  @Column({ type: "time" })
  appointmentTime!: string;

  @Column({ type: "varchar", default: "BOOKED" }) // BOOKED, CANCELLED, COMPLETED
  status!: string;

  @ManyToOne(() => Patient, (patient) => patient.appointments, {
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "patient_id" })
  patient!: Patient;

  @ManyToOne(() => Dentist, (dentist) => dentist.appointments)
  @JoinColumn({ name: "dentist_id" })
  dentist!: Dentist;

  @ManyToOne(() => Surgery, (surgery) => surgery.appointments)
  @JoinColumn({ name: "surgery_id" })
  surgery!: Surgery;

  @OneToOne(() => Invoice, (invoice) => invoice.appointment, { cascade: true })
  invoice!: Invoice;
}
