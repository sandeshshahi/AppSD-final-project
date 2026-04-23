import { AppDataSource } from "../../config/database";
import { NotFoundError } from "../../core/errors/app.errors";
import { isAuthenticated } from "../../core/middleware/auth.guard";
import { Patient } from "../patient/patient.entity";
import { AppointmentService } from "./appointment.service";
import { GraphQLError } from "graphql";

const appointmentService = new AppointmentService();

export const appointmentResolvers = {
  Query: {
    getAllAppointments: async (_: any, __: any, context: any) => {
      if (!context.user || context.user.role !== "OFFICE_MANAGER")
        throw new GraphQLError("Unauthorized", {
          extensions: { code: "UNAUTHENTICATED" },
        });
      return await appointmentService.getAllAppointments();
    },
    getPatientAppointments: async (
      _: any,
      { patientId }: any,
      context: any,
    ) => {
      // Ensure user is logged in
      isAuthenticated(context);

      //  THE FIX: If they are a patient, completely ignore the `patientId` they sent!
      if (context.user.role === "PATIENT") {
        const patientRecord = await AppDataSource.getRepository(
          Patient,
        ).findOneBy({
          email: context.user.email,
        });

        if (!patientRecord) {
          throw new NotFoundError("Patient profile not found.");
        }

        // Securely fetch using their true database ID
        return await appointmentService.getAppointmentsByPatient(
          patientRecord.id,
        );
      }

      //  If they are a Dentist or Admin, let them search by the provided ID
      if (
        context.user.role === "OFFICE_MANAGER" ||
        context.user.role === "DENTIST"
      ) {
        return await appointmentService.getAppointmentsByPatient(
          parseInt(patientId),
        );
      }
    },
  },
  Mutation: {
    bookAppointment: async (_: any, { input }: any, context: any) => {
      isAuthenticated(context);

      let actualPatientId = parseInt(input.patientId);

      if (context.user.role === "PATIENT") {
        const patientRecord = await AppDataSource.getRepository(
          Patient,
        ).findOneBy({
          email: context.user.email,
        });

        if (!patientRecord) {
          throw new NotFoundError("Patient profile not found for this user.");
        }

        // Override whatever ID the frontend sent with their true database ID!
        actualPatientId = patientRecord.id;
      }

      return await appointmentService.bookAppointment(
        actualPatientId,
        parseInt(input.dentistId),
        parseInt(input.surgeryId),
        input.appointmentDate,
        input.appointmentTime,
      );
    },
  },
};
