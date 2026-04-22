import { AppDataSource } from "../../config/database";
import { Surgery } from "./surgery.entity";

export class SurgeryService {
  async createSurgery(data: any) {
    const surgeryRepo = AppDataSource.getRepository(Surgery);
    const surgery = surgeryRepo.create({
      name: data.name,
      locationAddress: data.locationAddress,
      telephoneNumber: data.telephoneNumber,
    });
    return await surgeryRepo.save(surgery);
  }
}
