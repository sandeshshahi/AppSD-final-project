import { DataSource } from "typeorm";
import { PatientService } from "./patient.service";
import { Patient, Address } from "./patient.entity";
import { Appointment } from "../appointment/appointment.entity";
import { Invoice } from "../billing/invoice.entity";
import { Dentist } from "../dentist/dentist.entity";
import { Surgery } from "../surgery/surgery.entity";
import { describe, it, expect, beforeAll, afterAll } from "@jest/globals";

describe("Integration Test: Patient Service & Database", () => {
  let testDataSource: DataSource;
  let patientService: PatientService;

  // BEFORE ALL TESTS: Spin up a fake SQLite Database in memory!
  beforeAll(async () => {
    testDataSource = new DataSource({
      type: "sqlite",
      database: ":memory:", // Only exists in RAM!
      dropSchema: true,
      entities: [Patient, Appointment, Invoice, Dentist, Surgery],
      synchronize: true,
      logging: false,
    });

    await testDataSource.initialize();

    // We explicitly pass our test database repository to the service
    patientService = new PatientService();
    // @ts-ignore - overriding private repo for testing purposes
    patientService.patientRepo = testDataSource.getRepository(Patient);
  });

  // AFTER ALL TESTS: Destroy the database so it doesn't leak memory
  afterAll(async () => {
    if (testDataSource.isInitialized) {
      await testDataSource.destroy();
    }
  });

  it("should successfully save and retrieve a patient from the database", async () => {
    // Arrange & Act: Register a patient
    const savedPatient = await patientService.registerPatient({
      firstName: "Clark",
      lastName: "Kent",
      email: "clark@dailyplanet.com",
      address: { city: "Metropolis" },
    });

    // Act: Try to fetch all patients from the DB
    const allPatients = await patientService.getAllPatients();

    // Assert: Verify the database actually stored and returned the data!
    expect(savedPatient).toBeDefined();
    expect(savedPatient.id).toBe(1);
    expect(allPatients.length).toBe(1);
    expect(allPatients[0].firstName).toBe("Clark");
    expect(allPatients[0].email).toBe("clark@dailyplanet.com");
  });
});
