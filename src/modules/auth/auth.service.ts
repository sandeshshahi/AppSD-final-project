import { AppDataSource } from "../../config/database";
import { User } from "./user.entity";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import {
  BadRequestError,
  InvalidCredentialsError,
} from "../../core/errors/app.errors";
import { Patient } from "../patient/patient.entity";

export class AuthService {
  private userRepo = AppDataSource.getRepository(User);

  // Helper method to create a test Office Manager if the DB is empty
  async seedAdmin() {
    const adminExists = await this.userRepo.findOneBy({
      email: "admin@ads.com",
    });
    if (!adminExists) {
      const hashedPassword = await bcrypt.hash("admin123", 10);
      const admin = this.userRepo.create({
        email: "admin@ads.com",
        password: hashedPassword,
        role: "OFFICE_MANAGER",
      });
      await this.userRepo.save(admin);
      console.log("Default Office Manager created: admin@ads.com / admin123");
    }
  }

  async signUpPatient(data: any) {
    const existingUser = await this.userRepo.findOneBy({ email: data.email });
    if (existingUser)
      throw new BadRequestError("A user with this email already exists.");

    return await this.userRepo.manager.transaction(async (manager) => {
      // Create the Patient (Medical Profile)
      const patient = manager.create(Patient, {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        contactPhone: data.contactPhone,
      });
      await manager.save(patient);

      // Create the User (Auth Credentials)
      const hashedPassword = await bcrypt.hash(data.password, 10);
      const user = manager.create(User, {
        email: data.email,
        password: hashedPassword,
        role: "PATIENT", // Force the role to PATIENT for public signups
      });
      await manager.save(user);

      return patient;
    });
  }

  async login(email: string, password: string) {
    const user = await this.userRepo.findOneBy({ email });

    if (!user) throw new InvalidCredentialsError();

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) throw new InvalidCredentialsError();

    // Generate the Token!
    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET || "fallback_secret",
      { expiresIn: "24h" },
    );

    return { token, user };
  }
}
