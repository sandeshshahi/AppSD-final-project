import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from "typeorm";
import { Patient } from "./patient.entity";

@Entity("xrays")
export class XRay {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: "varchar" })
  imageUrl!: string;

  @Column({ type: "varchar" })
  publicId!: string; // Cloudinary's reference to delete it later

  @Column({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
  uploadedAt!: Date;

  @Column({ type: "text", nullable: true })
  description?: string;

  @ManyToOne(() => Patient, (patient) => patient.xrays, { onDelete: "CASCADE" })
  patient!: Patient;
}
