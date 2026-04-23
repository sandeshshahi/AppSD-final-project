# Enterprise ADS Dental Surgery API

A modular, secure, and testable backend system for managing a dental surgery clinic.  
Built with **TypeScript**, **Node.js**, **Express 5**, **Apollo GraphQL**, and **TypeORM**.

---

## 1) Project Overview

### Problem Statement

Dental clinics often manage patients, appointments, billing, and medical images (X-Rays) across disconnected tools or manual processes. This creates operational inefficiency, billing errors, and weak access control to sensitive medical records.

### Proposed Solution

Build an **enterprise-grade backend API** that centralizes:

- Patient registration and profile management
- Appointment scheduling
- Billing and invoice tracking
- X-Ray upload and retrieval
- Authentication and authorization by role
- Analytics for clinic monitoring

---

## 2) Functional Scope and Use Cases

### Core Features

- **Authentication**
  - Login with JWT
  - Role-based access (PATIENT, DENTIST, OFFICE_MANAGER)
- **Patient Management**
  - Register patient
  - Fetch patient details
- **Appointment Management**
  - Book and track appointments
- **Billing**
  - Create invoices
  - Pay invoices
  - Retrieve patient invoices
- **X-Ray Management**
  - Upload via Cloudinary
  - Restrict visibility by ownership and role
- **Analytics**
  - Revenue, unpaid invoices, patient counts, top dentist

### Key Use Cases

1. Patient signs up and logs in.
2. Dentist books/handles appointments.
3. Office manager creates and monitors invoices.
4. Patient views only their own X-Rays and invoices.
5. Management checks clinic stats dashboard.

---

## 3) Static Model (Main Domain Class Diagram)

![Main Domain Class Diagram](<./docs/images/Static%20Model%20(Main%20Domain%20Class%20Diagram).png>)

---

## 4) Solution Architecture Diagram

![Solution Architecture Diagram](./docs/images/Solution%20Architecture%20Diagram.png)

### Architecture Notes

- **Presentation Layer:** GraphQL API (Apollo + Express)
- **Application Layer:** Resolvers + Service classes
- **Data Layer:** TypeORM entities/repositories
- **External Services:** Cloudinary for media, mail utility for notifications
- **Security Layer:** JWT-based auth + role checks + ownership rules

---

## 5) Database Design Model (E-R Diagram)

![Database Design Model (E-R Diagram)](<./docs/images/Static%20Model%20(Main%20Domain%20Class%20Diagram).png>)

---

## 6) Design Approach

### Design Principles

- **Modular by feature** (`modules/patient`, `modules/auth`, etc.)
- **Separation of concerns** (resolver vs service vs entity)
- **Test-first support** (unit + integration tests)
- **Security-by-default** (auth checks at resolver layer)

### Design Patterns Used

- **Repository Pattern** via TypeORM repositories
- **Service Layer Pattern** for business logic orchestration
- **Resolver Pattern** for GraphQL endpoint handlers
- **DTO Validation Pattern** using `class-validator`
- **Dependency Injection (constructor-based)** in analytics service for testability
- **Facade-style entrypoint** (`bootstrap` in `index.ts`) to wire dependencies

---

## 7) Folder Structure

```text
src/
  index.ts
  config/
    database.ts
  core/
    errors/
    graphql/
      schema.ts
    middleware/
      auth.guard.ts
    utils/
      cloudinary.ts
      id.util.ts
      mailer.ts
  modules/
    analytics/
    appointment/
    auth/
    billing/
    dentist/
    patient/
    surgery/
```

### Structure Rationale

- `core/`: shared platform concerns (middleware, errors, utils, schema composition)
- `modules/`: bounded contexts containing entity, service, resolver, types, tests

---

## 8) Enterprise Technology and Implementation

- **Language:** TypeScript
- **API:** GraphQL (Apollo Server)
- **HTTP Server:** Express 5
- **ORM:** TypeORM
- **Databases:** MySQL (runtime), SQLite in-memory (tests)
- **Auth:** JWT
- **Validation:** class-validator DTOs
- **Media:** Cloudinary integration
- **Testing:** Jest + ts-jest (unit + integration)
- **Containerization:** Docker
- **Orchestration artifact:** Kubernetes MySQL YAML manifest

---

## 9) Security Implementation

- JWT token generation on signup/login
- Context-based auth extraction (`Authorization: Bearer <token>`)
- Role-based authorization checks in resolvers
- Ownership checks for patient-private records (e.g., X-Rays)
- Standardized error handling for forbidden/not-found scenarios

---

## 10) DTO and Validation

Implemented DTOs in patient flow:

- `CreatePatientDTO`
- `AddressDTO`

Validation ensures:

- Correct email format
- Required data integrity
- Clean input boundary before persistence

---

## 11) Testing Strategy

### Unit Tests

- `patient.dto.spec.ts`
  - Valid/invalid DTO validation rules

### Integration Tests

- Auth, Patient, Appointment, Billing, Dentist, Surgery, Analytics, X-Ray modules
- In-memory SQLite setup for fast isolation
- Includes business rules + role/ownership checks

---

## 12) Git/GitHub and Team Workflow

### Recommended Branching

- `main` for stable releases
- `feature/<module-name>` for new work
- PR-based merge with test pass required

### Commit Convention

- `feat(module): ...`
- `fix(module): ...`
- `refactor(module): ...`
- `test(module): ...`
- `docs: ...`

---

## 13) CI/CD and Automation

Current repo has test automation via Jest scripts.  
Recommended CI pipeline (GitHub Actions) should run on every push/PR:

1. Install dependencies
2. Run lint (if configured)
3. Run unit/integration tests
4. Build TypeScript
5. Build Docker image
6. Deploy (optional environment gate)

---

## 14) Deployment Model

### Available Deployment Artifacts

- `Dockerfile` for container build
- `mysql-k8s.yaml` for MySQL deployment/service on Kubernetes

### Runtime Flow

- App container runs GraphQL API
- MySQL service provides persistent data storage
- External services (Cloudinary/email) configured via environment variables

---

## 15) Communication and Project/Time Management

### Suggested Delivery Plan

- **Phase 1:** Requirements + domain modeling
- **Phase 2:** Core modules (auth, patient, appointment)
- **Phase 3:** Billing + analytics + media upload
- **Phase 4:** Testing hardening + deployment artifacts
- **Phase 5:** Documentation + final demo

### Tracking

- Weekly milestone board (To Do / In Progress / Done)
- Issue-based development with module tags
- Sprint demo after each completed module cluster

---

## 16) How to Run

### Local Development

```bash
npm install
npm run dev
```

### Tests

```bash
npm test
```

### Production Build

```bash
npm run build
npm start
```

### Docker

```bash
docker build -t final-project-api .
docker run -p 4000:4000 --env-file .env final-project-api
```

---

## 17) Demo Flow (Presentation Guide)

1. Login as Office Manager and show role-based capabilities
2. Register or fetch patient
3. Book an appointment
4. Create/pay invoice and show billing records
5. Upload X-Ray as dentist
6. Attempt unauthorized access as patient (show security block)
7. Show analytics summary endpoint
8. Show test run (`npm test`) and architecture/ER diagrams

---

## 18) Conclusion

This backend demonstrates an enterprise-style architecture with:

- modular design,
- secure authentication/authorization,
- DTO validation,
- automated testing,
- and cloud/deployment readiness through Docker and Kubernetes artifacts.
