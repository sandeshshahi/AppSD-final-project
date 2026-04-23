export const billingTypeDefs = `#graphql
  type Invoice {
    id: ID!
    amount: Float!
    status: String!
    issueDate: String!
    patient: Patient
  }

  extend type Query {
    myInvoices: [Invoice]
    getAllInvoices: [Invoice]
  }

  extend type Mutation {
    payInvoice(invoiceId: ID!): Invoice
    createInvoice(appointmentId: ID!, amount: Float!): Invoice
  }

`;
