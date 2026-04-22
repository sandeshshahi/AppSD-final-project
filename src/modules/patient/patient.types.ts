export const patientTypeDefs = `#graphql
  type Address {
    street: String
    city: String
    zipCode: String
  }

  type Patient {
    id: ID!
    firstName: String!
    lastName: String!
    contactPhone: String
    email: String!
    dateOfBirth: String
    address: Address
    createdAt: String
  }

  input AddressInput {
    street: String
    city: String
    zipCode: String
  }

  input CreatePatientInput {
    firstName: String!
    lastName: String!
    contactPhone: String
    email: String!
    dateOfBirth: String
    address: AddressInput!
  }

  #we use 'extend' here so it adds to the base Query!
  extend type Query {
    getAllPatients: [Patient]
    getPatientById(id: ID!): Patient
  }

  extend type Mutation {
    registerPatient(input: CreatePatientInput!): Patient
  }
`;
