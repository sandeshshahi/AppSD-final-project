import { DataSource } from "typeorm";
import { AuthService } from "./auth.service";
import { User } from "./user.entity";
import * as bcrypt from "bcryptjs";
import { describe, it, expect, beforeAll, afterAll } from "@jest/globals";

describe("Integration Test: Authentication Service", () => {
  let testDataSource: DataSource;
  let authService: AuthService;

  beforeAll(async () => {
    testDataSource = new DataSource({
      type: "sqlite",
      database: ":memory:",
      dropSchema: true,
      entities: [User],
      synchronize: true,
      logging: false,
    });

    await testDataSource.initialize();

    authService = new AuthService();
    // @ts-ignore - Map the internal repository to our SQLite test DB
    authService.userRepo = testDataSource.getRepository(User);

    // --- Seed a Test Admin User ---
    const hashedPassword = await bcrypt.hash("SuperSecret123!", 10);

    await testDataSource.getRepository(User).save({
      email: "admin@enterprise.com",
      password: hashedPassword,
      role: "ADMIN",
    });
  });

  afterAll(async () => {
    if (testDataSource.isInitialized) {
      await testDataSource.destroy();
    }
  });

  it("should successfully log in and return a JWT token for valid credentials", async () => {
    const result = await authService.login(
      "admin@enterprise.com",
      "SuperSecret123!",
    );

    expect(result).toBeDefined();
    expect(result.token).toBeDefined();
    expect(result.user.email).toBe("admin@enterprise.com");
  });

  it("should FAIL to log in if the email does not exist", async () => {
    await expect(
      authService.login("ghost@enterprise.com", "SuperSecret123!"),
    ).rejects.toThrow(); // Expecting an "Invalid credentials" error
  });

  it("should FAIL to log in if the password is incorrect", async () => {
    await expect(
      authService.login("admin@enterprise.com", "WrongPassword!"),
    ).rejects.toThrow(); // Expecting an "Invalid credentials" error
  });
});
