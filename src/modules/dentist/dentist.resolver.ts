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
