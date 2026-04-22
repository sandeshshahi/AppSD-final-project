import { AuthService } from "./auth.service";

const authService = new AuthService();

export const authResolvers = {
  Mutation: {
    signUp: async (_: any, { input }: any) => {
      return await authService.signUpPatient(input);
    },
    login: async (_: any, { email, password }: any) => {
      const result = await authService.login(email, password);
      return { token: result.token, user: result.user };
    },
  },
};
