export const surgeryTypeDefs = `#graphql
  type Surgery {
    id: ID!
    name: String!
    locationAddress: String!
    telephoneNumber: String!
  }

  input CreateSurgeryInput {
    name: String!
    locationAddress: String!
    telephoneNumber: String!
  }

  extend type Query {
    getSurgeries: [Surgery!]!
  }

  extend type Mutation {
    createSurgery(input: CreateSurgeryInput!): Surgery
  }
`;
