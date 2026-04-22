import { ForbiddenError } from "../../core/errors/app.errors";
import { isAuthenticated } from "../../core/middleware/auth.guard";
import { AnalyticsService } from "./analytics.service";

const analyticsService = new AnalyticsService();

export const analyticsResolvers = {
  Query: {
    getClinicStats: async (_: any, __: any, context: any) => {
      // Check if logged in
      isAuthenticated(context);

      // Check if Office Manager
      if (context.user.role !== "OFFICE_MANAGER") {
        throw new ForbiddenError(
          "Access denied: Only Office Managers can view clinic analytics.",
        );
      }

      return await analyticsService.getClinicStats();
    },
  },
};
