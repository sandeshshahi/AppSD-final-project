import "reflect-metadata"; // MUST BE LINE 1 for TypeORM to work!
import express from "express";
import cors from "cors";
import "dotenv/config";
import { ApolloServer } from "@apollo/server";
import { expressMiddleware } from "@as-integrations/express5";

import { AppDataSource } from "./config/database";
import { typeDefs, resolvers } from "./core/graphql/schema";
import jwt from "jsonwebtoken";
import { AuthService } from "./modules/auth/auth.service";

async function bootstrap() {
  try {
    // 1. Initialize MySQL Database
    await AppDataSource.initialize();
    console.log("Database successfully connected!");

    // 2. Initialize Express
    const app = express();
    app.use(cors());
    app.use(express.json());

    const authService = new AuthService();
    await authService.seedAdmin();

    // 3. Initialize Apollo GraphQL Server
    const server = new ApolloServer({ typeDefs, resolvers });
    await server.start();

    // 4. Mount GraphQL Endpoint
    app.use(
      "/graphql",
      expressMiddleware(server, {
        context: async ({ req }) => {
          const authHeader = req.headers.authorization || "";
          if (authHeader.startsWith("Bearer ")) {
            const token = authHeader.split(" ")[1];
            try {
              const decoded = jwt.verify(
                token,
                process.env.JWT_SECRET || "fallback_secret",
              );
              return { user: decoded }; // passes the user to every resolver!
            } catch (err) {
              console.log("Invalid token");
            }
          }
          return { user: null }; // Not logged in
        },
      }),
    );

    // 5. Start the Server
    const PORT = process.env.PORT || 8080;
    app.listen(PORT, () => {
      console.log(`Server ready at http://localhost:${PORT}/graphql`);
    });
  } catch (error) {
    console.error("Fatal Error during server startup:", error);
    process.exit(1);
  }
}

bootstrap();
