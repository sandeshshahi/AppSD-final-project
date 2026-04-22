import { PatientService } from "./patient.service";
import { CreatePatientDTO } from "./patient.dto";
import { uploadToCloudinary } from "../../core/utils/cloudinary";
import { AppDataSource } from "../../config/database";
import { XRay } from "./xray.entity";
import { isAuthenticated } from "../../core/middleware/auth.guard";
import { ForbiddenError } from "../../core/errors/app.errors";
import { Patient } from "./patient.entity";

const patientService = new PatientService();

export const patientResolvers = {
  Query: {
    getAllPatients: () => patientService.getAllPatients(),
    getPatientById: (_: any, { id }: { id: string }) =>
      patientService.getPatientById(parseInt(id)),

    getPatientXRays: async (_: any, { patientId }: any, context: any) => {
      isAuthenticated(context);

      // If the user is a DENTIST or ADMIN, let them see any ID.
      if (
        context.user.role === "DENTIST" ||
        context.user.role === "OFFICE_MANAGER"
      ) {
        return await patientService.getXRaysByPatient(parseInt(patientId));
      }

      // If the user is a PATIENT, Ownership Check
      if (context.user.role === "PATIENT") {
        // find the patient record that matches the LOGGED-IN user's email
        const patientRecord = await AppDataSource.getRepository(
          Patient,
        ).findOneBy({
          email: context.user.email,
        });

        // If the ID they asked for doesn't match THEIR record, block them!
        if (!patientRecord || patientRecord.id !== parseInt(patientId)) {
          throw new ForbiddenError(
            "You are not authorized to view these medical records.",
          );
        }

        return await patientService.getXRaysByPatient(patientRecord.id);
      }
    },
  },
  Mutation: {
    // type the incoming input to our strict CreatePatientDTO!
    registerPatient: (_: any, { input }: { input: CreatePatientDTO }) => {
      return patientService.registerPatient(input);
    },

    uploadXRay: async (
      _: any,
      { patientId, base64Image, description }: any,
      context: any,
    ) => {
      isAuthenticated(context);
      if (context.user.role !== "DENTIST") {
        throw new ForbiddenError("Only dentists can upload X-Rays");
      }

      return await patientService.uploadXRay(
        parseInt(patientId),
        base64Image,
        description,
      );
    },
  },

  // Adding a field resolver so when queried a Patient, you can see their X-Rays
  Patient: {
    xrays: async (parent: any) => {
      const xrayRepo = AppDataSource.getRepository(XRay);
      return await xrayRepo.find({ where: { patient: { id: parent.id } } });
    },
  },
};
