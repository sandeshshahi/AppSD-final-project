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

  extend type Mutation {
    login(email: String!, password: String!): AuthPayload
  }
`;
