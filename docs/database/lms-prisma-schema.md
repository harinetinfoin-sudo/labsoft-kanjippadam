# LMS Database Design and Prisma Schema

## 1. ER diagram description

The database is designed around a normalized clinical operations model, where each domain owns a clear set of entities and relationships.

### Core operational flow

- Users authenticate and receive roles via the role model.
- Patients are registered and may have multiple contact records.
- Doctors belong to departments and can be linked to patient referrals and orders.
- Laboratory orders are created for patients and doctors.
- Each order contains one or more order items for tests or packages.
- Samples are grouped under biological specimen types and are collected through sample collection events.
- Sample status history tracks every state transition.
- Test results are recorded for each sample and each test parameter.
- Result attachments support uploaded evidence or reports.
- Reports are generated from test results and verified by authorized users.
- Invoices are generated from order data and are linked to payment records.
- Inventory and stock transactions track consumables, purchases, and equipment usage.
- Audit logs capture all sensitive or operationally relevant data changes.
- Notifications support internal alerts and patient updates.
- System settings are used for configuration and operational policy.

### Relationship summary

- One user has many user_roles.
- One role has many user_roles and many permissions through role_permissions.
- One patient has many patient_contacts and many laboratory_orders.
- One doctor belongs to one department and may have many orders.
- One test_category contains many tests.
- One test may belong to one category and many test_parameters and package_tests.
- One test_package contains many package_tests.
- One laboratory_order contains many order_items and samples.
- One sample belongs to one sample_type and one order, and has many status history records and results.
- One result can have many result_parameters and result_attachments.
- One report_template produces many laboratory_reports.
- One laboratory_report can have many report_verifications.
- One invoice has many invoice_items and payments.
- One inventory_category contains many inventory_items.
- One supplier may have many purchase_orders and inventory_items.
- One machine/equipment belongs to a department and may be linked to stock transactions or sample processing.
- Audit logs and notifications may reference any entity via polymorphic-style keys.

---

## 2. Table-by-table explanation

### 2.1 users
Stores identity, account state, and authentication metadata.

Required fields:
- id: UUID
- email: unique email
- passwordHash: hashed secret
- firstName
- lastName
- isActive
- createdAt
- updatedAt

Optional fields:
- phone
- avatarUrl
- lastLoginAt
- deletedAt
- passwordResetToken
- passwordResetExpiresAt
- emailVerifiedAt

Unique constraints:
- email

Indexes:
- email
- isActive
- lastLoginAt

Soft delete:
- deletedAt

---

### 2.2 roles
Stores authorization roles.

Required fields:
- id
- name (unique)
- createdAt
- updatedAt

Optional:
- description
- isSystem
- deletedAt

Unique:
- name

---

### 2.3 permissions
Stores permission keys and descriptions.

Required:
- id
- key (unique)
- createdAt
- updatedAt

Optional:
- description
- category
- deletedAt

---

### 2.4 user_roles
Junction table between users and roles.

Required:
- id
- userId
- roleId
- createdAt

Optional:
- assignedBy
- expiresAt
- deletedAt

Unique:
- userId + roleId

Indexes:
- userId
- roleId

---

### 2.5 patient_contacts
Stores contact records and emergency contact information for patients.

Required:
- id
- patientId
- contactType
- value
- createdAt

Optional:
- label
- isPrimary
- notes
- deletedAt

Unique:
- patientId + contactType + value

---

### 2.6 patients
Represents the registered patient.

Required:
- id
- patientNumber (unique)
- firstName
- lastName
- dateOfBirth
- gender
- createdAt
- updatedAt

Optional:
- phone
- email
- address
- city
- state
- country
- emergencyContactName
- emergencyContactPhone
- nationalId
- allergies
- notes
- deletedAt

Indexes:
- patientNumber
- firstName, lastName
- email

---

### 2.7 doctors
Represents referring doctors or internal physicians.

Required:
- id
- doctorNumber (unique)
- firstName
- lastName
- departmentId
- createdAt
- updatedAt

Optional:
- specialty
- qualification
- phone
- email
- consultationFee
- licenseNumber
- address
- isActive
- deletedAt

Indexes:
- departmentId
- doctorNumber
- email

---

### 2.8 departments
Stores lab departments or clinical service areas.

