import { validate } from "class-validator";
import { CreatePatientDTO, AddressDTO } from "./patient.dto";

describe("Unit Test: CreatePatientDTO Validation", () => {
  it("should fail validation if the email is invalid", async () => {
    // Create a DTO with a bad email
    const badPatient = new CreatePatientDTO();
    badPatient.firstName = "Bruce";
    badPatient.lastName = "Wayne";
    badPatient.email = "not-a-real-email"; // 🚨 BAD EMAIL!

    const address = new AddressDTO();
    address.city = "Gotham";
    badPatient.address = address;

    // Run the class-validator
    const errors = await validate(badPatient);

    // Assert: We expect exactly 1 error, and it should be about the email
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toEqual("email");
    expect(errors[0].constraints?.isEmail).toBeDefined();
  });

  it("should pass validation with correct data", async () => {
    const goodPatient = new CreatePatientDTO();
    goodPatient.firstName = "Bruce";
    goodPatient.lastName = "Wayne";
    goodPatient.email = "bruce@wayneenterprises.com"; // GOOD EMAIL!

    const address = new AddressDTO();
    address.city = "Gotham";
    goodPatient.address = address;

    const errors = await validate(goodPatient);
    expect(errors.length).toBe(0); // We expect ZERO errors!
  });
});
