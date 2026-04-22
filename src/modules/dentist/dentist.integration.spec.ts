import { DataSource } from "typeorm";
import { Dentist } from "./dentist.entity";
import { Appointment } from "../appointment/appointment.entity";
import { Patient } from "../patient/patient.entity";
import { Surgery } from "../surgery/surgery.entity";
import { Invoice } from "../billing/invoice.entity";
import { describe, it, expect, beforeAll, afterAll } from "@jest/globals";

describe("Integration Test: Dentist Entity & Database", () => {
  let testDataSource: DataSource;

  beforeAll(async () => {
    testDataSource = new DataSource({
      type: "sqlite",
      database: ":memory:",
      dropSchema: true,
      entities: [Dentist, Appointment, Patient, Surgery, Invoice],
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

  it("should successfully save and retrieve a valid dentist", async () => {
    const dentistRepo = testDataSource.getRepository(Dentist);

    const savedDentist = await dentistRepo.save({
      firstName: "Tony",
      lastName: "Stark",
      email: "ironman@avengers.com",
      specialization: "Implants",
    });

    expect(savedDentist).toBeDefined();
    expect(savedDentist.id).toBe(1);
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
