export const analyticsTypeDefs = `#graphql
  type ClinicStats {
    totalAppointments: Int!
    totalRevenue: Float!
    unpaidInvoicesCount: Int!
    topDentistName: String!
  }

  extend type Query {
    getClinicStats: ClinicStats!
  }
`;
