import { AppDataSource } from "../../config/database";
import { Appointment } from "../appointment/appointment.entity";
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

  async getPatientsForDentist(dentistId: number) {
    const appointments = await AppDataSource.getRepository(Appointment).find({
      where: { dentist: { id: dentistId } },
      relations: [
        "patient",
        "patient.appointments",
        "patient.appointments.dentist",
      ], // Bring in the patient data
    });

    // Remove duplicates (in case a patient had 3 appointments, we only want them listed once)
    const uniquePatientsMap = new Map();
    for (const apt of appointments) {
      if (apt.patient) {
        uniquePatientsMap.set(apt.patient.id, apt.patient);
      }
    }

    // Convert the Map back into a standard array
    return Array.from(uniquePatientsMap.values());
  }
}
