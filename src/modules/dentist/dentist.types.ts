export const dentistTypeDefs = `#graphql
  type Dentist {
    id: ID!
    firstName: String!
    lastName: String!
    email: String!
    specialization: String!
  }

  input CreateDentistInput {
    firstName: String!
    lastName: String!
    email: String!
    password: String!
    specialization: String!
  }

  extend type Query {
    getDentists: [Dentist!]!
    getDentist(id: ID!): Dentist
    getPatientsForDentist(dentistId: ID!): [Patient!]!
  }

  extend type Mutation {
    createDentist(input: CreateDentistInput!): Dentist
  }
`;
