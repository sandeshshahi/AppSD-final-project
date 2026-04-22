export const billingTypeDefs = `#graphql
  type Invoice {
    id: ID!
    amount: Float!
    status: String!
    issueDate: String!
  }

  extend type Query {
    myInvoices: [Invoice]
  }

  extend type Mutation {
    payInvoice(invoiceId: ID!): Invoice
  }

`;
