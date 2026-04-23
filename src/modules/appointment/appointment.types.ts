export const appointmentTypeDefs = `#graphql

  type Dentist {
    id: ID!
    firstName: String!
    lastName: String!
    specialization: String!
  }

  type Surgery {
    id: ID!
    name: String!
    location: String!
  }

  type Appointment {
      id: ID!
      appointmentDate: String!
      appointmentTime: String!
      status: String!
      patient: Patient
      dentist: Dentist
      surgery: Surgery
      invoice: Invoice
  }

  input BookAppointmentInput {
      patientId: ID!
      dentistId: ID!
      surgeryId: ID!
      appointmentDate: String!
      appointmentTime: String!
  }

  extend type Query {
    getAllAppointments: [Appointment]
    getPatientAppointments(patientId: ID!): [Appointment]
  }

  extend type Mutation {
    bookAppointment(input: BookAppointmentInput!): Appointment
  }
`;
