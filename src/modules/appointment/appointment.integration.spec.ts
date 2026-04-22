import { DataSource } from "typeorm";
import { AppointmentService } from "./appointment.service";
import { Appointment } from "./appointment.entity";
import { Patient } from "../patient/patient.entity";
import { Dentist } from "../dentist/dentist.entity";
import { Surgery } from "../surgery/surgery.entity";
import { Invoice } from "../billing/invoice.entity";
import { describe, it, expect, beforeAll, afterAll } from "@jest/globals";

describe("Integration Test: Smart Scheduling Engine", () => {
  let testDataSource: DataSource;
  let appointmentService: AppointmentService;

  let patientA: Patient;
  let patientB: Patient; // Patient B will have an unpaid bill!
  let testDentist: Dentist;
  let testSurgery: Surgery;

  beforeAll(async () => {
    testDataSource = new DataSource({
      type: "sqlite",
      database: ":memory:",
      dropSchema: true,
      entities: [Patient, Dentist, Surgery, Appointment, Invoice],
      synchronize: true,
      logging: false,
    });

    await testDataSource.initialize();

    appointmentService = new AppointmentService();

    // @ts-ignore - Map all the internal repositories to our SQLite test DB
    appointmentService.appointmentRepo =
      testDataSource.getRepository(Appointment);
    // @ts-ignore
    appointmentService.patientRepo = testDataSource.getRepository(Patient);
    // @ts-ignore
    appointmentService.dentistRepo = testDataSource.getRepository(Dentist);
    // @ts-ignore
    appointmentService.surgeryRepo = testDataSource.getRepository(Surgery);
    // @ts-ignore - We also must map the BillingService's internal repo!
    appointmentService.billingService.invoiceRepo =
      testDataSource.getRepository(Invoice);

    // --- Seed the Database with Test Data ---
    patientA = await testDataSource.getRepository(Patient).save({
      firstName: "Bruce",
      lastName: "Banner",
      email: "hulk@avengers.com",
    });
    patientB = await testDataSource.getRepository(Patient).save({
      firstName: "Natasha",
      lastName: "Romanoff",
      email: "widow@avengers.com",
    });

    // We fixed the Dentist email here!
    testDentist = await testDataSource.getRepository(Dentist).save({
      firstName: "Stephen",
      lastName: "Strange",
      email: "dr.strange@avengers.com",
      specialization: "Orthodontics",
    });

    // We fixed the Surgery locationAddress here!
    testSurgery = await testDataSource.getRepository(Surgery).save({
      name: "Room 1",
      locationAddress: "East Wing",
      telephoneNumber: "555-0199",
    });

    // Give Patient B an unpaid bill!
    await testDataSource
      .getRepository(Invoice)
      .save({ amount: 500, status: "UNPAID", patient: patientB });
  });

  afterAll(async () => {
    if (testDataSource.isInitialized) {
      await testDataSource.destroy();
    }
  });

  it("should successfully book an appointment for a patient with no bills", async () => {
    const appointment = await appointmentService.bookAppointment(
      patientA.id,
      testDentist.id,
      testSurgery.id,
      "2026-10-15",
      "10:00:00",
    );

    expect(appointment).toBeDefined();
    expect(appointment.status).toBe("SCHEDULED");
  });

  it("should FAIL to book if the dentist is already booked at that exact time", async () => {
    // Try to book Patient A again at the exact same time with the exact same dentist
    await expect(
      appointmentService.bookAppointment(
        patientA.id,
        testDentist.id,
        testSurgery.id,
        "2026-10-15",
        "10:00:00",
      ),
    ).rejects.toThrow("Dentist is already booked.");
  });

  it("should FAIL to book if the patient has an unpaid bill", async () => {
    // Try to book Patient B (who we seeded with an unpaid invoice)
    await expect(
      appointmentService.bookAppointment(
        patientB.id,
        testDentist.id,
        testSurgery.id,
        "2026-10-16",
        "14:00:00",
      ),
    ).rejects.toThrow(
      "Action blocked: Patient has outstanding unpaid invoices.",
    );
  });

  it("should FAIL to book if the dentist is already booked at that exact time", async () => {
    await expect(
      appointmentService.bookAppointment(
        patientA.id,
        testDentist.id,
        testSurgery.id,
        "2026-10-15",
        "10:00:00",
      ),
    ).rejects.toThrow("Dentist is already booked.");
  });

  it("should FAIL to book if the patient has an unpaid bill", async () => {
    await expect(
      appointmentService.bookAppointment(
        patientB.id,
        testDentist.id,
        testSurgery.id,
        "2026-10-16",
        "14:00:00",
      ),
    ).rejects.toThrow(
      "Action blocked: Patient has outstanding unpaid invoices.",
    );
  });
});
