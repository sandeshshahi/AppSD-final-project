import { AppDataSource } from "../../config/database";
import { User } from "../auth/user.entity";
import { Dentist } from "./dentist.entity";
import * as bcrypt from "bcryptjs";

export class DentistService {
  async registerDentist(data: any) {
    return await AppDataSource.transaction(async (manager) => {
      // Create the Dentist Profile
      const dentist = manager.create(Dentist, {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        specialization: data.specialization,
      });
      await manager.save(dentist);

      // Create the User Login
      const hashedPassword = await bcrypt.hash(data.password, 10);
      const user = manager.create(User, {
        email: data.email,
        password: hashedPassword,
        role: "DENTIST", // Assign the DENTIST role
      });
      await manager.save(user);

      return dentist;
    });
  }
}
