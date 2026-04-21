import { AppDataSource } from "../../config/database";
import { Patient } from "./patient.entity";
import { CreatePatientDTO } from "./patient.dto";
import { GraphQLError } from "graphql";

export class PatientService {
  private patientRepo = AppDataSource.getRepository(Patient);

  async getAllPatients() {
    return await this.patientRepo.find({ order: { lastName: "ASC" } });
  }

  async getPatientById(id: number) {
    const patient = await this.patientRepo.findOneBy({ id });
    if (!patient) {
      throw new GraphQLError(`Patient with ID ${id} not found.`, {
        extensions: { code: "NOT_FOUND", http: { status: 404 } },
      });
    }
    return patient;
  }

  async registerPatient(data: CreatePatientDTO) {
    // Check if email already exists to prevent duplicate crashes
    const existingPatient = await this.patientRepo.findOneBy({
      email: data.email,
    });
    if (existingPatient) {
      throw new GraphQLError(
        `A patient with email ${data.email} already exists.`,
        {
          extensions: { code: "BAD_REQUEST", http: { status: 400 } },
        },
      );
    }

    // TypeORM's .create() perfectly maps our DTO to our Entity!
    const newPatient = this.patientRepo.create(data);
    return await this.patientRepo.save(newPatient);
  }
}
