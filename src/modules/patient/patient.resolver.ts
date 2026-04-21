import { PatientService } from "./patient.service";
import { CreatePatientDTO } from "./patient.dto";

const patientService = new PatientService();

export const patientResolvers = {
  Query: {
    getAllPatients: () => patientService.getAllPatients(),
    getPatientById: (_: any, { id }: { id: string }) =>
      patientService.getPatientById(parseInt(id)),
  },
  Mutation: {
    // type the incoming input to our strict CreatePatientDTO!
    registerPatient: (_: any, { input }: { input: CreatePatientDTO }) => {
      return patientService.registerPatient(input);
    },
  },
};
