import { BillingService } from "./billing.service";
import { GraphQLError } from "graphql";

const billingService = new BillingService();

export const billingResolvers = {
  Query: {
    // We protect this so only logged-in users can see invoices
    myInvoices: async (_: any, __: any, context: any) => {
      if (!context.user)
        throw new GraphQLError("Unauthorized", {
          extensions: { code: "UNAUTHENTICATED" },
        });
      return await billingService.getPatientInvoices(context.user.userId);
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
  },
};
