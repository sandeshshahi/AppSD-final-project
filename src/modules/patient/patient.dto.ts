import {
  IsString,
  IsEmail,
  IsOptional,
  ValidateNested,
  IsDateString,
} from "class-validator";
import { Type } from "class-transformer";

// 1. The Address Rule Set
export class AddressDTO {
  @IsString()
  @IsOptional()
  street?: string;

  @IsString()
  @IsOptional()
  city?: string;

  @IsString()
  @IsOptional()
  zipCode?: string;
}

// 2. The Create Patient Rule Set
export class CreatePatientDTO {
  @IsString()
  firstName!: string;

  @IsString()
  lastName!: string;

  @IsString()
  @IsOptional()
  contactPhone?: string;

  @IsEmail({}, { message: "Please provide a valid email address." })
  email!: string;

  @IsDateString()
  @IsOptional()
  dateOfBirth?: string;

  @ValidateNested()
  @Type(() => AddressDTO)
  address!: AddressDTO;
}
