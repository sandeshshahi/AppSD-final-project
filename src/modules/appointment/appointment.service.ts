import { AppDataSource } from "../../config/database";
import { Appointment } from "./appointment.entity";
import { Patient } from "../patient/patient.entity";
import { Dentist } from "../dentist/dentist.entity";
import { Surgery } from "../surgery/surgery.entity";
import { BillingService } from "../billing/billing.service";
import {
  UnpaidBillError,
  ConflictError,
  NotFoundError,
} from "../../core/errors/app.errors";
import { sendBookingEmail } from "../../core/utils/mailer";

export class AppointmentService {
  private appointmentRepo = AppDataSource.getRepository(Appointment);
  private patientRepo = AppDataSource.getRepository(Patient);
  private dentistRepo = AppDataSource.getRepository(Dentist);
  private surgeryRepo = AppDataSource.getRepository(Surgery);

  // Bring in the Billing Service to enforce Unpaid Bill Check
  private billingService = new BillingService();

  // Add appointmentTime to the signature
  async bookAppointment(
    patientId: number,
    dentistId: number,
    surgeryId: number,
    appointmentDate: string,
    appointmentTime: string,
  ) {
    const hasUnpaidBills =
      await this.billingService.hasUnpaidInvoices(patientId);
    if (hasUnpaidBills) throw new UnpaidBillError();

    // Check for Dentist double-booking using BOTH date and time
    const dentistConflict = await this.appointmentRepo.findOne({
      where: { dentist: { id: dentistId }, appointmentDate, appointmentTime },
    });
    if (dentistConflict) throw new ConflictError("Dentist is already booked.");

    // Check for Surgery double-booking using BOTH date and time
    const surgeryConflict = await this.appointmentRepo.findOne({
      where: { surgery: { id: surgeryId }, appointmentDate, appointmentTime },
    });
    if (surgeryConflict)
      throw new ConflictError(
        "The selected Surgery Room is already occupied at this time.",
      );

    const patient = await this.patientRepo.findOneBy({ id: patientId });
    console.log("=== WHAT IS IN THE DB ===", patient);
    if (!patient) throw new NotFoundError("Patient", patientId);
    const dentist = await this.dentistRepo.findOneBy({ id: dentistId });
    const surgery = await this.surgeryRepo.findOneBy({ id: surgeryId });

    if (!patient) throw new NotFoundError("Patient", patientId);
    if (!dentist) throw new NotFoundError("Dentist", dentistId);
    if (!surgery) throw new NotFoundError("Surgery", surgeryId);

    // Save the time to the database!
    const appointment = this.appointmentRepo.create({
      appointmentDate,
      appointmentTime,
      status: "SCHEDULED",
      patient,
      dentist,
      surgery,
    });

    // 1. Save the appointment
    const savedAppointment = await this.appointmentRepo.save(appointment);

    // 2. TRIGGER THE EMAIL (Don't await it so the API stays fast!)
    sendBookingEmail(patient.email, patient.firstName, {
      date: appointmentDate,
      time: appointmentTime,
      dentistName: `${dentist.firstName} ${dentist.lastName}`,
    }).catch((err) => console.error("Email failed to send:", err));

    return savedAppointment;
  }

  async getAllAppointments() {
    return await this.appointmentRepo.find({
      relations: ["patient", "dentist", "surgery", "invoice"],
      order: { appointmentDate: "DESC", appointmentTime: "DESC" },
    });
  }

  async getAppointmentsByPatient(patientId: number) {
    return await this.appointmentRepo.find({
      where: { patient: { id: patientId } },
      relations: ["dentist", "surgery", "patient"], // Bring in related data
      order: { appointmentDate: "ASC" },
    });
  }
}
