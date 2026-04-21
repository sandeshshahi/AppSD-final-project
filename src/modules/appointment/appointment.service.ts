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

  async bookAppointment(
    patientId: number,
    dentistId: number,
    surgeryId: number,
    appointmentDate: string,
  ) {
    // The Unpaid Bill Check
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

    // Dentist Double-Booking Check
    const dentistConflict = await this.appointmentRepo.findOne({
      where: { dentist: { id: dentistId }, appointmentDate },
    });
    if (dentistConflict) {
      throw new GraphQLError(
        "The selected Dentist is already booked at this specific time.",
      );
    }

    // Surgery Room Double-Booking Check
    const surgeryConflict = await this.appointmentRepo.findOne({
      where: { surgery: { id: surgeryId }, appointmentDate },
    });
    if (surgeryConflict) {
      throw new GraphQLError(
        "The selected Surgery Room is already occupied at this time.",
      );
    }

    // Fetch the actual entities to link them
    const patient = await this.patientRepo.findOneBy({ id: patientId });
    const dentist = await this.dentistRepo.findOneBy({ id: dentistId });
    const surgery = await this.surgeryRepo.findOneBy({ id: surgeryId });

    if (!patient || !dentist || !surgery) {
      throw new GraphQLError(
        "Invalid Patient, Dentist, or Surgery ID provided.",
      );
    }

    // If all checks pass, create the appointment!
    const appointment = this.appointmentRepo.create({
      appointmentDate,
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
