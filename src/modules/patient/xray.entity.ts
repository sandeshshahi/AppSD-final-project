import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from "typeorm";
import { Patient } from "./patient.entity";
import { CreateDateColumn } from "typeorm";

@Entity("xrays")
export class XRay {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: "varchar" })
  imageUrl!: string;

  @Column({ type: "varchar" })
  publicId!: string; // Cloudinary's reference to delete it later

  @CreateDateColumn()
  uploadedAt!: Date;

  @Column({ type: "text", nullable: true })
  description?: string;

  @ManyToOne(() => Patient, (patient) => patient.xrays, { onDelete: "CASCADE" })
  patient!: Patient;
}
