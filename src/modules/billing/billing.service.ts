import { AppDataSource } from "../../config/database";
import { BadRequestError, NotFoundError } from "../../core/errors/app.errors";
import { Invoice } from "./invoice.entity";

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
      where: { patient: { id: patientId } },
      relations: ["appointment"], // Pulls in the appointment details too
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
}
