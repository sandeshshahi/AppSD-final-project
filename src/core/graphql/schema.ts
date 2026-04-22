import { appointmentResolvers } from "../../modules/appointment/appointment.resolver";
import { authResolvers } from "../../modules/auth/auth.resolver";
import { billingResolvers } from "../../modules/billing/billing.resolver";
import { patientResolvers } from "../../modules/patient/patient.resolver";

import { patientTypeDefs } from "../../modules/patient/patient.types";
import { authTypeDefs } from "../../modules/auth/auth.types";
import { billingTypeDefs } from "../../modules/billing/billing.types";
import { appointmentTypeDefs } from "../../modules/appointment/appointment.types";
import { dentistTypeDefs } from "../../modules/dentist/dentist.types";
import { dentistResolvers } from "../../modules/dentist/dentist.resolver";
import { surgeryTypeDefs } from "../../modules/surgery/surgery.types";
import { surgeryResolvers } from "../../modules/surgery/surgery.resolver";
import { analyticsTypeDefs } from "../../modules/analytics/analytics.types";
import { analyticsResolvers } from "../../modules/analytics/analytics.resolver";

const baseTypeDefs = `#graphql
  type Query {
    healthCheck: String!
  }

  type Mutation {
    _empty: String  
  } 
`;

export const typeDefs = [
  baseTypeDefs,
  patientTypeDefs,
  authTypeDefs,
  billingTypeDefs,
  appointmentTypeDefs,
  dentistTypeDefs,
  surgeryTypeDefs,
  analyticsTypeDefs,
];

// Merge all our different module resolvers!
export const resolvers = {
  Query: {
    healthCheck: () => "Enterprise ADS Dental Surgery API is online!",

    // "spread" all the Patient queries into this main Query object
    ...patientResolvers.Query,
    ...billingResolvers.Query,
    ...appointmentResolvers.Query,
    ...dentistResolvers.Query,
    ...surgeryResolvers.Query,
    ...analyticsResolvers.Query,
  },
  Mutation: {
    // "spread" all the Patient mutations into this main Mutation object
    ...patientResolvers.Mutation,
    ...authResolvers.Mutation,
    ...billingResolvers.Mutation,
    ...appointmentResolvers.Mutation,
    ...dentistResolvers.Mutation,
    ...surgeryResolvers.Mutation,
  },
};
