import { authResolvers } from "../../modules/auth/auth.resolver";
import { billingResolvers } from "../../modules/billing/billing.resolver";
import { patientResolvers } from "../../modules/patient/patient.resolver";

export const typeDefs = `#graphql
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

  

  type AuthPayload {
    token: String!
    user: AuthUser!
  }

  type AuthUser {
    id: ID!
    email: String!
    role: String!
  }

  type Invoice {
    id: ID!
    amount: Float!
    status: String!
    issueDate: String!
  }

  type Query {
    healthCheck: String!
    getAllPatients: [Patient]
    getPatientById(id: ID!): Patient
    myInvoices: [Invoice]
  }

  type Mutation {
    registerPatient(input: CreatePatientInput!): Patient
    login(email: String!, password: String!): AuthPayload
    payInvoice(invoiceId: ID!): Invoice
  }

  
`;

// Merge all our different module resolvers!
export const resolvers = {
  Query: {
    healthCheck: () => "🚀 Enterprise ADS Dental Surgery API is online!",

    // "spread" all the Patient queries into this main Query object
    ...patientResolvers.Query,
    ...billingResolvers.Query,
  },
  Mutation: {
    // "spread" all the Patient mutations into this main Mutation object
    ...patientResolvers.Mutation,
    ...authResolvers.Mutation,
    ...billingResolvers.Mutation,
  },
};
