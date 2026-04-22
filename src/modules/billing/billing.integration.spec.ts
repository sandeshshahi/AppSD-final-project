import { DataSource } from "typeorm";
import { BillingService } from "./billing.service";
import { Invoice } from "./invoice.entity";
import { Patient } from "../patient/patient.entity";
import { Appointment } from "../appointment/appointment.entity";
import { Dentist } from "../dentist/dentist.entity";
import { Surgery } from "../surgery/surgery.entity";
import { describe, it, expect, beforeAll, afterAll } from "@jest/globals";
import { XRay } from "../patient/xray.entity";

describe("Integration Test: Billing Service", () => {
  let testDataSource: DataSource;
  let billingService: BillingService;
  let testPatient: Patient;

  beforeAll(async () => {
    testDataSource = new DataSource({
      type: "sqlite",
      database: ":memory:",
      dropSchema: true,
      entities: [Patient, Invoice, Appointment, Dentist, Surgery, XRay],
      synchronize: true,
      logging: false,
    });

    await testDataSource.initialize();

    billingService = new BillingService();
    // @ts-ignore - Override the repo to use our in-memory SQLite database
    billingService.invoiceRepo = testDataSource.getRepository(Invoice);

    // Seed a test patient directly into the database
    const patientRepo = testDataSource.getRepository(Patient);
    testPatient = await patientRepo.save(
      patientRepo.create({
        firstName: "Peter",
        lastName: "Parker",
        email: "peter@dailybugle.com",
      }),
    );
  });

  afterAll(async () => {
    if (testDataSource.isInitialized) {
      await testDataSource.destroy();
    }
  });

  it("should return false if the patient has no unpaid invoices", async () => {
    const hasUnpaid = await billingService.hasUnpaidInvoices(testPatient.id);
    expect(hasUnpaid).toBe(false);
  });

  it("should return true after an unpaid invoice is generated", async () => {
    // Arrange: Create an unpaid bill for Peter Parker
    const invoiceRepo = testDataSource.getRepository(Invoice);
    await invoiceRepo.save(
      invoiceRepo.create({
        amount: 150.0,
        status: "UNPAID",
        patient: testPatient,
      }),
    );

    //  Act: Check the service
    const hasUnpaid = await billingService.hasUnpaidInvoices(testPatient.id);

    //  Assert: The system should now flag him
    expect(hasUnpaid).toBe(true);
  });
});
