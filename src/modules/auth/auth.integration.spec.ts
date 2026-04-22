import { DataSource } from "typeorm";
import { AuthService } from "./auth.service";
import { User } from "./user.entity";
import { Patient } from "../patient/patient.entity";
import { BadRequestError } from "../../core/errors/app.errors";
import * as bcrypt from "bcryptjs";
import { Appointment } from "../appointment/appointment.entity";
import { Dentist } from "../dentist/dentist.entity";
import { Surgery } from "../surgery/surgery.entity";
import { Invoice } from "../billing/invoice.entity";
import { describe, it, expect, beforeAll, afterAll } from "@jest/globals";

describe("Integration Test: Authentication Service", () => {
  let testDataSource: DataSource;
  let authService: AuthService;

  beforeAll(async () => {
    testDataSource = new DataSource({
      type: "sqlite",
      database: ":memory:",
      dropSchema: true,
      entities: [User, Patient, Appointment, Dentist, Surgery, Invoice],
      synchronize: true,
      logging: false,
    });

    await testDataSource.initialize();

    authService = new AuthService();
    // @ts-ignore - Map the internal repository to our SQLite test DB
    authService.userRepo = testDataSource.getRepository(User);

    // --- Seed a Test Admin User ---
    const hashedPassword = await bcrypt.hash("SuperSecret123!", 10);

    await testDataSource.getRepository(User).save({
      email: "admin@enterprise.com",
      password: hashedPassword,
      role: "ADMIN",
    });
  });

  afterAll(async () => {
    if (testDataSource.isInitialized) {
      await testDataSource.destroy();
    }
  });

  it("should successfully log in and return a JWT token for valid credentials", async () => {
    const result = await authService.login(
      "admin@enterprise.com",
      "SuperSecret123!",
    );

    expect(result).toBeDefined();
    expect(result.token).toBeDefined();
    expect(result.user.email).toBe("admin@enterprise.com");
  });

  it("should FAIL to log in if the email does not exist", async () => {
    await expect(
      authService.login("ghost@enterprise.com", "SuperSecret123!"),
    ).rejects.toThrow(); // Expecting an "Invalid credentials" error
  });

  it("should FAIL to log in if the password is incorrect", async () => {
    await expect(
      authService.login("admin@enterprise.com", "WrongPassword!"),
    ).rejects.toThrow(); // Expecting an "Invalid credentials" error
  });

  it("should successfully sign up a new patient and create a USER record simultaneously", async () => {
    const newPatientData = {
      firstName: "Clark",
      lastName: "Kent",
      email: "clark@dailyplanet.com",
      password: "StrongPassword123!",
      contactPhone: "555-0000",
    };

    // 1. Run the signup service
    const patient = await authService.signUpPatient(newPatientData);

    // 2. Verify the Patient profile was created
    expect(patient).toBeDefined();
    expect(patient.firstName).toBe("Clark");

    // 3. Verify the User login credentials were created with the PATIENT role!
    const userRepo = testDataSource.getRepository(User);
    const createdUser = await userRepo.findOneBy({
      email: "clark@dailyplanet.com",
    });

    expect(createdUser).toBeDefined();
    expect(createdUser?.role).toBe("PATIENT");
  });

  it("should block sign up if the email is already in use", async () => {
    const duplicateData = {
      firstName: "Evil",
      lastName: "Clark",
      email: "clark@dailyplanet.com", // <-- We just used this email!
      password: "Hacked123!",
    };

    // Expect it to throw our Custom BadRequestError
    await expect(authService.signUpPatient(duplicateData)).rejects.toThrow(
      BadRequestError,
    );
  });
});
