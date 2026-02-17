# Copilot Instructions — LMS Multivendor Backend

## Project Overview

NestJS 11.x backend for a **multi-tenant Learning Management System (LMS)** with multi-module architecture. Built on the [nestjs-boilerplate](https://github.com/brocoders/nestjs-boilerplate) foundation with a full LMS layer (students, staff, courses, academics, accounts), plus standalone feature modules for staff management, staff attendance, payroll, materials, fees, exams, student registration, and attendance.

- **Runtime**: Node.js ≥ 16, TypeScript 5.9, NestJS 11.x
- **ORM**: TypeORM 0.3.27 with PostgreSQL (Neon serverless)
- **Package manager**: pnpm
- **Test framework**: Jest 30.x with ts-jest
- **Linter**: ESLint 9 flat config (`eslint.config.mjs`) + Prettier
- **API docs**: Swagger at `/docs`, Scalar at `/reference`

---

## Architecture

### Hexagonal (Ports & Adapters)

Every entity follows a strict layered layout:

```
src/<module>/
  domain/<entity>.ts                     # Pure POJO — no ORM deps
  dto/create-<entity>.dto.ts             # class-validator + @ApiProperty
  dto/update-<entity>.dto.ts
  infrastructure/persistence/
    <entity>.repository.ts               # Abstract class (port)
    relational/
      entities/<entity>.entity.ts        # TypeORM entity
      repositories/<entity>.repository.ts # Concrete repo (adapter)
      mappers/<entity>.mapper.ts         # toDomain / toPersistence
      relational-persistence.module.ts   # Wires { provide: AbstractRepo, useClass: ConcreteRepo }
  <module>.service.ts
  <module>.controller.ts
  <module>.module.ts
  __tests__/<module>.service.spec.ts     # Unit tests
```

### Module Categories

1. **Core LMS** (`src/lms/`): Courses, Academic, Student, Staff, Accounts — bundled via `LmsModule`
2. **Feature Modules** (`src/<feature>/`): Staff Management, Staff Attendance, Payroll, Materials, Fees, Exams, Student Registration, Attendance — each registered directly in `AppModule`
3. **Infrastructure** (`src/auth/`, `src/tenant/`, `src/users/`, etc.): Auth, tenancy, sessions, files, mail

---

## Multi-Tenancy System

### Tenant Resolution (`TenantInterceptor`)

Runs on every request. Resolution order (first match wins):
1. JWT claim `tenantId` (set after `POST /v1/auth/tenant/select`)
2. `X-Tenant-ID` header
3. Subdomain extraction (e.g. `abc.example.com` → slug `abc`)

Branch resolution: `X-Branch-ID` header (optional).

### Tenant Context (`TenantContextService`)

Uses `AsyncLocalStorage` to propagate `{ tenantId, branchId }` through the async call chain.

```typescript
this.tenantContext.getTenantId();   // throws if no context
this.tenantContext.getBranchId();   // may be null
this.tenantContext.hasContext();    // boolean check
```

### Entity Base Classes

| Base Class | Adds Columns | Usage |
|------------|-------------|-------|
| `TenantAwareEntityHelper` | `tenantId` (uuid, NOT NULL, indexed), `branchId` (uuid, nullable, indexed) | **All tenant-scoped entities** (LMS, staff, payroll, etc.) |
| `EntityRelationalHelper` | None (just `toJSON()`) | Non-tenant entities: User, Role, Status, File, Tenant, Branch, TenantUser, StaffBranchAssignment, DownloadRecord |

**Rule**: All new LMS/feature entities MUST extend `TenantAwareEntityHelper`. Only use `EntityRelationalHelper` for entities that manage tenantId themselves or don't need it.

### Tenant Filtering in Repositories

Every tenant-aware concrete repository implements `getTenantFilter()`:

```typescript
private getTenantFilter(): Record<string, unknown> {
  if (this.tenantContext.hasContext()) {
    const filter: Record<string, unknown> = { tenantId: this.tenantContext.getTenantId() };
    const branchId = this.tenantContext.getBranchId();
    if (branchId) filter.branchId = branchId;
    return filter;
  }
  return {};
}
// All queries spread ...this.getTenantFilter() into where clauses
```

---

## Key Conventions

### Domain Models

- Extend `LmsBaseDomain` (provides `id`, `tenantId`, `branchId`, `createdAt`, `updatedAt`, `deletedAt`).
- Use `@ApiProperty` / `@ApiPropertyOptional` for Swagger docs.
- Domain classes are pure POJOs with **no ORM decorators**.

### TypeORM Entities

- Extend `TenantAwareEntityHelper` (for tenant-scoped) or `EntityRelationalHelper`.
- Use `@PrimaryGeneratedColumn()`, snake_case table names.
- Relations: `@ManyToOne`, `@OneToMany`, `@OneToOne` with appropriate `onDelete`/`eager` settings.
- **No explicit `@Column()` for FK IDs** alongside `@ManyToOne` — TypeORM auto-generates FK columns from relation property names.
- Enum columns: `{ type: 'enum', enum: SomeEnum }`.
- Entity auto-discovery: `entities: [__dirname + '/../**/*.entity{.ts,.js}']` in TypeORM config — new entities are picked up automatically.

### Abstract Repositories (Ports)

Every entity has an abstract repo with standard methods:

```typescript
export abstract class SomeRepository {
  abstract create(data: DeepPartial<SomeDomain>): Promise<SomeDomain>;
  abstract findAll(): Promise<SomeDomain[]>;
  abstract findById(id: number): Promise<NullableType<SomeDomain>>;
  abstract update(id: number, payload: DeepPartial<SomeDomain>): Promise<SomeDomain | null>;
  abstract remove(id: number): Promise<void>;
}
```

Utility types are at `src/utils/types/deep-partial.type.ts` and `src/utils/types/nullable.type.ts`.

### Concrete Repositories (Adapters)

- Inject via `@InjectRepository(EntityClass)`.
- **MUST use `EntityMapper.toPersistence()` in `create()` and `update()`** — never pass raw domain data directly to `repo.create()` or `repo.update()`. TypeORM needs relation objects (`{ institution: { id: 6 } }`) not flat IDs (`{ institutionId: 6 }`).
- Use `EntityMapper.toDomain()` for all return values.
- `remove()` uses `softDelete()` (soft deletes via `@DeleteDateColumn`).
- When using `repo.findOne()` with `select`, always include `'id'` (the PK) in the select array — TypeORM's `distinctAlias` query wrapper always references the primary key.

### Persistence Modules

Each sub-module has a `relational-persistence.module.ts` that:
1. Imports `TypeOrmModule.forFeature([...Entities])`.
2. Provides `{ provide: AbstractRepo, useClass: ConcreteRepo }`.
3. Exports abstract repo classes.

Feature modules import these persistence modules to get repo access:

```typescript
@Module({
  imports: [
    StudentRelationalPersistenceModule,
    StaffRelationalPersistenceModule,
  ],
})
```

### DTOs

- Create DTOs extend `TenantAwareBaseDto` (provides `tenantId` + optional `branchId`).
- Use `class-validator` decorators: `@IsNotEmpty`, `@IsString`, `@IsInt`, `@IsEnum`, `@IsOptional`, `@IsDateString`, etc.
- **Query DTOs with `@IsInt()` MUST add `@Type(() => Number)` from `class-transformer`** — HTTP query params arrive as strings; without `@Type`, `@IsInt()` rejects them with 422. Apply to every numeric field in query/filter DTOs (`page`, `limit`, `threshold`, entity IDs, etc.).
- Use `@ApiProperty` / `@ApiPropertyOptional` on every field.
- Update DTOs use `PartialType(CreateDto)` from `@nestjs/swagger`.
- Naming: `create-<entity>.dto.ts`, `update-<entity>.dto.ts`, `query-<entity>.dto.ts`.

### Mappers

Static `toDomain(entity)` and `toPersistence(domain)` methods. Map relational IDs:
- `toDomain`: `domain.institutionId = entity.institution?.id ?? 0`
- `toPersistence`: `entity.institution = { id: domain.institutionId } as any`

---

## Authentication & Authorization

- **Strategy**: JWT via Passport (`AuthGuard('jwt')`).
- **Roles guard**: `RolesGuard` reads `@Roles(RoleEnum.admin)` metadata.
- **Apply at controller level**: `@UseGuards(AuthGuard('jwt'), RolesGuard)`.
- **Apply per route**: `@Roles(RoleEnum.admin, RoleEnum.teacher)`.

### RoleEnum Values

```typescript
export enum RoleEnum {
  admin = 1,
  user = 2,
  student = 3,
  teacher = 4,
  staff = 5,
  accountant = 6,
  parent = 7,
}
```

### Route Versioning

All controllers use URI versioning: `@Controller({ path: 'some-path', version: '1' })` → `/api/v1/some-path`.

Global prefix is `api` (set via `app.setGlobalPrefix`).

---

## Enums

All LMS enums are in `src/lms/common/enums/` and re-exported via `index.ts`:

| File | Enums |
|------|-------|
| `general.enum.ts` | `GenderEnum`, `BloodGroupEnum`, `DayOfWeekEnum`, `EnrollmentStatusEnum`, `EmploymentTypeEnum`, `TargetAudienceEnum`, `CourseMaterialTypeEnum`, `SalaryStatusEnum`, `ExpenseStatusEnum`, `EnquirySourceEnum` |
| `attendance-status.enum.ts` | `AttendanceStatusEnum` (present, absent, late, half_day, excused) |
| `leave-status.enum.ts` | `LeaveStatusEnum` (pending, approved, rejected, cancelled), `LeaveTypeEnum` (sick, casual, earned, maternity, paternity, unpaid, other) |
| `admission-status.enum.ts` | `AdmissionStatusEnum` (new → enrolled/rejected/withdrawn) |
| `payment-status.enum.ts` | `PaymentStatusEnum`, `PaymentMethodEnum`, `FeeFrequencyEnum` |
| `exam.enum.ts` | `ExamTypeEnum` (class_test, midterm, final, quiz, practical, assignment) |
| `exam-status.enum.ts` | `ExamStatusEnum` |

Additional enum outside `lms/common/enums/`:
- `src/fees/domain/concession-type.enum.ts` — `ConcessionTypeEnum` (scholarship, sibling, staff_child, merit, financial_aid)

---

## AppModule — All Registered Modules

| # | Module | Source |
|---|--------|--------|
| 1 | `ConfigModule` | `@nestjs/config` (global) |
| 2 | `infrastructureDatabaseModule` | TypeORM or Mongoose (dynamic) |
| 3 | `I18nModule` | `nestjs-i18n` |
| 4 | `UsersModule` | `./users` |
| 5 | `FilesModule` | `./files` |
| 6 | `AuthModule` | `./auth` |
| 7 | `AuthFacebookModule` | `./auth-facebook` |
| 8 | `AuthGoogleModule` | `./auth-google` |
| 9 | `AuthAppleModule` | `./auth-apple` |
| 10 | `SessionModule` | `./session` |
| 11 | `MailModule` | `./mail` |
| 12 | `MailerModule` | `./mailer` |
| 13 | `HomeModule` | `./home` |
| 14 | `LmsModule` | `./lms` (bundles Courses, Academic, Student, Staff, Accounts) |
| 15 | `StudentRegistrationModule` | `./student-registration` |
| 16 | `AttendanceModule` | `./attendance` |
| 17 | `FeesModule` | `./fees` |
| 18 | `ExamsModule` | `./exams` |
| 19 | `TenantModule` | `./tenant` |
| 20 | `MaterialsModule` | `./materials` |
| 21 | `StaffManagementModule` | `./staff-management` |
| 22 | `StaffAttendanceModule` | `./staff-attendance` |
| 23 | `PayrollModule` | `./payroll` |
| 24 | `NoticesModule` | `./notices` |
| 25 | `TimetablesModule` | `./timetables` |
| 26 | `PortalsModule` | `./portals` |
| 27 | `IncomeModule` | `./income` |
| 28 | `ExpensesModule` | `./expenses` |
| 29 | `FinancialDashboardModule` | `./financial-dashboard` |

---

## LMS Module Structure

`src/lms/lms.module.ts` bundles 5 sub-modules:

| Module | Entities |
|--------|----------|
| **Courses** | Institution, Department, GradeClass, Section, Subject, ClassSubject |
| **Academic** | AcademicYear, AcademicTerm |
| **Student** | Student, AdmissionEnquiry, StudentDocument, StudentEnrollment, StudentAttendance, LeaveRequest, FeeStructure, FeeChallan, FeePayment, Exam, ExamSubject, ExamResult, CourseMaterial |
| **Staff** | Staff, StaffAttendance, StaffLeave, Notice, TimetableSlot, SalarySlip |
| **Accounts** | Income, Expense |

---

## Feature Modules (standalone, outside `src/lms/`)

### Staff Management (`src/staff-management/`)

Full staff lifecycle: create staff with auto-generated IDs, multi-branch assignments, transfers.

| Aspect | Details |
|--------|---------|
| **Imports** | `StaffManagementRelationalPersistenceModule`, `TenantModule` |
| **Services** | `StaffManagementService` |
| **Entities** | `StaffMgmt` (profile, employment), `StaffBranchAssignment` (multi-branch) |
| **DTOs** | `CreateStaffMgmtDto`, `UpdateStaffMgmtDto`, `AssignBranchDto`, `TransferBranchDto`, `QueryStaffDto` |

**Endpoints** — prefix: `staff-management`

| Method | Path | Roles | Purpose |
|--------|------|-------|---------|
| POST | `/` | admin | Create staff |
| GET | `/` | admin, staff, teacher | List staff (filterable by branch) |
| GET | `/my-branches` | admin, staff, teacher, accountant | Current user's branches |
| GET | `/:id` | admin, staff, teacher | Get staff |
| PATCH | `/:id` | admin | Update staff |
| DELETE | `/:id` | admin | Soft delete staff |
| POST | `/:id/branches` | admin | Assign to branch |
| GET | `/:id/branches` | admin, staff, teacher | List branch assignments |
| POST | `/:id/transfer-branch` | admin | Transfer between branches |
| DELETE | `/branch-assignments/:id` | admin | Remove assignment |

### Staff Attendance (`src/staff-attendance/`)

Check-in/check-out tracking, leave management with balances.

| Aspect | Details |
|--------|---------|
| **Imports** | `StaffAttendanceRelationalPersistenceModule`, `TenantModule` |
| **Services** | `StaffAttendanceService` |
| **Entities** | `StaffAttendanceRecord`, `StaffLeaveApplication`, `StaffLeaveBalance` |

**Endpoints** — prefix: `staff/attendance`

| Method | Path | Roles | Purpose |
|--------|------|-------|---------|
| POST | `/check-in` | admin, staff | Check in |
| POST | `/check-out` | admin, staff | Check out |
| GET | `/reports` | admin, staff | Attendance reports |

**Endpoints** — prefix: `staff/leaves`

| Method | Path | Roles | Purpose |
|--------|------|-------|---------|
| POST | `/` | admin, staff | Apply for leave |
| GET | `/` | admin, staff | List leaves |
| GET | `/balance` | admin, staff | Get leave balances |
| PATCH | `/:id/approve` | admin | Approve leave |
| PATCH | `/:id/reject` | admin | Reject leave |

### Payroll (`src/payroll/`)

Salary structures and payslip generation with accounting integration.

| Aspect | Details |
|--------|---------|
| **Imports** | `PayrollRelationalPersistenceModule`, `TenantModule`, `AccountsModule` |
| **Services** | `PayrollService` |
| **Entities** | `SalaryStructure`, `PayrollSlip` |

**Endpoints** — prefix: `payroll/structures`

| Method | Path | Roles | Purpose |
|--------|------|-------|---------|
| POST | `/` | admin, accountant | Create salary structure |
| GET | `/` | admin, accountant, staff | List structures |
| GET | `/:id` | admin, accountant, staff | Get structure |
| PATCH | `/:id` | admin, accountant | Update structure |
| DELETE | `/:id` | admin | Remove structure |

**Endpoints** — prefix: `payroll`

| Method | Path | Roles | Purpose |
|--------|------|-------|---------|
| POST | `/process` | admin, accountant | Process payroll |
| GET | `/slips` | admin, accountant, staff | List payslips |
| GET | `/slips/:id` | admin, accountant, staff | Get payslip |
| GET | `/slips/:id/pdf` | admin, accountant, staff | Download payslip PDF |

### Materials (`src/materials/`)

Course materials, assignments, submissions, and download tracking.

| Aspect | Details |
|--------|---------|
| **Imports** | `MaterialsRelationalPersistenceModule` |
| **Services** | `MaterialsService` |
| **Entities** | `CourseMaterial`, `Assignment`, `AssignmentSubmission`, `DownloadRecord` |

**Endpoints** — prefix: `materials`

| Method | Path | Roles | Purpose |
|--------|------|-------|---------|
| POST | `/` | admin, teacher, staff | Upload material |
| GET | `/` | admin, teacher, staff, student | List materials |
| GET | `/quota` | admin | Storage quota |
| GET | `/:id` | admin, teacher, staff, student | Get material |
| GET | `/:id/download` | admin, teacher, staff, student | Track download |
| PATCH | `/:id` | admin, teacher | Update material |
| DELETE | `/:id` | admin | Remove material |

**Endpoints** — prefix: `materials/assignments`

| Method | Path | Roles | Purpose |
|--------|------|-------|---------|
| POST | `/` | admin, teacher | Create assignment |
| GET | `/` | admin, teacher, staff, student | List assignments |
| GET | `/:id` | admin, teacher, staff, student | Get assignment |
| POST | `/:id/submit` | admin, student | Submit assignment |
| GET | `/:id/submissions` | admin, teacher | List submissions |
| PATCH | `/:id` | admin, teacher | Update assignment |
| DELETE | `/:id` | admin | Remove assignment |

**Endpoints** — prefix: `materials/submissions`

| Method | Path | Roles | Purpose |
|--------|------|-------|---------|
| GET | `/:id` | admin, teacher, student | Get submission |
| DELETE | `/:id` | admin | Remove submission |

### Exams (`src/exams/`)

Exam scheduling, marks entry, grading, analytics, and report cards.

| Aspect | Details |
|--------|---------|
| **Imports** | `ExamsRelationalPersistenceModule`, `StudentRelationalPersistenceModule` |
| **Services** | `ExamsService`, `GradeCalculatorService`, `RankCalculatorService`, `ReportCardService` |
| **Entities** | `GradingScale` |

**Endpoints** — prefix: `exams`

| Method | Path | Roles | Purpose |
|--------|------|-------|---------|
| POST | `/grading-scales` | admin | Create grading scale |
| GET | `/grading-scales` | admin, teacher, staff | List grading scales |
| GET | `/grading-scales/:id` | admin, teacher, staff | Get grading scale |
| POST | `/schedules` | admin, teacher | Create exam schedule |
| GET | `/schedules/:id` | admin, teacher, staff, student | Get schedule |
| PATCH | `/schedules/:id/status` | admin | Update exam status |
| POST | `/marks` | admin, teacher | Enter marks |
| POST | `/marks/bulk` | admin, teacher | Bulk import marks |
| GET | `/marks/:examSubjectId` | admin, teacher, staff | Marks for exam subject |
| PATCH | `/:examId/publish` | admin | Publish results |
| GET | `/results/student/:studentId` | admin, teacher, staff, student, parent | Student results |
| GET | `/results/student/:studentId/exam/:examId` | admin, teacher, staff, student, parent | Exam result detail |
| GET | `/results/student/:studentId/exam/:examId/report-card` | admin, teacher, staff, student, parent | PDF report card |
| GET | `/analytics/exam/:examId` | admin, teacher, staff | Exam analytics |
| GET | `/analytics/subject/:examSubjectId` | admin, teacher, staff | Subject analytics |

### Fees (`src/fees/`)

Fee structures, challan generation, payments, concessions, reminders.

| Aspect | Details |
|--------|---------|
| **Imports** | `FeesRelationalPersistenceModule`, `StudentRelationalPersistenceModule`, `MailModule` |
| **Services** | `FeesService`, `FeeCalculatorService`, `ChallanGeneratorService` |
| **Entities** | `Concession` (fee_concession), `Receipt` (fee_receipt) |

**Endpoints** — prefix: `fees`

| Method | Path | Roles | Purpose |
|--------|------|-------|---------|
| POST | `/structures` | admin, accountant | Create fee structure |
| GET | `/structures/:id` | admin, accountant, staff | Get fee structure |
| POST | `/challans/generate` | admin, accountant | Generate challan |
| POST | `/challans/generate-bulk` | admin, accountant | Bulk generate challans |
| GET | `/challans/:challanNumber` | admin, accountant, staff, student, parent | Get challan |
| POST | `/payments` | admin, accountant | Record payment |
| PATCH | `/payments/:id/verify` | admin | Verify payment |
| POST | `/concessions` | admin, accountant | Apply concession |
| GET | `/students/:id/effective-concession` | admin, accountant, student, parent | Get effective concession |
| GET | `/receipts/:id/pdf` | admin, accountant, student, parent | Download receipt PDF |
| GET | `/reports/collection` | admin, accountant | Collection report |
| GET | `/reports/pending` | admin, accountant | Pending fees report |
| GET | `/reports/defaulters` | admin, accountant | Defaulters list |
| POST | `/send-reminders` | admin, accountant | Send payment reminders |
| GET | `/my-challans` | student, parent, user | Own challans portal |

### Student Registration (`src/student-registration/`)

Full registration workflow: register new student, enroll in sections, upload documents, manage guardians, bulk import via CSV.

| Aspect | Details |
|--------|---------|
| **Services** | `StudentRegistrationService`, `StudentIdGeneratorService`, `StudentImportService` |
| **Guard** | `StudentOwnershipGuard` — prevents students accessing others' data |
| **Validators** | Pure functions in `validators/student-validator.ts` |
| **Entity** | `StudentGuardianEntity` (with its own hexagonal persistence layer) |

### Attendance Management (`src/attendance/`)

Polymorphic attendance for both students and staff via `attendableType` ('student' | 'staff').

| Aspect | Details |
|--------|---------|
| **Services** | `AttendanceService` (orchestrator), `AttendanceCalculatorService` (percentage math), `LeaveManagementService` (leave CRUD + retroactive updates) |
| **No new entities** — orchestrates existing LMS entities through repos |

**Endpoints** — prefix: `attendance`

| Method | Path | Roles |
|--------|------|-------|
| POST | `/mark` | admin, teacher, staff |
| POST | `/bulk` | admin, teacher |
| GET | `/` | admin, teacher, staff |
| GET | `/reports/summary` | admin, teacher, staff |
| GET | `/reports/detailed` | admin, teacher, staff |
| GET | `/alerts` | admin, teacher |
| POST | `/leaves` | admin, teacher, staff, student |
| PATCH | `/leaves/:id/approve` | admin, teacher |
| PATCH | `/leaves/:id/reject` | admin, teacher |

---

## Database

- **Primary**: PostgreSQL via Neon (`pg` driver).
- **ORM**: TypeORM 0.3.27.
- **Soft deletes**: `@DeleteDateColumn()` on entities, `softDelete()` in repos.
- **Migrations**: `src/database/migrations/`, run via `npm run migration:run`.
- **Seeds**: `src/database/seeds/relational/`, run via `npm run seed:run:relational`.
- **Document DB**: MongoDB/Mongoose support exists but is not used for LMS.

### Migrations

| Timestamp | Name | Purpose |
|-----------|------|---------|
| 1715028537217 | `CreateUser` | User, role, status, file, session tables |
| 1770930398142 | `LmsSchema` | Core LMS tables (courses, students, academic, staff, accounts, exams, fees) |
| 1771000000000 | `AddMultiTenancy` | Add tenantId/branchId columns, tenant/branch/tenant_user tables |
| 1771200000000 | `AddNewModuleTables` | 15 tables for new modules: staff_mgmt, staff_branch_assignment, staff_attendance_record, staff_leave_application, staff_leave_balance, grading_scale, fee_concession, fee_receipt, material, assignment, assignment_submission, download_record, salary_structure, payroll_slip, student_guardian |
| 1771300000000 | `AddTimetableAndIncomeTables` | Timetable and income tables |
| 1771400000000 | `AddBranchExpenseTable` | Branch-scoped expense table |
| 1771500000000 | `AddExamStatusAndNoticesTable` | Add `exam_status_enum` + `status` column to `exam` table; create `notices` table (UUID PK, tenant-aware) for `NoticesModule` |

**Important**: When creating new entities, always create a migration. Use manual SQL in migration `up()`/`down()` methods (CREATE TABLE, DROP TABLE). Include:
- All columns with correct types matching entity decorators
- PostgreSQL enum types with `CREATE TYPE IF NOT EXISTS`
- Foreign key constraints
- Indexes matching entity `@Index()` decorators
- Proper `down()` method to drop tables/types in reverse dependency order

### PostgreSQL Enum Types

| Type Name | Values |
|-----------|--------|
| `employment_type_enum` | full_time, part_time, contract, visiting |
| `attendance_status_enum` | present, absent, late, half_day, excused |
| `leave_status_enum` | pending, approved, rejected, cancelled |
| `leave_type_enum` | sick, casual, earned, maternity, paternity, unpaid, other |
| `course_material_type_enum` | document, video, assignment, link, presentation |
| `concession_type_enum` | scholarship, sibling, staff_child, merit, financial_aid |
| `salary_status_enum` | draft, processed, paid, held |
| `exam_status_enum` | draft, scheduled, in_progress, completed, results_published |

---

## Testing

### Unit Tests

- Location: `src/<module>/__tests__/*.spec.ts` (feature modules) or `src/lms/<module>/*.service.spec.ts` (LMS modules).
- Framework: Jest 30 with `@nestjs/testing` `Test.createTestingModule`.
- **Mock pattern**: Provide abstract repo classes as injection tokens with `jest.fn()` mocks.

```typescript
const module = await Test.createTestingModule({
  providers: [
    MyService,
    { provide: SomeRepository, useValue: { create: jest.fn(), findAll: jest.fn(), ... } },
  ],
}).compile();
```

- Helper `createMockRepository()` returns standard `{ create, findAll, findById, update, remove }` mock objects.
- **Test naming**: ESLint enforces `it('should ...')` — all test descriptions MUST start with "should".

### E2E Tests

- Location: `test/<feature>/*.e2e-spec.ts`.
- Config: `test/jest-e2e.json` (rootDir `.`, testRegex `.e2e-spec.ts$`).
- Run: `npm run test:e2e` (via env-cmd) or Docker compose.
- Constants: `test/utils/constants.ts` — `APP_URL`, `ADMIN_EMAIL/PASSWORD`, `TESTER_EMAIL/PASSWORD`.
- Pattern: supertest against running server, `beforeAll` gets auth tokens.

### Running Tests

```bash
# Unit tests (all)
npx jest --forceExit --maxWorkers=2

# Unit tests (specific module)
npx jest --testPathPatterns "src/attendance" --forceExit --verbose

# E2E tests
npm run test:e2e
```

**Important**: Jest 30 uses `--testPathPatterns` (plural), NOT `--testPathPattern`.

---

## ESLint Rules

Flat config at `eslint.config.mjs`. Critical rules:

| Rule | Setting | Effect |
|------|---------|--------|
| `@typescript-eslint/no-unused-vars` | `error` | No unused imports/variables |
| `@typescript-eslint/require-await` | `error` | No `async` without `await` |
| `@typescript-eslint/no-floating-promises` | `error` | Must `await` all promises |
| `@typescript-eslint/no-explicit-any` | `off` | `any` is allowed |
| `no-restricted-syntax` (it tests) | `error` | `it()` descriptions must start with "should" |
| `no-restricted-syntax` (configService) | `error` | `configService.get()` must include `{ infer: true }` |
| Prettier | integrated | Auto-format via `eslint-plugin-prettier` |

Line endings are LF. Run `--fix` after file creation to auto-correct CRLF issues.

---

## TypeScript Config

Key `tsconfig.json` settings:
- `strictNullChecks: true` — handle nullable types explicitly
- `noImplicitAny: false` — `any` is permitted
- `esModuleInterop: true` — allows `import x from 'y'` for CJS modules
- `target: ES2021`, `module: commonjs`

---

## Validation & Error Format

Global `ValidationPipe` configured in `main.ts`:

```typescript
app.useGlobalPipes(new ValidationPipe(validationOptions));
```

Validation errors return **422 Unprocessable Entity** in this format:

```json
{
  "status": 422,
  "errors": {
    "fieldName": "error message"
  }
}
```

Service-level errors follow the same shape:

```typescript
throw new UnprocessableEntityException({
  status: 422,
  errors: { field: 'message' },
});
```

Conflict errors use 409, Not Found uses 404 (standard NestJS exceptions).

---

## Development Workflow

### TDD Approach (preferred)

1. **Write E2E tests first** (`test/<feature>/<feature>.e2e-spec.ts`)
2. **Write unit tests** (`src/<feature>/__tests__/*.spec.ts`)
3. **RED phase** — run tests, verify they fail
4. **Implement** — domain → DTOs → services → controller → module
5. **GREEN phase** — all tests pass
6. **Refactor** — clean up, lint, verify

### Commands

```bash
# Lint
npx eslint "src/<module>/**/*.ts" --fix

# Type check
npx tsc --noEmit

# Dev server
pnpm start:dev

# Build
pnpm build

# Format
pnpm format
```

---

## Module Wiring Checklist

When creating a new feature module:

1. Create domain models extending `LmsBaseDomain` (if new entities needed)
2. Create TypeORM entities extending `TenantAwareEntityHelper`
3. Create abstract repositories (ports)
4. Create concrete repositories + mappers (adapters) — **always use mapper in `create()` and `update()`**
5. Create `relational-persistence.module.ts` — wire `{ provide: AbstractRepo, useClass: ConcreteRepo }`
6. Create DTOs — create DTO extends `TenantAwareBaseDto`, update DTO uses `PartialType(CreateDto)`
7. Create service(s) — inject repos via constructor (class-based tokens)
8. Create controller — `@UseGuards(AuthGuard('jwt'), RolesGuard)` + `@Roles()`
9. Create module — imports persistence modules, provides services, exports if needed
10. Register in `src/app.module.ts` imports
11. **Create database migration** — manual SQL in `src/database/migrations/` with proper up/down methods
12. Run migration: `npm run migration:run`
13. Write tests, run `tsc --noEmit`, run `eslint --fix`, verify all tests pass

---

## File Naming Conventions

| Type | Pattern | Example |
|------|---------|---------|
| Entity | `<name>.entity.ts` | `student-attendance.entity.ts` |
| Domain | `<name>.ts` | `student.ts` |
| Repository (abstract) | `<name>.repository.ts` | `student-attendance.repository.ts` |
| Repository (concrete) | `<name>.repository.ts` (in `relational/repositories/`) | same name, different folder |
| Mapper | `<name>.mapper.ts` | `student-attendance.mapper.ts` |
| DTO | `<verb>-<name>.dto.ts` | `create-student.dto.ts`, `mark-attendance.dto.ts` |
| Service | `<name>.service.ts` | `attendance-calculator.service.ts` |
| Controller | `<name>.controller.ts` | `attendance.controller.ts` |
| Module | `<name>.module.ts` | `attendance.module.ts` |
| Unit test | `<name>.spec.ts` | `attendance.service.spec.ts` |
| E2E test | `<name>.e2e-spec.ts` | `attendance.e2e-spec.ts` |
| Migration | `<timestamp>-<Name>.ts` | `1771200000000-AddNewModuleTables.ts` |

---

## Common Patterns to Follow

### Service Constructor (class-based injection)

```typescript
@Injectable()
export class SomeService {
  constructor(
    private readonly studentRepo: StudentRepository,
    private readonly staffRepo: StaffRepository,
    private readonly tenantContext: TenantContextService,
  ) {}
}
```

### Controller Template

```typescript
@ApiTags('Feature Name')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Controller({ path: 'feature-path', version: '1' })
export class FeatureController {
  constructor(private readonly service: FeatureService) {}

  @Post()
  @Roles(RoleEnum.admin)
  @HttpCode(HttpStatus.CREATED)
  @ApiCreatedResponse({ description: 'Created' })
  create(@Body() dto: CreateDto) {
    return this.service.create(dto);
  }
}
```

### Repository Create Pattern (IMPORTANT)

```typescript
async create(data: DeepPartial<SomeDomain>): Promise<SomeDomain> {
  const persistenceModel = this.repo.create(
    SomeMapper.toPersistence(data as SomeDomain),  // ← MUST use mapper
  );
  if (this.tenantContext.hasContext()) {
    (persistenceModel as any).tenantId = this.tenantContext.getTenantId();
    (persistenceModel as any).branchId = this.tenantContext.getBranchId() ?? null;
  }
  const saved = await this.repo.save(persistenceModel);
  return SomeMapper.toDomain(saved);
}
```

### Unit Test Template

```typescript
describe('SomeService', () => {
  let service: SomeService;
  let repo: { create: jest.Mock; findAll: jest.Mock; findById: jest.Mock; update: jest.Mock; remove: jest.Mock };

  beforeEach(async () => {
    repo = { create: jest.fn(), findAll: jest.fn().mockResolvedValue([]), findById: jest.fn(), update: jest.fn(), remove: jest.fn() };
    const module = await Test.createTestingModule({
      providers: [
        SomeService,
        { provide: SomeRepository, useValue: repo },
      ],
    }).compile();
    service = module.get(SomeService);
  });

  it('should do something', async () => {
    repo.create.mockResolvedValue({ id: 1 });
    const result = await service.doSomething();
    expect(result).toHaveProperty('id');
  });
});
```

---

## Important Gotchas

1. **No `async` without `await`** — the `require-await` rule is `error`. If a function doesn't need async, remove the keyword.
2. **Test names must start with "should"** — ESLint enforces this via `no-restricted-syntax`.
3. **configService calls need `{ infer: true }`** — `configService.get('key', { infer: true })`.
4. **CRLF line endings** — files created on Windows may have CRLF; run `eslint --fix` to auto-convert to LF.
5. **Jest 30 CLI** — use `--testPathPatterns` (plural), not the old `--testPathPattern`.
6. **Repos use class tokens, not strings** — inject via constructor typing, not `@Inject('StringToken')`.
7. **Entity auto-discovery** — new `.entity.ts` files are automatically found by TypeORM; no manual registration needed.
8. **Soft deletes everywhere** — repos use `softDelete()`, entities have `@DeleteDateColumn()`.
9. **Always use mappers in repos** — never pass raw domain data to `repo.create()` or `repo.update()`. TypeORM ManyToOne relations need `{ relation: { id: value } }`, not flat `{ relationId: value }`.
10. **Include `id` in `select` arrays** — when using `repo.findOne({ select: [...] })`, always include the PK column. TypeORM's internal `distinctAlias` query wrapper references it.
11. **Always create migrations for new entities** — TypeORM entity auto-discovery doesn't create tables. Manual SQL migration required.
12. **Query DTO `@IsInt()` needs `@Type(() => Number)`** — HTTP query/path params arrive as strings. Without `@Type(() => Number)` from `class-transformer`, `@IsInt()` will reject them with a 422 validation error. Always pair `@IsInt()` with `@Type(() => Number)` in query DTOs.
