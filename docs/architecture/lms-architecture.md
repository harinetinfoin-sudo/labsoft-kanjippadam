# Laboratory Management System (LMS) Architecture

## 1. Architectural goals

The LMS is designed as a modular, secure, type-safe, and scalable platform.

Key goals:
- Clear separation between UI, API, business logic, and persistence
- Type-safe access across frontend and backend using TypeScript
- Secure authentication and RBAC enforcement
- Modular services and reusable validation logic
- PostgreSQL as the source of truth
- Prisma for database access and migrations
- Environment-driven configuration for secrets and deployment settings
- Docker-ready deployment model

---

## 2. Proposed architecture

### 2.1 Layered application architecture

The application is structured into the following layers:

1. Presentation layer
   - Next.js app router pages
   - Server components and client components
   - Reusable UI components
   - Role-aware views and forms

2. API layer
   - Next.js route handlers or Express endpoints
   - Request validation using Zod
   - Authentication middleware
   - RBAC guard checks
   - Error formatting and structured logging

3. Business logic layer
   - Service modules for auth, users, patients, orders, results, inventory, billing, reporting
   - Domain validation and workflow enforcement
   - No duplicated business logic across controllers and UI

4. Data access layer
   - Prisma ORM
   - Repository/service abstractions over Prisma client
   - Transactional workflows for sensitive operations

5. Persistence layer
   - PostgreSQL database
   - UUID primary keys, indexes, constraints, audit tables

6. Infrastructure layer
   - Environment variables
   - Docker/containerization
   - logging, monitoring, secret management
   - optional Redis for sessions/caching

---

## 3. Folder structure

```text
labsoft/
├── prisma/
│   ├── schema.prisma
│   └── migrations/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── auth/
│   │   │   │   ├── login/
│   │   │   │   ├── logout/
│   │   │   │   ├── refresh/
│   │   │   │   ├── forgot-password/
│   │   │   │   ├── reset-password/
│   │   │   │   └── me/
│   │   │   ├── users/
│   │   │   ├── patients/
│   │   │   ├── doctors/
│   │   │   ├── orders/
│   │   │   ├── tests/
│   │   │   ├── inventory/
│   │   │   ├── billing/
│   │   │   └── reports/
│   │   ├── dashboard/
│   │   ├── login/
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── components/
│   │   ├── ui/
│   │   ├── layout/
│   │   ├── forms/
│   │   ├── tables/
│   │   └── dashboard/
│   ├── features/
│   │   ├── auth/
│   │   │   ├── components/
│   │   │   ├── hooks/
│   │   │   ├── services/
│   │   │   ├── schemas/
│   │   │   └── utils/
│   │   ├── patients/
│   │   ├── orders/
│   │   ├── inventory/
│   │   └── reports/
│   ├── lib/
│   │   ├── prisma.ts
│   │   ├── auth.ts
│   │   ├── logger.ts
│   │   ├── env.ts
│   │   ├── constants.ts
│   │   └── utils.ts
│   ├── server/
│   │   ├── services/
│   │   │   ├── auth-service.ts
│   │   │   ├── user-service.ts
│   │   │   ├── patient-service.ts
│   │   │   └── ...
│   │   ├── repositories/
│   │   ├── validators/
│   │   ├── middleware/
│   │   └── guards/
│   ├── hooks/
│   │   ├── use-auth.ts
│   │   ├── use-users.ts
│   │   └── use-api.ts
│   ├── schemas/
│   │   ├── auth.schema.ts
│   │   ├── patient.schema.ts
│   │   ├── order.schema.ts
│   │   └── ...
│   ├── types/
│   │   ├── api.ts
│   │   ├── auth.ts
│   │   └── domain.ts
│   └── styles/
│       └── globals.css
├── .env
├── .env.example
├── docker-compose.yml
├── Dockerfile
├── next.config.ts
├── tsconfig.json
├── package.json
├── README.md
└── eslint.config.mjs
```

---

## 4. Responsibilities by layer

### Presentation layer
- Renders pages and forms
- Uses reusable components and hooks
- Performs client-side validation via React Hook Form + Zod
- Calls API endpoints
- Shows loading/error/success states

### API layer
- Validates request payloads
- Calls correct service methods
- Enforces authentication and authorisation
- Maps domain errors into clean API responses
- Emits audit log entries for mutations

### Business logic layer
- Enforces workflow rules
- Validates domain-specific constraints
- Prevents duplicates
- Coordinates related services and database transactions

### Data access layer
- Prisma handles DB interactions
- Shared repositories centralize access patterns
- Do not access Prisma directly from UI or routes

---

## 5. Authentication and security strategy

### Authentication model
Recommended secure approach:
- JWT access token for API calls
- Refresh token stored securely with rotation
- HTTP-only cookies for refresh tokens when browser-based
- session tracking in database for logout/revocation

### Password security
- Argon2 or bcrypt hashing
- Never store plaintext passwords
- Use strong password policy enforcement

### RBAC enforcement
- Permissions are assigned to roles
- User-to-role relationship via user_roles
- Authorization checks performed server-side
- Policies defined per module and action

### Validation and error handling
- Zod validates all external inputs
- Shared validation schemas reused by forms and API
- Uniform API error envelope for all endpoints
- Centralized logging and audit trail

---

## 6. Folder-level architecture guidance

### ui and features separation
- UI components should not contain business logic
- Domain logic moves into services and validators
- Reusable form components belong under components/ui or features/*/components
- Feature-specific logic should be grouped under src/features/<feature>

### Reuse principles
- Shared validation: src/schemas
- Shared services: src/server/services
- Shared auth logic: src/lib/auth.ts and src/server/services/auth-service.ts
- Shared HTTP types: src/types/api.ts
- Shared constants and enums: src/lib/constants.ts

### Rule: no duplication
- Create one source of truth for permission keys, status enums, and user roles
- Reuse validation schema across frontend forms and backend API routes
- Centralize audit logging for writes

---

## 7. Recommended technology stack

- Frontend: Next.js, React, TypeScript, Tailwind CSS
- UI components: shadcn/ui or equivalent
- Backend: Next.js route handlers or Express.js in a separate API service
- Database: PostgreSQL
- ORM: Prisma
- Validation: Zod
- Forms: React Hook Form
- Auth: JWT + secure refresh-token strategy
- Password hashing: bcrypt or Argon2
- Logging: structured logger
- Env config: dotenv / environment variables
- Containerization: Docker + Docker Compose

---

## 8. Architecture approval

This architecture is appropriate for the LMS because it:
- keeps frontend and backend responsibilities clear
- supports scalable database modeling
- promotes security and RBAC enforcement
- allows clean code reuse and maintainability
- supports future extensions such as reports, billing, inventory, notifications, and audit analysis

The design is approved to proceed to database modeling and authentication/user-management implementation.
