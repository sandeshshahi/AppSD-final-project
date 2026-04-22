import { DataSource } from "typeorm";
import { Surgery } from "./surgery.entity";
import { Appointment } from "../appointment/appointment.entity";
import { Patient } from "../patient/patient.entity";
import { Dentist } from "../dentist/dentist.entity";
import { Invoice } from "../billing/invoice.entity";
import { describe, it, expect, beforeAll, afterAll } from "@jest/globals";

describe("Integration Test: Surgery Entity & Database", () => {
  let testDataSource: DataSource;

  beforeAll(async () => {
    testDataSource = new DataSource({
      type: "sqlite",
      database: ":memory:",
      dropSchema: true,
      entities: [Surgery, Appointment, Patient, Dentist, Invoice],
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

  it("should successfully save and retrieve a valid surgery room", async () => {
    const surgeryRepo = testDataSource.getRepository(Surgery);

    const savedSurgery = await surgeryRepo.save({
      name: "Operating Theater Alpha",
      locationAddress: "100 Main St, 2nd Floor",
      telephoneNumber: "555-0100",
    });

    expect(savedSurgery).toBeDefined();
    expect(savedSurgery.id).toBe(1);
    expect(savedSurgery.name).toBe("Operating Theater Alpha");
  });

  it("should FAIL to save a surgery room if the telephone number is missing", async () => {
    const surgeryRepo = testDataSource.getRepository(Surgery);

    // We expect this to throw an error because telephoneNumber is missing!
    await expect(
      surgeryRepo.save({
        name: "Operating Theater Beta",
        locationAddress: "100 Main St, 3rd Floor",
      }),
    ).rejects.toThrow();
  });
});
