import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from "typeorm";
import { Appointment } from "../appointment/appointment.entity";

@Entity("dentists")
export class Dentist {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: "varchar" })
  firstName!: string;

  @Column({ type: "varchar" })
  lastName!: string;

  @Column({ type: "varchar", unique: true })
  email!: string;

  @Column({ type: "varchar" })
  specialization!: string;

  @OneToMany(() => Appointment, (appointment) => appointment.dentist)
  appointments!: Appointment[];
}
