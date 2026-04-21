import { AuthService } from "./auth.service";

const authService = new AuthService();

export const authResolvers = {
  Mutation: {
    login: async (_: any, { email, password }: any) => {
      return authService.login(email, password);
    },
  },
};
