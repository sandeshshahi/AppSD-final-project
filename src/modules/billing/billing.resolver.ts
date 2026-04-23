import { BillingService } from "./billing.service";
import { GraphQLError } from "graphql";
import { AppDataSource } from "../../config/database";
import { Patient } from "../patient/patient.entity"; // 👈 Don't forget this import!

const billingService = new BillingService();

export const billingResolvers = {
  Query: {
    // Use the email to find the true Patient ID
    myInvoices: async (_: any, __: any, context: any) => {
      if (!context.user || context.user.role !== "PATIENT") {
        throw new GraphQLError("Unauthorized", {
          extensions: { code: "UNAUTHENTICATED" },
        });
      }

      // Look up their true Patient Profile using the secure login email
      const patientRecord = await AppDataSource.getRepository(
        Patient,
      ).findOneBy({
        email: context.user.email,
      });

      if (!patientRecord) {
        throw new GraphQLError("Patient profile not found.");
      }

      // Securely fetch using their true database ID
      return await billingService.getPatientInvoices(patientRecord.id);
    },

    //  The Admin query
    getAllInvoices: async (_: any, __: any, context: any) => {
      // Security Check: Only Office Managers can see everyone's money!
      if (!context.user || context.user.role !== "OFFICE_MANAGER") {
        throw new GraphQLError("Unauthorized. Admin access required.", {
          extensions: { code: "FORBIDDEN" },
        });
      }

      return await billingService.getAllInvoices();
    },
  },

  Mutation: {
    payInvoice: async (
      _: any,
      { invoiceId }: { invoiceId: string },
      context: any,
    ) => {
      if (!context.user)
        throw new GraphQLError("Unauthorized", {
          extensions: { code: "UNAUTHENTICATED" },
        });

      return await billingService.payInvoice(parseInt(invoiceId));
    },

    createInvoice: async (
      _: any,
      { appointmentId, amount }: any,
      context: any,
    ) => {
      // Security Check: Only the Office Manager (or Dentist) can create bills
      if (!context.user || context.user.role !== "OFFICE_MANAGER") {
        throw new GraphQLError("Unauthorized. Admin access required.", {
          extensions: { code: "FORBIDDEN" },
        });
      }

      return await billingService.createInvoice(
        parseInt(appointmentId),
        parseFloat(amount),
      );
    },
  },
};
