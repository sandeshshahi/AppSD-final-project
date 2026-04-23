export const analyticsTypeDefs = `#graphql
  type ClinicStats {
    totalPatients: Int!
    totalAppointments: Int!
    totalRevenue: Float!
    unpaidInvoicesCount: Int!
    topDentistName: String!
  }

  extend type Query {
    getClinicStats: ClinicStats!
  }
`;
