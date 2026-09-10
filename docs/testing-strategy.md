# Laboratory Management System Testing Strategy

## Objective
This strategy verifies that the Laboratory Management System (LMS) protects patient data, preserves clinical workflow integrity, and enforces authorization before any sensitive operation.

## Testing principles
- Test real behavior rather than mocked business rules.
- Verify backend authorization for every sensitive action, not just UI gating.
- Prefer deterministic fixtures for patient, order, sample, and audit scenarios.
- Run every workflow through the same validation and persistence layer used in production.
- Keep security regressions visible with automated tests for auth, RBAC, and rate limiting.

## Test pyramid
### 1. Unit tests
Cover pure logic and validation in isolation:
- JWT secret enforcement
- RBAC permission checks
- Patient validation
- Order total calculation
- Sample status transitions
- Duplicate detection rules

### 2. Integration tests
Exercise service-layer behavior with real application logic and domain data:
- Patient registration with duplicate detection
- Order creation from a valid patient and test list
- Sample collection and rejection lifecycle
- Audit event recording for each mutation

### 3. API tests
Validate endpoint behavior for auth and sensitive operations:
- Login success and invalid-credential failure
- Rate limiting on repeated login attempts
- Authenticated user retrieval
- Protected routes returning 401/403 without valid sessions

### 4. Authentication tests
Verify the system only accepts valid credentials and that secrets are required in production:
- valid admin credentials
- invalid credentials rejected
- JWT secret must be configured in production
- session cookie validation for protected API routes

### 5. Authorization and RBAC tests
Confirm that role membership controls access:
- Super Admin can access admin operations
- Receptionist can register patients and orders but not user administration
- Lab Technician can manage samples and results but not patient records
- Pathologist/Doctor can verify results and reports
- Accountant can read billing and report data only

### 6. Database and persistence tests
Check correctness of the application’s data model and invariants:
- patient uniqueness checks
- sample status transitions and history append-only behavior
- audit log append-only expectation
- duplicate patient queries do not allow conflicting records

### 7. Form validation tests
Validate user input before persistence:
- missing patient first/last name
- invalid email format
- order without tests
- sample without collector or collection location
- rejection without a reason for rejected samples

### 8. End-to-end workflow tests
Execute the most important clinical flows end-to-end:
1. Patient registration
2. Laboratory order creation
3. Sample collection
4. Sample rejection

## Critical workflow coverage
### Patient registration
- Validate required fields and format
- Reject duplicates by phone and date of birth
- Persist a patient number and registration timestamp

### Laboratory order creation
- Require a valid patient and at least one test
- Calculate payment total and status
- Record the order and audit log event

### Sample collection
- Create a sample with unique ID and barcode
- Validate collector and location data
- Update status and append a history entry

### Sample rejection
- Require a rejection reason
- Mark sample as Rejected with history entry
- Record audit metadata for the rejection action

## Recommended automation
- Run unit and integration tests in PR checks
- Run API and auth tests for every change to protected routes
- Run workflow smoke tests in CI before deployment
- Run a production-like build check before release

## Coverage targets
- Unit tests: 90%+ of service logic
- API tests: 100% of auth and sensitive routes
- RBAC tests: every role/permission matrix entry
- Clinical workflow tests: all priority workflows above
