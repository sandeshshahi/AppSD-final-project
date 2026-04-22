import { AuthenticationError } from "../errors/app.errors";

export const isAuthenticated = (context: any) => {
  if (!context.user) {
    throw new AuthenticationError();
  }
};
