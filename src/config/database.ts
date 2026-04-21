import { DataSource } from "typeorm";
import "dotenv/config"; // Load the .env file

// Import all entities
import { Patient } from "../modules/patient/patient.entity";
import { Dentist } from "../modules/dentist/dentist.entity";
import { Surgery } from "../modules/surgery/surgery.entity";
import { Appointment } from "../modules/appointment/appointment.entity";
import { Invoice } from "../modules/billing/invoice.entity";
import { User } from "../modules/auth/user.entity";

export const AppDataSource = new DataSource({
  type: "mysql",
  host: process.env.DB_HOST || "localhost",
  port: parseInt(process.env.DB_PORT || "3306"),
  username: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "adv_dental_surgeries",
  synchronize: true, // ⚠️ Auto-creates/updates tables based on entities!
  logging: false,
  entities: [User, Patient, Dentist, Surgery, Appointment, Invoice],
});