Required:
- id
- name (unique)
- createdAt
- updatedAt

Optional:
- code
- description
- isActive
- deletedAt

---

### 2.9 test_categories
Nested groups for tests.

Required:
- id
- name
- createdAt
- updatedAt

Optional:
- code
- description
- parentCategoryId
- isActive
- deletedAt

Unique:
- name or code depending on business rule

---

### 2.10 tests
Defines the catalog of laboratory tests.

Required:
- id
- code (unique)
- name
- categoryId
- departmentId
- createdAt
- updatedAt

Optional:
- shortName
- description
- unit
- price
- turnaroundHours
- isActive
- deletedAt

Indexes:
- categoryId
- departmentId
- code
- isActive

---

### 2.11 test_parameters
Defines parameter names used in a test result.

Required:
- id
- testId
- parameterName
- createdAt

Optional:
- unit
- displayOrder
- description
- isRequired
- deletedAt

Unique:
- testId + parameterName

---

### 2.12 test_reference_ranges
Stores normal ranges for a test parameter.

Required:
- id
- testId
- parameterName
- gender
- minValue
- maxValue
- unit
- createdAt

Optional:
- ageMin
- ageMax
- notes
- isActive
- deletedAt

Indexes:
- testId
- parameterName

---

### 2.13 test_packages
Bundles tests into profiles or panels.

Required:
- id
- code (unique)
- name
- price
- createdAt
- updatedAt

Optional:
- description
- isActive
- deletedAt

---

### 2.14 package_tests
Junction between test packages and tests.

Required:
- id
- packageId
- testId
- createdAt

Optional:
- quantity
- discount
- deletedAt

Unique:
- packageId + testId

---

### 2.15 laboratory_orders
Main order table for lab requests.

Required:
- id
- orderNumber (unique)
- patientId
- doctorId
- createdBy
- status
- createdAt
- updatedAt

Optional:
- preferredCollectionDate
- priority
- notes
- totalAmount
- paymentStatus
- deletedAt

Indexes:
- patientId
- doctorId
- status
- createdAt

---

### 2.16 order_items
Each order item is a test or package line.

Required:
- id
- orderId
- testId or packageId
- quantity
- unitPrice
- totalPrice
- createdAt

Optional:
- discount
- notes
- deletedAt

Indexes:
- orderId
- testId
- packageId

---

### 2.17 samples
Represents a specimen collected from a patient/order.

Required:
- id
- sampleNumber (unique)
- orderId
- patientId
- sampleTypeId
- status
- createdAt
- updatedAt

Optional:
- collectedBy
- collectedAt
- receivedAt
- rejectedAt
- rejectionReason
- storageLocation
- notes
- deletedAt

Indexes:
- orderId
- patientId
- sampleTypeId
- status

---

### 2.18 sample_types
Catalog of specimen types.

Required:
- id
- name (unique)
- createdAt

Optional:
- description
- isActive
- deletedAt

---

### 2.19 sample_collections
Tracks collection events with time and collector details.

Required:
- id
- sampleId
- collectedBy
- collectedAt
- createdAt

Optional:
- collectionMethod
- labelNumber
- notes
- location
- deletedAt

Indexes:
- sampleId
- collectedBy

---

### 2.20 sample_status_history
Immutable event history for sample status changes.

Required:
- id
- sampleId
- previousStatus
- newStatus
- changedBy
- changedAt

Optional:
- notes

Indexes:
- sampleId
- changedAt

---

### 2.21 test_results
Stores final result entries for a sample/test.

Required:
- id
- sampleId
- testId
- status
- createdBy
- createdAt

Optional:
- verifiedBy
- verifiedAt
- notes
- completedAt
- deletedAt

Indexes:
- sampleId
- testId
- status

---

### 2.22 result_parameters
Stores measured parameter values for a result.

Required:
- id
- resultId
- parameterName
- value
- createdAt

Optional:
- unit
- referenceRange
- abnormalFlag
- interpretation
- deletedAt

Indexes:
- resultId
- parameterName

---

### 2.23 result_attachments
Files or scans associated with a result.

Required:
- id
- resultId
- fileName
- fileUrl
- fileType
- uploadedBy
- createdAt

Optional:
- sizeBytes
- description
- deletedAt

Indexes:
- resultId
- uploadedBy

