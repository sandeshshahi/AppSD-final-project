import { ForbiddenError } from "../../core/errors/app.errors";
import { isAuthenticated } from "../../core/middleware/auth.guard";
import { AppDataSource } from "../../config/database";
import { Dentist } from "./dentist.entity";

import { DentistService } from "./dentist.service";

const dentistService = new DentistService();

export const dentistResolvers = {
  Query: {
    getDentists: async () => {
      // Fetch all dentists from the database
      return await AppDataSource.getRepository(Dentist).find();
    },
    getDentist: async (_: any, { id }: any) => {
      // Fetch a single dentist by ID
      return await AppDataSource.getRepository(Dentist).findOneBy({
        id: parseInt(id),
      });
    },
    getPatientsForDentist: async (_: any, { dentistId }: any, context: any) => {
      isAuthenticated(context);

      // Security Check: Only Dentists and Office Managers can view patients
      if (
        context.user.role !== "DENTIST" &&
        context.user.role !== "OFFICE_MANAGER"
      ) {
        throw new ForbiddenError(
          "You are not authorized to view this directory.",
        );
      }

      // If it is a Dentist, use their login token to find their true DB ID
      if (context.user.role === "DENTIST") {
        const dentistRecord = await AppDataSource.getRepository(
          Dentist,
        ).findOneBy({
          email: context.user.email,
        });

        if (!dentistRecord) {
          throw new Error("Dentist profile not found.");
        }

        // Ignore the ID the frontend sent, use the secure one!
        return await dentistService.getPatientsForDentist(dentistRecord.id);
      }

      // If it's an Office Manager, let them query any Dentist ID they want
      return await dentistService.getPatientsForDentist(parseInt(dentistId));
    },
  },
  Mutation: {
    createDentist: async (_: any, { input }: any, context: any) => {
      isAuthenticated(context);

      // ROLE CHECK: Only OFFICE_MANAGER can create Dentists
      if (context.user.role !== "OFFICE_MANAGER") {
        throw new ForbiddenError();
      }

      return await dentistService.registerDentist(input);
    },
  },
};
