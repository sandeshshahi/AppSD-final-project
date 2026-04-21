import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from "typeorm";
import { Appointment } from "../appointment/appointment.entity";

@Entity("surgeries")
export class Surgery {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: "varchar" })
  name!: string;

  @Column({ type: "varchar" })
  locationAddress!: string;

  @Column({ type: "varchar" })
  telephoneNumber!: string;

  @OneToMany(() => Appointment, (appointment) => appointment.surgery)
  appointments!: Appointment[];
}
