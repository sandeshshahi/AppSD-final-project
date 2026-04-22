export const authTypeDefs = `#graphql
  type AuthPayload {
    token: String!
    user: AuthUser!
  }

  type AuthUser {
    id: ID!
    email: String!
    role: String!
  }

  input SignUpInput {
    firstName: String!
    lastName: String!
    email: String!
    password: String!
    contactPhone: String
  }

  extend type Mutation {
    login(email: String!, password: String!): AuthPayload
    
    signUp(input: SignUpInput!): Patient
  }
`;
