import { AppDataSource } from "../../config/database";
import { User } from "./user.entity";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { GraphQLError } from "graphql";

export class AuthService {
  private userRepo = AppDataSource.getRepository(User);

  // Helper method to create a test Office Manager if the DB is empty
  async seedAdmin() {
    const adminExists = await this.userRepo.findOneBy({
      email: "admin@ads.com",
    });
    if (!adminExists) {
      const hashedPassword = await bcrypt.hash("admin123", 10);
      const admin = this.userRepo.create({
        email: "admin@ads.com",
        password: hashedPassword,
        role: "OFFICE_MANAGER",
      });
      await this.userRepo.save(admin);
      console.log(
        "🔐 Default Office Manager created: admin@ads.com / admin123",
      );
    }
  }

  async login(email: string, password: string) {
    const user = await this.userRepo.findOneBy({ email });

    if (!user) {
      throw new GraphQLError("Invalid email or password", {
        extensions: { code: "UNAUTHENTICATED" },
      });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new GraphQLError("Invalid email or password", {
        extensions: { code: "UNAUTHENTICATED" },
      });
    }

    // Generate the Token!
    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET || "fallback_secret",
      { expiresIn: "24h" },
    );

    return { token, user };
  }
}
