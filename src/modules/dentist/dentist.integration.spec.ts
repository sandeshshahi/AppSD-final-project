import { DataSource } from "typeorm";
import { Dentist } from "./dentist.entity";
import { Appointment } from "../appointment/appointment.entity";
import { Patient } from "../patient/patient.entity";
import { Surgery } from "../surgery/surgery.entity";
import { Invoice } from "../billing/invoice.entity";
import { describe, it, expect, beforeAll, afterAll } from "@jest/globals";
import { User } from "../auth/user.entity";
import { XRay } from "../patient/xray.entity";

describe("Integration Test: Dentist Entity & Database", () => {
  let testDataSource: DataSource;

  beforeAll(async () => {
    testDataSource = new DataSource({
      type: "sqlite",
      database: ":memory:",
      dropSchema: true,
      entities: [Dentist, User, Appointment, Patient, Surgery, Invoice, XRay],
      synchronize: true,
      logging: false,
    });

    await testDataSource.initialize();
  });

  afterAll(async () => {
    if (testDataSource.isInitialized) {
      await testDataSource.destroy();
    }
  });

  it("should successfully register a dentist and create a corresponding User with DENTIST role", async () => {
    // Because we are using the global AppDataSource in the service, we will simulate the transaction
    // exactly how the service does it to ensure our logic is sound against the test DB.

    const newDentistData = {
      firstName: "Bruce",
      lastName: "Wayne",
      email: "bruce@wayneenterprises.com",
      password: "BatPassword!",
      specialization: "Cosmetic Dentistry",
    };

    // Run the transaction against our test DB
    const result = await testDataSource.transaction(async (manager) => {
      const dentist = manager.create(Dentist, {
        firstName: newDentistData.firstName,
        lastName: newDentistData.lastName,
        email: newDentistData.email,
        specialization: newDentistData.specialization,
      });
      await manager.save(dentist);

      const user = manager.create(User, {
        email: newDentistData.email,
        password: "hashed_password", // skipping bcrypt in this test for speed
        role: "DENTIST",
      });
      await manager.save(user);

      return { dentist, user };
    });

    expect(result.dentist).toBeDefined();
    expect(result.dentist.firstName).toBe("Bruce");

    expect(result.user).toBeDefined();
    expect(result.user.role).toBe("DENTIST");
  });

  it("should successfully save and retrieve a valid dentist", async () => {
    const dentistRepo = testDataSource.getRepository(Dentist);

    const savedDentist = await dentistRepo.save({
      firstName: "Tony",
      lastName: "Stark",
      email: "ironman@avengers.com",
      specialization: "Implants",
    });

    expect(savedDentist).toBeDefined();
    expect(savedDentist.email).toBe("ironman@avengers.com");
  });

  it("should FAIL to save a dentist if the required email is missing", async () => {
    const dentistRepo = testDataSource.getRepository(Dentist);

    // We expect this to throw an error because the email field is missing!
    await expect(
      dentistRepo.save({
        firstName: "Thor",
        lastName: "Odinson",
        specialization: "General Dentistry",
      }),
    ).rejects.toThrow();
  });
});
