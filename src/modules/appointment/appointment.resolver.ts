import { isAuthenticated } from "../../core/middleware/auth.guard";
import { AppointmentService } from "./appointment.service";
import { GraphQLError } from "graphql";

const appointmentService = new AppointmentService();

export const appointmentResolvers = {
  Query: {
    getAllAppointments: async (_: any, __: any, context: any) => {
      if (!context.user)
        throw new GraphQLError("Unauthorized", {
          extensions: { code: "UNAUTHENTICATED" },
        });
      return await appointmentService.getAllAppointments();
    },
  },
  Mutation: {
    bookAppointment: async (_: any, { input }: any, context: any) => {
      isAuthenticated(context);

      return await appointmentService.bookAppointment(
        parseInt(input.patientId),
        parseInt(input.dentistId),
        parseInt(input.surgeryId),
        input.appointmentDate,
        input.appointmentTime,
      );
    },
  },
};
