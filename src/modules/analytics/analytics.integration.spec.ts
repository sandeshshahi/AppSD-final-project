import { DataSource } from "typeorm";
import { AnalyticsService } from "./analytics.service";
import { Appointment } from "../appointment/appointment.entity";
import { Invoice } from "../billing/invoice.entity";
import { Dentist } from "../dentist/dentist.entity";
import { Patient } from "../patient/patient.entity";
import { Surgery } from "../surgery/surgery.entity";
import { User } from "../auth/user.entity";
import { XRay } from "../patient/xray.entity";
import { describe, it, expect, beforeAll, afterAll } from "@jest/globals";

describe("Analytics Service", () => {
  let testDataSource: DataSource;
  let analyticsService: AnalyticsService;

  beforeAll(async () => {
    testDataSource = new DataSource({
      type: "sqlite",
      database: ":memory:",
      dropSchema: true,
      entities: [Patient, Appointment, Invoice, Dentist, Surgery, User, XRay],
      synchronize: true,
      logging: false,
    });

    await testDataSource.initialize();
    analyticsService = new AnalyticsService(testDataSource);
  });

  afterAll(async () => {
    if (testDataSource.isInitialized) {
      await testDataSource.destroy();
    }
  });

  it("should aggregate clinic data correctly", async () => {
    const invoiceRepo = testDataSource.getRepository(Invoice);
    const dentistRepo = testDataSource.getRepository(Dentist);
    const appointmentRepo = testDataSource.getRepository(Appointment);
    const patientRepo = testDataSource.getRepository(Patient);

    const patient = await patientRepo.save({
      firstName: "Test",
      lastName: "Patient",
      email: `test_${Date.now()}@clinic.com`,
    });

    const dentist = await dentistRepo.save({
      firstName: "Bruce",
      lastName: "Wayne",
      email: `dentist_${Date.now()}@clinic.com`,
      specialization: "General",
    });

    await invoiceRepo.save([
      { amount: 100, status: "PAID", patient },
      { amount: 50, status: "UNPAID", patient },
    ]);

    await appointmentRepo.save({
      patient,
      dentist,
      appointmentDate: "2026-04-25",
      appointmentTime: "10:00",
      status: "COMPLETED",
    } as any);

    const stats = await analyticsService.getClinicStats();

    expect(stats).toBeDefined();
    expect(stats.totalRevenue).toBeGreaterThan(0);
    expect(stats.unpaidInvoicesCount).toBeGreaterThan(0);
  });
});