---

### 2.24 report_templates
Template definitions for generated reports.

Required:
- id
- name (unique)
- body
- createdBy
- createdAt

Optional:
- description
- isActive
- deletedAt

---

### 2.25 laboratory_reports
Generated clinical reports.

Required:
- id
- reportNumber (unique)
- orderId
- patientId
- templateId
- status
- generatedBy
- createdAt

Optional:
- generatedAt
- verifiedAt
- approvedBy
- releasedAt
- fileUrl
- notes
- deletedAt

Indexes:
- orderId
- patientId
- status

---

### 2.26 report_verifications
Verification trail for reports.

Required:
- id
- reportId
- verifiedBy
- verificationStatus
- verifiedAt

Optional:
- comments

Indexes:
- reportId
- verifiedBy

---

### 2.27 invoices
Finance records for orders or accounts.

Required:
- id
- invoiceNumber (unique)
- patientId
- orderId
- totalAmount
- status
- issuedBy
- createdAt

Optional:
- dueDate
- paidAmount
- notes
- deletedAt

Indexes:
- patientId
- orderId
- status

---

### 2.28 invoice_items
Breakdown of invoice charges.

Required:
- id
- invoiceId
- description
- quantity
- unitPrice
- totalPrice
- createdAt

Optional:
- itemType
- itemReferenceId
- taxAmount
- discountAmount

Indexes:
- invoiceId

---

### 2.29 payments
Payments against invoices.

Required:
- id
- invoiceId
- patientId
- amount
- paymentMethod
- receivedBy
- transactionDate

Optional:
- referenceNumber
- status
- notes
- deletedAt

Indexes:
- invoiceId
- patientId
- transactionDate

---

### 2.30 inventory_categories
Category grouping for inventory items.

Required:
- id
- name (unique)
- createdAt

Optional:
- description
- deletedAt

---

### 2.31 inventory_items
Stores stock items and reagents.

Required:
- id
- itemCode (unique)
- name
- categoryId
- unit
- reorderLevel
- quantityOnHand
- createdAt
- updatedAt

Optional:
- supplierId
- location
- costPerUnit
- expiryDate
- isActive
- deletedAt

Indexes:
- categoryId
- supplierId
- itemCode
- quantityOnHand

---

### 2.32 suppliers
Supplier master list.

Required:
- id
- name
- createdAt

Optional:
- contactPerson
- phone
- email
- address
- tinNumber
- isActive
- deletedAt

---

### 2.33 purchase_orders
Purchase orders for procuring inventory.

Required:
- id
- poNumber (unique)
- supplierId
- status
- createdBy
- createdAt

Optional:
- expectedDate
- receivedDate
- notes
- deletedAt

Indexes:
- supplierId
- status

---

### 2.34 stock_transactions
Movement of inventory stock.

Required:
- id
- inventoryItemId
- transactionType
- quantity
- transactionDate
- createdBy

Optional:
- referenceType
- referenceId
- remarks

Indexes:
- inventoryItemId
- transactionDate
- transactionType

---

### 2.35 machines_equipment
Stores laboratory equipment metadata.

Required:
- id
- name
- departmentId
- status
- createdAt

Optional:
- serialNumber
- modelNumber
- manufacturer
- purchaseDate
- maintenanceDate
- calibrationDate
- location
- isActive
- deletedAt

Indexes:
- departmentId
- status

---

### 2.36 audit_logs
Immutable log of significant actions.

Required:
- id
- entityType
- entityId
- action
- actorId
- createdAt

Optional:
- ipAddress
- userAgent
- oldValues
- newValues
- notes

Indexes:
- actorId
- entityType
- createdAt

---

### 2.37 notifications
User or system notifications.

Required:
- id
- userId
- type
- message
- isRead
- createdAt

Optional:
- relatedEntityType
- relatedEntityId
- scheduledFor

Indexes:
- userId
- isRead
- createdAt

---

### 2.38 system_settings
Configuration values for the platform.

Required:
- id
- key (unique)
- value
- createdAt
- updatedAt

Optional:
- description
- isEncrypted
- encryptedValue
- deletedAt

---

## 3. Relationship explanation

