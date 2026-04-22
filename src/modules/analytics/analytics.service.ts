import { DataSource } from "typeorm";
import { AppDataSource } from "../../config/database";
import { Appointment } from "../appointment/appointment.entity";
import { Invoice } from "../billing/invoice.entity";

export class AnalyticsService {
  constructor(private dataSource: DataSource = AppDataSource) {}

  async getClinicStats() {
    const appointmentRepo = this.dataSource.getRepository(Appointment);
    const invoiceRepo = this.dataSource.getRepository(Invoice);

    // Total Appointments
    const totalAppointments = await appointmentRepo.count();

    // Total Revenue
    const revenueResult = await invoiceRepo
      .createQueryBuilder("invoice")
      .select("SUM(invoice.amount)", "sum")
      .getRawOne();

    const totalRevenue = parseFloat(revenueResult?.sum) || 0;

    // Count of Unpaid Bills
    const unpaidCount = await invoiceRepo.countBy({ status: "UNPAID" });

    // Top Dentist (Dynamic)
    // This query finds the dentist with the most appointments
    const topDentistResult = await appointmentRepo
      .createQueryBuilder("appointment")
      .leftJoin("appointment.dentist", "dentist")
      .select("dentist.firstName", "firstName")
      .addSelect("dentist.lastName", "lastName")
      .addSelect("COUNT(appointment.id)", "count")
      .groupBy("dentist.id")
      .orderBy("count", "DESC")
      .limit(1)
      .getRawOne();

    const topDentistName = topDentistResult
      ? `${topDentistResult.firstName} ${topDentistResult.lastName}`
      : "No appointments yet";

    return {
      totalAppointments,
      totalRevenue,
      unpaidInvoicesCount: unpaidCount,
      topDentistName,
    };
  }
}
