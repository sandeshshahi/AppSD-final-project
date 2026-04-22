// MOCK INTERCEPTOR
jest.mock("../../config/database", () => {
  const { DataSource } = require("typeorm");
  return {
    AppDataSource: new DataSource({
      type: "sqlite",
      database: ":memory:",
      synchronize: true,
      entities: [
        require("./patient.entity").Patient,
        require("./xray.entity").XRay,
        require("../auth/user.entity").User,
        require("../appointment/appointment.entity").Appointment,
        require("../dentist/dentist.entity").Dentist,
        require("../surgery/surgery.entity").Surgery,
        require("../billing/invoice.entity").Invoice,
      ],
    }),
  };
});

// Mock Cloudinary API
jest.mock("../../core/utils/cloudinary", () => ({
  uploadToCloudinary: jest.fn().mockImplementation(async () => ({
    secure_url: "https://res.cloudinary.com/demo/image/upload/mock_xray.png",
    public_id: "mock_xray_123",
  })),
}));

import { AppDataSource } from "../../config/database";
import { patientResolvers } from "./patient.resolver";
import { Patient } from "./patient.entity";
import { ForbiddenError } from "../../core/errors/app.errors";
import { describe, it, expect, beforeAll, afterAll, jest } from "@jest/globals";

describe("X-Ray Feature & Security Integration", () => {
  let testPatient: Patient;
  let otherPatient: Patient;

  beforeAll(async () => {
    // // THE CI FIX: Dynamically convert the MySQL config to an in-memory SQLite config
    // const dbOptions = AppDataSource.options as any;
    // dbOptions.type = "sqlite";
    // dbOptions.database = ":memory:";
    // dbOptions.synchronize = true;

    // Initialize the REAL database to perfectly match how your app runs
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
    }

    const patientRepo = AppDataSource.getRepository(Patient);

    // Create ultra-randomized emails to absolutely prevent "Duplicate Entry" MySQL errors
    const randomSuffix = Math.random().toString(36).substring(7);
    const bruceEmail = `bruce_${Date.now()}_${randomSuffix}@wayne.com`;
    const clarkEmail = `clark_${Date.now()}_${randomSuffix}@dailyplanet.com`;

    // Save the test records
    testPatient = await patientRepo.save({
      firstName: "Bruce",
      lastName: "Wayne",
      email: bruceEmail,
    });

    otherPatient = await patientRepo.save({
      firstName: "Clark",
      lastName: "Kent",
      email: clarkEmail,
    });
  });

  afterAll(async () => {
    // Clean up the real database so we leave no trace
    if (AppDataSource.isInitialized) {
      const patientRepo = AppDataSource.getRepository(Patient);
      if (testPatient) await patientRepo.delete(testPatient.id);
      if (otherPatient) await patientRepo.delete(otherPatient.id);

      // Only destroy if this is the last test running
      await AppDataSource.destroy();
    }
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
    });

    it("should BLOCK a PATIENT from uploading an X-Ray", async () => {
      const mockContext = { user: { role: "PATIENT" } };

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
      const mockContext = {
        user: { role: "PATIENT", email: testPatient.email },
      };

      const result = await patientResolvers.Query.getPatientXRays(
        null,
        { patientId: testPatient.id },
        mockContext,
      );

      expect(Array.isArray(result)).toBe(true);
    });

    it("should BLOCK a PATIENT from viewing ANOTHER patient's X-Rays", async () => {
      const mockContext = {
        user: { role: "PATIENT", email: testPatient.email },
      };

      await expect(
        patientResolvers.Query.getPatientXRays(
          null,
          { patientId: otherPatient.id },
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