### One-to-many
- Role to user_roles
- User to user_roles
- Department to doctors
- Test category to tests
- Department to tests
- Test to test_parameters
- Test to test_reference_ranges
- Test package to package_tests
- Order to order_items
- Order to samples
- Sample to sample_status_history
- Sample to test_results
- Result to result_parameters
- Result to result_attachments
- Template to laboratory_reports
- Patient to laboratory_orders
- Doctor to laboratory_orders
- Invoice to invoice_items
- Invoice to payments
- Inventory category to inventory_items
- Supplier to purchase_orders
- Inventory item to stock_transactions
- Department to machines_equipment
- User to notifications
- User to audit_logs

### Many-to-many
- Users <-> Roles via user_roles
- Tests <-> Test packages via package_tests
- Permissions <-> Roles via role_permissions (if a separate junction is used)

### Optional polymorphic-style references
- audit_logs can store entityType/entityId to reference multiple tables without creating separate audit tables.
- notifications may also store a relatedEntityType and relatedEntityId for cross-module links.

---

## 4. Prisma schema

```prisma
// prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id                  String       @id @default(uuid())
  email               String       @unique
  passwordHash        String
  firstName           String
  lastName            String
  phone               String?
  avatarUrl           String?
  isActive            Boolean      @default(true)
  lastLoginAt         DateTime?
  emailVerifiedAt     DateTime?
  passwordResetToken  String?
  passwordResetExpiresAt DateTime?
  createdAt           DateTime     @default(now())
  updatedAt           DateTime     @updatedAt
  deletedAt           DateTime?

  userRoles           UserRole[]
  createdAuditLogs    AuditLog[] @relation("AuditLogActor")
  notifications       Notification[]

  @@index([email])
  @@index([isActive])
}

model Role {
  id          String      @id @default(uuid())
  name        String      @unique
  description String?
  isSystem    Boolean     @default(false)
  createdAt   DateTime    @default(now())
  updatedAt   DateTime    @updatedAt
  deletedAt   DateTime?

  userRoles   UserRole[]
  permissions Permission[] @relation("RolePermissions")
}

model Permission {
  id          String    @id @default(uuid())
  key         String    @unique
  description String?
  category    String?
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
  deletedAt   DateTime?

  roles       Role[]    @relation("RolePermissions")
}

model UserRole {
  id        String    @id @default(uuid())
  userId    String
  roleId    String
  assignedBy String?
  expiresAt DateTime?
  createdAt DateTime  @default(now())
  deletedAt DateTime?

  user      User      @relation(fields: [userId], references: [id])
  role      Role      @relation(fields: [roleId], references: [id])

  @@unique([userId, roleId])
  @@index([userId])
  @@index([roleId])
}

model Patient {
  id                     String            @id @default(uuid())
  patientNumber          String            @unique
  firstName              String
  lastName               String
  dateOfBirth            DateTime?
  gender                 String?
  phone                  String?
  email                  String?
  address                String?
  city                   String?
  state                  String?
  country                String?
  emergencyContactName   String?
  emergencyContactPhone  String?
  nationalId             String?
  allergies              String?
  notes                  String?
  isActive               Boolean           @default(true)
  createdAt              DateTime          @default(now())
  updatedAt              DateTime          @updatedAt
  deletedAt              DateTime?

  contacts               PatientContact[]
  orders                 LaboratoryOrder[]

  @@index([patientNumber])
  @@index([email])
  @@index([firstName, lastName])
}

model PatientContact {
  id          String    @id @default(uuid())
  patientId   String
  contactType String
  value       String
  label       String?
  isPrimary   Boolean   @default(false)
  notes       String?
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
  deletedAt   DateTime?

  patient     Patient   @relation(fields: [patientId], references: [id])

  @@unique([patientId, contactType, value])
  @@index([patientId])
}

model Department {
  id          String    @id @default(uuid())
  name        String    @unique
  code        String?   @unique
  description String?
  isActive    Boolean   @default(true)
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
  deletedAt   DateTime?

  doctors     Doctor[]
  tests       Test[]
  equipment   MachineEquipment[]
}

model Doctor {
  id                String            @id @default(uuid())
  doctorNumber      String            @unique
  firstName         String
  lastName          String
  departmentId      String
  specialty         String?
  qualification     String?
  phone             String?
  email             String?
  consultationFee   Decimal?
  licenseNumber     String?
  address           String?
  isActive          Boolean           @default(true)
  createdAt         DateTime          @default(now())
  updatedAt         DateTime          @updatedAt
  deletedAt         DateTime?

  department        Department        @relation(fields: [departmentId], references: [id])
  orders            LaboratoryOrder[]

  @@index([departmentId])
  @@index([doctorNumber])
}

model TestCategory {
  id              String    @id @default(uuid())
  name            String    @unique
  code            String?   @unique
  description     String?
  parentCategoryId String?
  isActive        Boolean   @default(true)
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt
  deletedAt       DateTime?

  tests           Test[]
}

model Test {
  id              String    @id @default(uuid())
  code            String    @unique
  name            String
  shortName       String?
  description     String?
  categoryId      String
  departmentId    String
  unit            String?
  price           Decimal?
  turnaroundHours Int?
  isActive        Boolean   @default(true)
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt
  deletedAt       DateTime?

  category        TestCategory @relation(fields: [categoryId], references: [id])
  department      Department   @relation(fields: [departmentId], references: [id])
  parameters      TestParameter[]
  referenceRanges TestReferenceRange[]
  packageLinks    PackageTest[]
  orderItems      OrderItem[]
  results         TestResult[]

  @@index([categoryId])
  @@index([departmentId])
  @@index([isActive])
}

model TestParameter {
  id            String    @id @default(uuid())
  testId        String
  parameterName String
  unit          String?
  description   String?
  displayOrder  Int?
  isRequired    Boolean   @default(false)
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  deletedAt     DateTime?

  test          Test      @relation(fields: [testId], references: [id])

  @@unique([testId, parameterName])
  @@index([testId])
}

model TestReferenceRange {
  id          String    @id @default(uuid())
  testId      String
  parameterName String
  gender      String?
  ageMin      Int?
  ageMax      Int?
  minValue    Decimal?
  maxValue    Decimal?
  unit        String?
  notes       String?
  isActive    Boolean   @default(true)
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
  deletedAt   DateTime?

  test        Test      @relation(fields: [testId], references: [id])

  @@index([testId])
}

model TestPackage {
  id          String    @id @default(uuid())
  code        String    @unique
  name        String
  description String?
  price       Decimal
  isActive    Boolean   @default(true)
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
  deletedAt   DateTime?

  tests       PackageTest[]
}

model PackageTest {
  id         String      @id @default(uuid())
  packageId  String
  testId     String
  quantity   Int         @default(1)
  discount   Decimal?
  createdAt  DateTime    @default(now())
  deletedAt  DateTime?

  package    TestPackage @relation(fields: [packageId], references: [id])
  test       Test        @relation(fields: [testId], references: [id])

  @@unique([packageId, testId])
  @@index([packageId])
  @@index([testId])
}

model LaboratoryOrder {
  id                    String      @id @default(uuid())
  orderNumber           String      @unique
  patientId             String
  doctorId              String?
  createdBy             String
  status                String      @default("PENDING")
  priority              String?     @default("NORMAL")
  preferredCollectionDate DateTime?
  notes                 String?
  totalAmount           Decimal?
  paymentStatus         String?     @default("UNPAID")
  createdAt             DateTime    @default(now())
  updatedAt             DateTime    @updatedAt
  deletedAt             DateTime?

  patient               Patient     @relation(fields: [patientId], references: [id])
  doctor                Doctor?     @relation(fields: [doctorId], references: [id])
  items                 OrderItem[]
  samples               Sample[]
  reports               LaboratoryReport[]

  @@index([patientId])
  @@index([doctorId])
  @@index([status])
  @@index([createdAt])
}

model OrderItem {
  id          String      @id @default(uuid())
  orderId     String
  testId      String?
  packageId   String?
  quantity    Int         @default(1)
  unitPrice   Decimal
  totalPrice  Decimal
  discount    Decimal?
  notes       String?
  createdAt   DateTime    @default(now())
  deletedAt   DateTime?

  order       LaboratoryOrder @relation(fields: [orderId], references: [id])
  test        Test?           @relation(fields: [testId], references: [id])
  package     TestPackage?    @relation(fields: [packageId], references: [id])

  @@index([orderId])
  @@index([testId])
  @@index([packageId])
}

model SampleType {
  id          String    @id @default(uuid())
  name        String    @unique
  description String?
  isActive    Boolean   @default(true)
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
  deletedAt   DateTime?

  samples     Sample[]
}

model Sample {
  id                  String    @id @default(uuid())
  sampleNumber        String    @unique
  orderId             String
  patientId           String
  sampleTypeId        String
  status              String    @default("COLLECTED")
  collectedBy         String?
  collectedAt         DateTime?
  receivedAt          DateTime?
  rejectedAt          DateTime?
  rejectionReason     String?
  storageLocation     String?
  notes               String?
  createdAt           DateTime  @default(now())
  updatedAt           DateTime  @updatedAt
  deletedAt           DateTime?

  order               LaboratoryOrder @relation(fields: [orderId], references: [id])
  sampleType          SampleType      @relation(fields: [sampleTypeId], references: [id])
  statusHistory       SampleStatusHistory[]
  results             TestResult[]
  collections         SampleCollection[]

  @@index([orderId])
  @@index([patientId])
  @@index([sampleTypeId])
  @@index([status])
}

model SampleCollection {
  id              String    @id @default(uuid())
  sampleId        String
  collectedBy     String
  collectedAt     DateTime
  collectionMethod String?
  labelNumber     String?
  location        String?
  notes           String?
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt
  deletedAt       DateTime?

  sample          Sample    @relation(fields: [sampleId], references: [id])

  @@index([sampleId])
}

model SampleStatusHistory {
  id            String    @id @default(uuid())
  sampleId      String
  previousStatus String?
  newStatus     String
  changedBy     String
  changedAt     DateTime  @default(now())
  notes         String?

  sample        Sample    @relation(fields: [sampleId], references: [id])

  @@index([sampleId])
  @@index([changedAt])
}

model TestResult {
  id            String    @id @default(uuid())
  sampleId      String
  testId        String
  status        String    @default("PENDING")
  createdBy     String
  verifiedBy    String?
  verifiedAt    DateTime?
  completedAt   DateTime?
  notes         String?
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  deletedAt     DateTime?

  sample        Sample    @relation(fields: [sampleId], references: [id])
  test          Test      @relation(fields: [testId], references: [id])
  parameters    ResultParameter[]
  attachments   ResultAttachment[]

  @@index([sampleId])
  @@index([testId])
  @@index([status])
}

model ResultParameter {
  id            String    @id @default(uuid())
  resultId      String
  parameterName String
  value         String
  unit          String?
  referenceRange String?
  abnormalFlag  Boolean   @default(false)
  interpretation String?
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  deletedAt     DateTime?

  result        TestResult @relation(fields: [resultId], references: [id])

  @@index([resultId])
}

model ResultAttachment {
  id          String    @id @default(uuid())
  resultId    String
  fileName    String
  fileUrl     String
  fileType    String?
  sizeBytes   Int?
  description String?
  uploadedBy  String
  createdAt   DateTime  @default(now())
  deletedAt   DateTime?

  result      TestResult @relation(fields: [resultId], references: [id])

  @@index([resultId])
}

model ReportTemplate {
  id          String    @id @default(uuid())
  name        String    @unique
  description String?
  body        String
  createdBy   String
  isActive    Boolean   @default(true)
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
  deletedAt   DateTime?

  reports     LaboratoryReport[]
}

model LaboratoryReport {
  id            String    @id @default(uuid())
  reportNumber  String    @unique
  orderId       String
  patientId     String
  templateId    String
  status        String    @default("DRAFT")
  generatedBy   String
  generatedAt   DateTime?
  verifiedAt    DateTime?
  approvedBy    String?
  releasedAt    DateTime?
  fileUrl       String?
  notes         String?
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  deletedAt     DateTime?

  order         LaboratoryOrder @relation(fields: [orderId], references: [id])
  template      ReportTemplate @relation(fields: [templateId], references: [id])
  verifications ReportVerification[]

  @@index([orderId])
  @@index([patientId])
  @@index([status])
}

model ReportVerification {
  id                  String    @id @default(uuid())
  reportId            String
  verifiedBy          String
  verificationStatus  String
  comments            String?
  verifiedAt          DateTime  @default(now())

  report              LaboratoryReport @relation(fields: [reportId], references: [id])

  @@index([reportId])
  @@index([verifiedBy])
}

model Invoice {
  id            String    @id @default(uuid())
  invoiceNumber  String    @unique
  patientId      String
  orderId       String?
  totalAmount   Decimal
  status        String    @default("DRAFT")
  issuedBy      String
  dueDate       DateTime?
  paidAmount    Decimal?  @default(0)
  notes         String?
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  deletedAt     DateTime?

  items         InvoiceItem[]
  payments      Payment[]

  @@index([patientId])
  @@index([status])
}

model InvoiceItem {
  id            String    @id @default(uuid())
  invoiceId     String
  description   String
  itemType      String?
  itemReferenceId String?
  quantity      Int       @default(1)
  unitPrice     Decimal
  totalPrice    Decimal
  taxAmount     Decimal?
  discountAmount Decimal?
  createdAt     DateTime  @default(now())

  invoice       Invoice   @relation(fields: [invoiceId], references: [id])

  @@index([invoiceId])
}

model Payment {
  id              String    @id @default(uuid())
  invoiceId       String
  patientId       String
  amount          Decimal
  paymentMethod   String
  referenceNumber String?
  status          String    @default("COMPLETED")
  receivedBy      String
  transactionDate DateTime  @default(now())
  notes           String?
  deletedAt       DateTime?

  invoice         Invoice   @relation(fields: [invoiceId], references: [id])

  @@index([invoiceId])
  @@index([patientId])
}

model InventoryCategory {
  id          String    @id @default(uuid())
  name        String    @unique
  description String?
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
  deletedAt   DateTime?

  items       InventoryItem[]
}

model Supplier {
  id             String    @id @default(uuid())
  name           String
  contactPerson  String?
  phone          String?
  email          String?
  address        String?
  tinNumber      String?
  isActive       Boolean   @default(true)
  createdAt      DateTime  @default(now())
  updatedAt      DateTime  @updatedAt
  deletedAt      DateTime?

  items          InventoryItem[]
  purchaseOrders PurchaseOrder[]
}

model InventoryItem {
  id              String    @id @default(uuid())
  itemCode        String    @unique
  name            String
  categoryId      String
  supplierId      String?
  unit            String
  reorderLevel    Int       @default(0)
  quantityOnHand  Int       @default(0)
  costPerUnit     Decimal?
  location        String?
  expiryDate      DateTime?
  isActive        Boolean   @default(true)
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt
  deletedAt       DateTime?

  category        InventoryCategory @relation(fields: [categoryId], references: [id])
  supplier        Supplier?         @relation(fields: [supplierId], references: [id])
  stockTransactions StockTransaction[]

  @@index([categoryId])
  @@index([supplierId])
  @@index([quantityOnHand])
}

model PurchaseOrder {
  id            String    @id @default(uuid())
  poNumber      String    @unique
  supplierId    String
  status        String    @default("DRAFT")
  createdBy     String
  expectedDate  DateTime?
  receivedDate  DateTime?
  notes         String?
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  deletedAt     DateTime?

  supplier      Supplier  @relation(fields: [supplierId], references: [id])

  @@index([supplierId])
  @@index([status])
}

model StockTransaction {
  id              String    @id @default(uuid())
  inventoryItemId String
  transactionType String
  quantity        Int
  referenceType   String?
  referenceId     String?
  remarks         String?
  createdBy       String
  transactionDate DateTime  @default(now())

  inventoryItem   InventoryItem @relation(fields: [inventoryItemId], references: [id])

  @@index([inventoryItemId])
  @@index([transactionType])
  @@index([transactionDate])
}

model MachineEquipment {
  id             String    @id @default(uuid())
  name           String
  departmentId   String
  serialNumber   String?
  modelNumber    String?
  manufacturer   String?
  purchaseDate   DateTime?
  maintenanceDate DateTime?
  calibrationDate DateTime?
  location       String?
  status         String    @default("ACTIVE")
  isActive       Boolean   @default(true)
  createdAt      DateTime  @default(now())
  updatedAt      DateTime  @updatedAt
  deletedAt      DateTime?

  department     Department @relation(fields: [departmentId], references: [id])

  @@index([departmentId])
  @@index([status])
}

model AuditLog {
  id          String    @id @default(uuid())
  entityType  String
  entityId    String?
  action      String
  actorId     String?
  oldValues   Json?
  newValues   Json?
  ipAddress   String?
  userAgent   String?
  notes       String?
  createdAt   DateTime  @default(now())

  actor       User?     @relation("AuditLogActor", fields: [actorId], references: [id])

  @@index([actorId])
  @@index([entityType])
  @@index([createdAt])
}

model Notification {
  id                 String    @id @default(uuid())
  userId             String
  type               String
  message            String
  isRead             Boolean   @default(false)
  relatedEntityType  String?
  relatedEntityId    String?
  scheduledFor       DateTime?
  createdAt          DateTime  @default(now())
  updatedAt          DateTime  @updatedAt

  user               User      @relation(fields: [userId], references: [id])

  @@index([userId])
  @@index([isRead])
}

model SystemSetting {
  id          String    @id @default(uuid())
  key         String    @unique
  value       String
  description String?
  isEncrypted Boolean   @default(false)
  encryptedValue String?
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
  deletedAt   DateTime?
}
```

