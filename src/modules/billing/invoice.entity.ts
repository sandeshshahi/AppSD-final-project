import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  OneToOne,
  CreateDateColumn,
} from "typeorm";
import { Patient } from "../patient/patient.entity";
import { Appointment } from "../appointment/appointment.entity";

@Entity("invoices")
export class Invoice {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: "decimal", precision: 10, scale: 2 })
  amount!: number;

  @Column({ type: "varchar", default: "UNPAID" }) // UNPAID, PAID, VOID
  status!: string;

  @CreateDateColumn()
  issueDate!: Date;

  @ManyToOne(() => Patient, (patient) => patient.invoices, {
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "patient_id" })
  patient!: Patient;

  @OneToOne(() => Appointment, (appointment) => appointment.invoice, {
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "appointment_id" })
  appointment!: Appointment;
}
