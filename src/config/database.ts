import { DataSource } from "typeorm";
import "dotenv/config"; // Load the .env file
// entities
import { Patient } from "../modules/patient/patient.entity";
import { Dentist } from "../modules/dentist/dentist.entity";
import { Surgery } from "../modules/surgery/surgery.entity";
import { Appointment } from "../modules/appointment/appointment.entity";
import { Invoice } from "../modules/billing/invoice.entity";
import { User } from "../modules/auth/user.entity";
import { XRay } from "../modules/patient/xray.entity";

// Check if we have a cloud database URL provided by Render
const isProduction = !!process.env.DATABASE_URL;

export const AppDataSource = new DataSource({
  // If in cloud, use postgres. If local, use mysql.
  type: isProduction ? "postgres" : "mysql",

  // The cloud database URL
  url: process.env.DATABASE_URL,

  // Local fallback credentials
  host: isProduction ? undefined : process.env.DB_HOST || "localhost",
  port: isProduction ? undefined : parseInt(process.env.DB_PORT || "3306"),
  username: isProduction ? undefined : process.env.DB_USER || "root",
  password: isProduction ? undefined : process.env.DB_PASSWORD || "",
  database: isProduction
    ? undefined
    : process.env.DB_NAME || "adv_dental_surgeries",

  synchronize: true, // ⚠️ Auto-creates/updates tables based on entities!
  logging: false,
  entities: [User, Patient, Dentist, Surgery, Appointment, Invoice, XRay],

  // Required for some cloud databases to connect securely
  ssl: isProduction ? { rejectUnauthorized: false } : false,
});
