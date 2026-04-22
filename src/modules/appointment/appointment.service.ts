import { AppDataSource } from "../../config/database";
import { Appointment } from "./appointment.entity";
import { Patient } from "../patient/patient.entity";
import { Dentist } from "../dentist/dentist.entity";
import { Surgery } from "../surgery/surgery.entity";
import { BillingService } from "../billing/billing.service";
import { GraphQLError } from "graphql";

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
    if (hasUnpaidBills) {
      throw new GraphQLError(
        "Patient has outstanding unpaid bills. Cannot book a new appointment.",
        {
          extensions: { code: "FORBIDDEN", http: { status: 403 } },
        },
      );
    }

    // Check for Dentist double-booking using BOTH date and time
    const dentistConflict = await this.appointmentRepo.findOne({
      where: { dentist: { id: dentistId }, appointmentDate, appointmentTime },
    });
    if (dentistConflict) {
      throw new GraphQLError(
        "The selected Dentist is already booked at this specific time.",
      );
    }

    // Check for Surgery double-booking using BOTH date and time
    const surgeryConflict = await this.appointmentRepo.findOne({
      where: { surgery: { id: surgeryId }, appointmentDate, appointmentTime },
    });
    if (surgeryConflict) {
      throw new GraphQLError(
        "The selected Surgery Room is already occupied at this time.",
      );
    }

    const patient = await this.patientRepo.findOneBy({ id: patientId });
    const dentist = await this.dentistRepo.findOneBy({ id: dentistId });
    const surgery = await this.surgeryRepo.findOneBy({ id: surgeryId });

    if (!patient || !dentist || !surgery) {
      throw new GraphQLError(
        "Invalid Patient, Dentist, or Surgery ID provided.",
      );
    }

    // Save the time to the database!
    const appointment = this.appointmentRepo.create({
      appointmentDate,
      appointmentTime, // <-- ADDED THIS
      status: "SCHEDULED",
      patient,
      dentist,
      surgery,
    });

    return await this.appointmentRepo.save(appointment);
  }

  async getAllAppointments() {
    return await this.appointmentRepo.find({
      relations: ["patient", "dentist", "surgery"],
      order: { appointmentDate: "ASC" },
    });
  }
}
