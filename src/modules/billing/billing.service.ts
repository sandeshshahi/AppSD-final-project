import { AppDataSource } from "../../config/database";
import { BadRequestError, NotFoundError } from "../../core/errors/app.errors";
import { Invoice } from "./invoice.entity";
import { Appointment } from "../appointment/appointment.entity";

export class BillingService {
  private invoiceRepo = AppDataSource.getRepository(Invoice);

  // The Core Business Rule Check
  async hasUnpaidInvoices(patientId: number): Promise<boolean> {
    const unpaidCount = await this.invoiceRepo.count({
      where: {
        patient: { id: patientId },
        status: "UNPAID",
      },
    });
    return unpaidCount > 0;
  }

  // Fetch all invoices for a patient
  async getPatientInvoices(patientId: number) {
    return await this.invoiceRepo.find({
      relations: ["appointment", "patient"],
      where: { patient: { id: patientId } },
      order: { issueDate: "DESC" },
    });
  }

  // Pay a bill
  async payInvoice(invoiceId: number) {
    const invoice = await this.invoiceRepo.findOneBy({ id: invoiceId });
    if (!invoice) throw new NotFoundError("Invoice", invoiceId);
    if (invoice.status === "PAID") {
      throw new BadRequestError(`Invoice ${invoiceId} is already paid.`);
    }

    invoice.status = "PAID";
    return await this.invoiceRepo.save(invoice);
  }

  //  Fetch every invoice for the Admin Dashboard
  async getAllInvoices() {
    return await this.invoiceRepo.find({
      relations: ["patient"], // Bring in the patient data for the table!
      order: { issueDate: "DESC" },
    });
  }

  async createInvoice(appointmentId: number, amount: number) {
    const appointmentRepo = AppDataSource.getRepository(Appointment);

    // Find the appointment and automatically bring in the patient data
    const appointment = await appointmentRepo.findOne({
      where: { id: appointmentId },
      relations: ["patient"],
    });

    if (!appointment) {
      throw new NotFoundError("Appointment", appointmentId);
    }

    // Check if this appointment already has an invoice (since it's OneToOne)
    const existingInvoice = await this.invoiceRepo.findOne({
      where: { appointment: { id: appointmentId } },
    });

    if (existingInvoice) {
      throw new BadRequestError("This appointment already has an invoice.");
    }

    // Create and save the new invoice
    const newInvoice = this.invoiceRepo.create({
      amount: amount,
      status: "UNPAID",
      patient: appointment.patient,
      appointment: appointment,
    });

    return await this.invoiceRepo.save(newInvoice);
  }
}
