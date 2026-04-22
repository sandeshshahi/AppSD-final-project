import { DataSource } from "typeorm";
import { AppDataSource } from "../../config/database";
import { PatientService } from "./patient.service";
import { patientResolvers } from "./patient.resolver";
import { Patient } from "./patient.entity";
import { XRay } from "./xray.entity";
import { User } from "../auth/user.entity";
import { ForbiddenError } from "../../core/errors/app.errors";
import { describe, it, expect, beforeAll, afterAll, jest } from "@jest/globals";
import { Appointment } from "../appointment/appointment.entity";
import { Dentist } from "../dentist/dentist.entity";
import { Surgery } from "../surgery/surgery.entity";
import { Invoice } from "../billing/invoice.entity";

// Mock Cloudinary
jest.mock("../../core/utils/cloudinary", () => ({
  uploadToCloudinary: jest.fn().mockImplementation(async () => ({
    secure_url: "https://res.cloudinary.com/demo/image/upload/mock_xray.png",
    public_id: "mock_xray_123",
  })),
}));

describe("X-Ray Feature & Security Integration", () => {
  let testPatient: Patient;
  let otherPatient: Patient;
  let testDataSource: DataSource;

  //   Create unique emails for every test run
  const bruceEmail = `bruce_${Date.now()}@wayne.com`;
  const clarkEmail = `clark_${Date.now()}@dailyplanet.com`;

  beforeAll(async () => {
    // Create an isolated, in-memory database for this test
    testDataSource = new DataSource({
      type: "sqlite",
      database: ":memory:",
      entities: [Patient, XRay, User, Appointment, Dentist, Surgery, Invoice],
      synchronize: true,
    });
    // Initialize the real (or test) database connection
    await testDataSource.initialize();
    await AppDataSource.initialize();

    // Ensure we are using whichever repo your test is currently set up for
    const patientRepo = AppDataSource.getRepository(Patient);

    await patientRepo.delete({ email: "bruce@wayne.com" });
    await patientRepo.delete({ email: "clark@dailyplanet.com" });

    // Seed Test Patients
    testPatient = await patientRepo.save({
      firstName: "Bruce",
      lastName: "Wayne",
      email: "bruce@wayne.com",
    });

    otherPatient = await patientRepo.save({
      firstName: "Clark",
      lastName: "Kent",
      email: "clark@dailyplanet.com",
    });
  });

  afterAll(async () => {
    const patientRepo = AppDataSource.getRepository(Patient);

    // Clean up the database so it's ready for next time
    await patientRepo.delete({ email: "bruce@wayne.com" });
    await patientRepo.delete({ email: "clark@dailyplanet.com" });
    // Clean up database after tests are done
    await AppDataSource.destroy();
  });

  describe("Mutation: uploadXRay", () => {
    it("should allow a DENTIST to upload an X-Ray", async () => {
      const mockContext = { user: { role: "DENTIST" } };

      const result = await patientResolvers.Mutation.uploadXRay(
        null,
        {
          patientId: testPatient.id,
          base64Image: "data:image/png;base64,mockdata",
          description: "Test X-Ray",
        },
        mockContext,
      );

      expect(result).toBeDefined();
      expect(result.imageUrl).toBe(
        "https://res.cloudinary.com/demo/image/upload/mock_xray.png",
      );
      expect(result.description).toBe("Test X-Ray");
    });

    it("should BLOCK a PATIENT from uploading an X-Ray", async () => {
      const mockContext = { user: { role: "PATIENT", email: bruceEmail } };

      await expect(
        patientResolvers.Mutation.uploadXRay(
          null,
          {
            patientId: testPatient.id,
            base64Image: "mock",
            description: "Test",
          },
          mockContext,
        ),
      ).rejects.toThrow(ForbiddenError);
    });
  });

  describe("Query: getPatientXRays", () => {
    it("should allow a PATIENT to view their OWN X-Rays", async () => {
      // The context email matches testPatient's email
      const mockContext = {
        user: { role: "PATIENT", email: "bruce@wayne.com" },
      };

      const result = await patientResolvers.Query.getPatientXRays(
        null,
        { patientId: testPatient.id },
        mockContext,
      );

      // Should return an array (even if empty, it shouldn't throw an error)
      expect(Array.isArray(result)).toBe(true);
    });

    it("should BLOCK a PATIENT from viewing ANOTHER patient's X-Rays", async () => {
      // Bruce is logged in, but tries to look at Clark's ID
      const mockContext = {
        user: { role: "PATIENT", email: "bruce@wayne.com" },
      };

      await expect(
        patientResolvers.Query.getPatientXRays(
          null,
          { patientId: otherPatient.id }, // Requesting Clark's ID!
          mockContext,
        ),
      ).rejects.toThrow(ForbiddenError);
    });

    it("should allow an OFFICE_MANAGER to view ANY patient's X-Rays", async () => {
      const mockContext = { user: { role: "OFFICE_MANAGER" } };

      const result = await patientResolvers.Query.getPatientXRays(
        null,
        { patientId: otherPatient.id },
        mockContext,
      );

      expect(Array.isArray(result)).toBe(true);
    });
  });
});
