import { AppDataSource } from "../../config/database";
import { Patient } from "./patient.entity";
import { CreatePatientDTO } from "./patient.dto";
import { BadRequestError, NotFoundError } from "../../core/errors/app.errors";

export class PatientService {
  private patientRepo = AppDataSource.getRepository(Patient);

  async getAllPatients() {
    return await this.patientRepo.find({ order: { lastName: "ASC" } });
  }

  async getPatientById(id: number) {
    const patient = await this.patientRepo.findOneBy({ id });
    if (!patient) {
      throw new NotFoundError(`Patient with ID ${id} not found.`);
    }
    return patient;
  }

  async registerPatient(data: CreatePatientDTO) {
    // Check if email already exists to prevent duplicate crashes
    const existingPatient = await this.patientRepo.findOneBy({
      email: data.email,
    });
    if (existingPatient) {
      throw new BadRequestError(
        `A patient with email ${data.email} already exists.`,
      );
    }

    // TypeORM's .create() perfectly maps our DTO to our Entity!
    const newPatient = this.patientRepo.create(data);
    return await this.patientRepo.save(newPatient);
  }
}