---

## 5. Recommended indexes

### High-priority indexes
- users.email
- users.isActive
- roles.name
- user_roles.userId
- user_roles.roleId
- patients.patientNumber
- patients.email
- doctors.departmentId
- tests.code
- tests.categoryId
- tests.departmentId
- test_parameters.testId
- test_reference_ranges.testId
- laboratory_orders.patientId
- laboratory_orders.status
- laboratory_orders.createdAt
- order_items.orderId
- samples.sampleNumber
- samples.orderId
- samples.patientId
- samples.status
- test_results.sampleId
- test_results.status
- invoices.invoiceNumber
- invoices.patientId
- payments.invoiceId
- inventory_items.itemCode
- inventory_items.categoryId
- purchase_orders.supplierId
- stock_transactions.inventoryItemId
- audit_logs.createdAt
- notifications.userId
- system_settings.key

All indexes should be created in PostgreSQL with the correct unique constraints and filtered indexes when needed for soft-deleted rows.

---

## 6. Database constraints

### Data integrity constraints
- UUIDs should be used for all primary keys where possible.
- Foreign keys must be enforced.
- Unique constraints for natural business keys such as email, patientNumber, orderNumber, etc.
- Check constraints for enums or status codes, for example:
  - status in ("PENDING", "COLLECTED", "PROCESSING", "RESULT_READY", "VERIFIED", "RELEASED", "CANCELLED")
  - paymentStatus in ("UNPAID", "PARTIAL", "PAID")
  - isActive boolean default true
