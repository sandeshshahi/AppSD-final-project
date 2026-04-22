import { ForbiddenError } from "../../core/errors/app.errors";
import { isAuthenticated } from "../../core/middleware/auth.guard";
import { SurgeryService } from "./surgery.service";
import { AppDataSource } from "../../config/database";
import { Surgery } from "./surgery.entity";

const surgeryService = new SurgeryService();

export const surgeryResolvers = {
  Query: {
    getSurgeries: async () => {
      return await AppDataSource.getRepository(Surgery).find();
    },
  },
  Mutation: {
    createSurgery: async (_: any, { input }: any, context: any) => {
      isAuthenticated(context);

      // ROLE CHECK: Only Admin/Office Manager can build rooms
      if (context.user.role !== "OFFICE_MANAGER") {
        throw new ForbiddenError(
          "Only Office Managers can create surgery rooms.",
        );
      }

      return await surgeryService.createSurgery(input);
    },
  },
};
