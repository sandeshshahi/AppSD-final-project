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

  type XRay {
    id: ID!
    imageUrl: String!
    uploadedAt: String!
    description: String
  }

  extend type Patient {
    xrays: [XRay!]!
  }

  #we use 'extend' here so it adds to the base Query!
  extend type Query {
    getAllPatients: [Patient]
    getPatientById(id: ID!): Patient
    getPatientXRays(patientId: ID!): [XRay!]!
  }

  extend type Mutation {
    registerPatient(input: CreatePatientInput!): Patient

    # We send the file as a Base64 string for simplicity in this GraphQL setup
    uploadXRay(patientId: ID!, base64Image: String!, description: String): XRay!
  }
`;
