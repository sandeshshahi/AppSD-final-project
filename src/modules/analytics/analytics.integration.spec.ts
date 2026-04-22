import { DataSource } from "typeorm";
import { AnalyticsService } from "./analytics.service";
import { Appointment } from "../appointment/appointment.entity";
import { Invoice } from "../billing/invoice.entity";
import { Dentist } from "../dentist/dentist.entity";
import { Patient } from "../patient/patient.entity";
import { Surgery } from "../surgery/surgery.entity";
import { User } from "../auth/user.entity";
import { describe, it, expect, beforeAll, afterAll, jest } from "@jest/globals";

describe("Analytics Service", () => {
  let testDataSource: DataSource;
  let analyticsService: AnalyticsService;

  beforeAll(async () => {
    testDataSource = new DataSource({
      type: "sqlite",
      database: ":memory:",
      entities: [Appointment, Invoice, Dentist, Patient, Surgery, User],
      synchronize: true,
    });
    await testDataSource.initialize();
    analyticsService = new AnalyticsService(testDataSource);
  });

  it("should aggregate clinic data correctly", async () => {
    const invoiceRepo = testDataSource.getRepository(Invoice);
    const dentistRepo = testDataSource.getRepository(Dentist);
    const appointmentRepo = testDataSource.getRepository(Appointment);

    // Seed Data
    const d = await dentistRepo.save({
      firstName: "Bruce",
      lastName: "Wayne",
      email: "b@w.com",
      specialization: "General",
    });
    await invoiceRepo.save([
      { amount: 100, status: "PAID" },
      { amount: 50, status: "UNPAID" },
    ]);
    await appointmentRepo.save({
      appointmentDate: "2026-01-01",
      appointmentTime: "10:00",
      dentist: d,
      status: "SCHEDULED",
    } as any);

    const stats = await analyticsService.getClinicStats();

    expect(stats.totalAppointments).toBe(1);
    expect(stats.totalRevenue).toBe(150);
    expect(stats.unpaidInvoicesCount).toBe(1);
    expect(stats.topDentistName).toBe("Bruce Wayne");
  });

  afterAll(async () => {
    await testDataSource.destroy();
  });
});
