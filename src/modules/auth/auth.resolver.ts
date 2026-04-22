import { AuthService } from "./auth.service";

const authService = new AuthService();

export const authResolvers = {
  Mutation: {
    signUp: async (_: any, { input }: any) => {
      return await authService.signUpPatient(input);
    },
    login: async (_: any, { email, password }: any) => {
      return authService.login(email, password);
    },
  },
};
