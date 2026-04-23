import { AppDataSource } from "../../config/database";
import { Patient } from "./patient.entity";
import { CreatePatientDTO } from "./patient.dto";
import { BadRequestError, NotFoundError } from "../../core/errors/app.errors";
import { XRay } from "./xray.entity";
import { uploadToCloudinary } from "../../core/utils/cloudinary";

export class PatientService {
  private xrayRepo = AppDataSource.getRepository(XRay);
  private patientRepo = AppDataSource.getRepository(Patient);

  async uploadXRay(
    patientId: number,
    base64Image: string,
    description?: string,
  ) {
    //  Verify the patient exists
    const patient = await this.patientRepo.findOneBy({ id: patientId });
    if (!patient) throw new NotFoundError("Patient", patientId);

    //  Prepare the buffer from the Base64 string
    // This removes the "data:image/png;base64," prefix if present
    const base64Data = base64Image.replace(/^data:image\/\w+;base64,/, "");
    const buffer = Buffer.from(base64Data, "base64");

    //  Upload to Cloudinary
    const uploadResult = await uploadToCloudinary(buffer);

    //  Save record to our database
    const xray = this.xrayRepo.create({
      imageUrl: uploadResult.secure_url,
      publicId: uploadResult.public_id,
      description,
      patient,
    });

    return await this.xrayRepo.save(xray);
  }

  async getAllPatients() {
    return await this.patientRepo.find({
      relations: ["appointments", "appointments.dentist"],
    });
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

  async getXRaysByPatient(patientId: number) {
    const patient = await this.patientRepo.findOne({
      where: { id: patientId },
      relations: ["xrays"], // This automatically loads the related X-ray records
    });

    if (!patient) throw new NotFoundError("Patient", patientId);

    return patient.xrays;
  }
}