- Negative quantity restrictions: quantity > 0
- Non-negative invoice totals and amounts
- Soft delete via deletedAt, not physical deletes for audit-sensitive records

### Validation rules
- Age/date validations for patient date of birth
- No orphan order items without a valid order
- No result without a valid sample and test
- No payments more than invoice total unless explicitly allowed
- Reorder level must be >= 0

---

## 7. Migration strategy

### Recommended migration approach
1. Create schema in Prisma with approved models.
2. Run prisma migrate dev for local development.
3. Validate schema with prisma validate.
4. Review SQL generated by migration.
5. Add seed data for roles, permissions, default admin account, system settings, departments, sample types.
6. Apply migrations in staging and production using CI/CD pipelines.
7. Use a backup and restore plan before production rollout.

### Suggested migration sequence
1. Base identity tables: users, roles, permissions, user_roles
2. Patient and doctor domain tables
3. Catalog tables: departments, categories, tests, packages, parameters
4. Order and sample workflow tables
5. Results and reporting tables
6. Financial tables: invoices, payments
7. Inventory tables: suppliers, items, purchase orders, stock transactions
8. Equipment, notifications, audit logs, system settings

### Data seeding
Seed the following first:
- Super Admin user
- default roles
- default permissions
- system settings
- sample types
- lab departments
- report templates

### Backup and restore plan
- Daily automated database backups
- Point-in-time recovery enabled where supported
- Backup verification process
- Production migration rehearsals in staging

---

## 8. Final design decision

This schema balances normalization and practical clinical operations. It avoids duplication by keeping catalog data in the master tables and using join tables where many-to-many relationships exist. It supports auditability, role-based access, sample tracking, report verification, and financial controls with referential integrity and scalability in mind.
