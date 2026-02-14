# Copilot Instructions — Multi-Tenant LMS (NestJS)

> **Project**: `nestjs-boilerplate` v1.2.0 — a multi-tenant Learning Management System  
> **Runtime**: Node ≥ 16, TypeScript 5.9, NestJS 11, TypeORM 0.3, PostgreSQL (relational) / Mongoose 8 (document)

---

## 1. High-Level Architecture

```
src/
├── app.module.ts          # Root module — loads config, DB, i18n, all feature modules
├── main.ts                # Bootstrap — CORS, URI versioning, global pipes/interceptors, Swagger
├── config/                # Typed app-level config (AllConfigType)
├── database/              # TypeORM + Mongoose config services, data-source, seeds, migrations
├── auth/                  # Email/password + social login, JWT (access + refresh), tenant selection
├── tenant/                # Multi-tenancy core — interceptor, context (AsyncLocalStorage), CRUD
├── users/                 # User CRUD, domain, persistence
├── session/               # JWT session tracking
├── roles/                 # RoleEnum, RolesGuard, @Roles() decorator
├── lms/                   # ★ LMS feature modules (courses, academic, student, staff, accounts)
│   ├── common/            #   Shared base classes (LmsBaseDomain, TenantAwareBaseDto, enums)
│   ├── courses/           #   Institution → Department → GradeClass → Section → Subject
│   ├── academic/          #   AcademicYear, Term
│   ├── student/           #   Student, Enrollment, Attendance, Documents, Fees, Exams, Leaves
│   ├── staff/             #   Staff, Attendance, Leaves, Salary, Timetable, Notices
│   └── accounts/          #   Income, Expense
├── attendance/            # Cross-cutting attendance calculator + leave management
├── exams/                 # Exam orchestration
├── fees/                  # Fee orchestration
├── student-registration/  # Public student registration flow
├── files/                 # File upload (local / S3 via multer-s3)
├── mail/ & mailer/        # Handlebars email templates + nodemailer
├── i18n/                  # nestjs-i18n translations (header-based resolver)
├── home/                  # Health-check / landing
└── utils/                 # Shared helpers, base entities, types, validation options
```

### Key Modules in `AppModule`

```typescript
@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, load: [databaseConfig, authConfig, appConfig, mailConfig, fileConfig, facebookConfig, googleConfig, appleConfig] }),
    infrastructureDatabaseModule,   // TypeORM (relational) OR Mongoose (document) — chosen at boot
    I18nModule.forRootAsync(…),
    UsersModule, FilesModule, AuthModule,
    AuthFacebookModule, AuthGoogleModule, AuthAppleModule,
    SessionModule, MailModule, MailerModule, HomeModule,
    LmsModule, StudentRegistrationModule, AttendanceModule, FeesModule, ExamsModule,
    TenantModule,
  ],
})
export class AppModule {}
```

### Bootstrap (`main.ts`)

- CORS enabled globally
- Global prefix from `app.apiPrefix` config
- **URI versioning** (`VersioningType.URI`) — all controllers use `version: '1'`
- Global `ValidationPipe` with custom options
- Global interceptors: `ResolvePromisesInterceptor`, `ClassSerializerInterceptor`
- Swagger at `/docs`, Scalar API reference at `/reference`
- Swagger global headers: `X-Tenant-ID`, `X-Branch-ID`, language header

---

## 2. Multi-Tenancy System

### 2.1 Tenant Resolution (`TenantInterceptor`)

Registered as `APP_INTERCEPTOR` in `TenantModule` — runs on **every** request.

**Resolution order** (first match wins):
1. JWT claim `tenantId` (set after `POST /v1/auth/tenant/select`)
2. `X-Tenant-ID` header (machine-to-machine / API key)
3. Subdomain extraction (e.g. `abc.example.com` → slug `abc`)

**Branch resolution**: `X-Branch-ID` header (optional).

If no tenant is resolved the request proceeds without tenant context (public/auth routes).

**Validation steps**:
- Tenant must exist and be active (`BadRequestException` / `ForbiddenException`)
- Non-admin authenticated users must have an active `TenantUser` record for this tenant

### 2.2 Tenant Context (`TenantContextService`)

Uses Node.js `AsyncLocalStorage` to propagate `{ tenantId, branchId }` through the entire async call chain.

```typescript
// Injecting and using in any service / repository:
constructor(private readonly tenantContext: TenantContextService) {}

this.tenantContext.getTenantId();   // throws if no context
this.tenantContext.getBranchId();   // may be null
this.tenantContext.hasContext();    // boolean check
```

### 2.3 Tenant Data Model

| Domain        | ID type | Purpose                                    |
|---------------|---------|---------------------------------------------|
| `Tenant`      | UUID    | Organisation (name, slug, contactEmail, isActive, settings) |
| `Branch`      | UUID    | Physical branch within a tenant             |
| `TenantUser`  | —       | Many-to-many link between User and Tenant   |

### 2.4 Auth ↔ Tenant Flow

1. User logs in → receives JWT **without** `tenantId`
2. `GET /v1/auth/tenants` → lists tenants the user belongs to
3. `POST /v1/auth/tenant/select { tenantId }` → returns **new JWT** with `tenantId` claim
4. Subsequent requests carry tenant-scoped JWT → `TenantInterceptor` applies context automatically

---

## 3. Hexagonal / Clean Architecture Layers

Every LMS feature module follows this **strict** layered structure:

```
feature/
├── domain/                        # Pure POJO domain classes (no ORM)
│   └── feature.ts                 # extends LmsBaseDomain
├── dto/
│   ├── create-feature.dto.ts      # extends TenantAwareBaseDto
│   └── update-feature.dto.ts      # PartialType(CreateFeatureDto)
├── infrastructure/
│   └── persistence/
│       ├── feature.repository.ts  # Abstract repository (port)
│       └── relational/
│           ├── entities/
│           │   └── feature.entity.ts       # TypeORM entity, extends TenantAwareEntityHelper
│           ├── mappers/
│           │   └── feature.mapper.ts       # toDomain() / toPersistence()
│           ├── repositories/
│           │   └── feature.repository.ts   # Concrete implementation (adapter)
│           └── relational-persistence.module.ts
├── feature.controller.ts
├── feature.module.ts
├── feature.service.ts
└── feature.service.spec.ts
```

### Layer Rules

| Layer | Can depend on | Must NOT depend on |
|-------|---------------|---------------------|
| **Domain** | Nothing (pure POJO) | ORM, framework, infrastructure |
| **DTO** | Domain (types only), `class-validator`, `@nestjs/swagger` | ORM, infrastructure |
| **Abstract Repository** (port) | Domain, utility types | ORM, concrete implementations |
| **Entity** (ORM) | `TenantAwareEntityHelper`, TypeORM decorators | Domain directly |
| **Mapper** | Domain, Entity | Services, controllers |
| **Concrete Repository** (adapter) | Entity, Mapper, `TenantContextService`, TypeORM | Controllers, other feature modules |
| **Service** | Abstract repository (injected), Domain, DTO | Concrete repos, ORM |
| **Controller** | Service, DTO, Domain, Guards/Decorators | Repository, ORM |

---

## 4. Base Classes & Inheritance

### `LmsBaseDomain` (domain layer)
```typescript
export class LmsBaseDomain {
  id: number;
  tenantId: string;       // UUID
  branchId: string | null; // UUID, optional
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date;
}
```

### `TenantAwareBaseDto` (create DTOs)
```typescript
export class TenantAwareBaseDto {
  @IsUUID() tenantId!: string;
  @IsOptional() @IsUUID() branchId?: string | null;
}
```

### `TenantAwareEntityHelper` → `EntityRelationalHelper` → `BaseEntity` (TypeORM)
```typescript
// EntityRelationalHelper adds: __entity name, toJSON() via class-transformer
// TenantAwareEntityHelper adds:
@Index() @Column({ type: 'uuid' }) tenantId!: string;
@Index() @Column({ type: 'uuid', nullable: true }) branchId!: string | null;
```

**Every new LMS entity** must extend `TenantAwareEntityHelper` and its domain class must extend `LmsBaseDomain`.

---

## 5. Repository Pattern (Dependency Inversion)

Abstract repository (port):
```typescript
export abstract class DepartmentRepository {
  abstract create(data: DeepPartial<Department>): Promise<Department>;
  abstract findAll(): Promise<Department[]>;
  abstract findById(id: number): Promise<NullableType<Department>>;
  abstract update(id: number, payload: DeepPartial<Department>): Promise<Department | null>;
  abstract remove(id: number): Promise<void>;
}
```

Concrete repository (adapter) — **always injects `TenantContextService`**:
```typescript
@Injectable()
export class DepartmentRelationalRepository implements DepartmentRepository {
  constructor(
    @InjectRepository(DepartmentEntity) private readonly repo: Repository<DepartmentEntity>,
    private readonly tenantContext: TenantContextService,
  ) {}

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
}
```

Binding in persistence module:
```typescript
{ provide: DepartmentRepository, useClass: DepartmentRelationalRepository }
```

---

## 6. Mapper Pattern

```typescript
export class DepartmentMapper {
  static toDomain(entity: DepartmentEntity): Department { /* field-by-field mapping */ }
  static toPersistence(domain: Department): DepartmentEntity { /* field-by-field mapping */ }
}
```

- Mappers are **static** utility classes — no DI needed
- Always map `tenantId` and `branchId`
- Handle nullable/optional fields explicitly

---

## 7. Controller Conventions

```typescript
@ApiTags('LMS - Departments')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Controller({ path: 'lms/departments', version: '1' })
export class DepartmentController {
  constructor(private readonly service: CoursesService) {}

  @Post()
  @Roles(RoleEnum.admin)
  @HttpCode(HttpStatus.CREATED)
  @ApiCreatedResponse({ type: Department })
  create(@Body() dto: CreateDepartmentDto) { return this.service.createDepartment(dto); }

  @Get()
  @Roles(RoleEnum.admin, RoleEnum.staff, RoleEnum.teacher)
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ type: [Department] })
  findAll() { return this.service.findAllDepartments(); }

  @Get(':id')  @ApiParam({ name: 'id', type: Number })
  findOne(@Param('id', ParseIntPipe) id: number) { … }

  @Patch(':id') update(…) { … }
  @Delete(':id') @HttpCode(HttpStatus.NO_CONTENT) remove(…) { … }
}
```

**Conventions**:
- Every controller uses `@ApiBearerAuth()`, `@UseGuards(AuthGuard('jwt'), RolesGuard)`
- `@Roles(…)` decorator on each endpoint
- Explicit `@HttpCode` on every method
- Swagger response types via `@ApiCreatedResponse` / `@ApiOkResponse`
- LMS routes prefixed with `lms/` (e.g. `lms/departments`, `lms/subjects`)
- Tenant routes: `tenants`, `branches`, `tenant-users`
- Multiple controllers per module file when they share a service (grouped by comment blocks)
- `ParseIntPipe` for numeric IDs, `ParseUUIDPipe` for UUID IDs

---

## 8. Roles & Authorization

```typescript
export enum RoleEnum {
  'admin' = 1,
  'user' = 2,
  'student' = 3,
  'teacher' = 4,
  'staff' = 5,
  'accountant' = 6,
  'parent' = 7,
}
```

`RolesGuard` reads roles from `@Roles()` metadata via `Reflector` and compares against `request.user.role.id`.

### JWT Payload
```typescript
type JwtPayloadType = Pick<User, 'id' | 'role'> & {
  sessionId: Session['id'];
  tenantId?: string;   // present only after tenant selection
  iat: number;
  exp: number;
};
```

---

## 9. LMS Module Structure

```
src/lms/
├── lms.module.ts          # Barrel — imports & exports all sub-modules
├── common/
│   ├── domain/
│   │   └── lms-base.domain.ts
│   ├── dto/
│   │   └── tenant-aware-base.dto.ts
│   └── enums/
│       ├── admission-status.enum.ts
│       ├── attendance-status.enum.ts
│       ├── exam-status.enum.ts
│       ├── exam.enum.ts
│       ├── general.enum.ts
│       ├── leave-status.enum.ts
│       ├── payment-status.enum.ts
│       └── index.ts
├── courses/               # Institution, Department, GradeClass, Section, Subject
├── academic/              # AcademicYear, Term
├── student/               # Student, StudentEnrollment, StudentAttendance, StudentDocument,
│                          # FeeChallan, FeePayment, FeeStructure, Exam, ExamSubject, ExamResult,
│                          # CourseMaterial, LeaveRequest, AdmissionEnquiry
├── staff/                 # Staff, StaffAttendance, StaffLeave, SalarySlip, TimetableSlot, Notice
└── accounts/              # Income, Expense
```

---

## 10. Database & Persistence

- **Relational (default)**: PostgreSQL via TypeORM 0.3
- **Document (alternative)**: MongoDB via Mongoose 8
- Chosen at startup via `DATABASE_TYPE` env var → `isDocumentDatabase` flag
- TypeORM entities use `@Entity()`, extend `TenantAwareEntityHelper`
- Soft deletes via `@DeleteDateColumn()` — use `softDelete()`, not `delete()`
- Migrations: `npm run migration:generate`, `npm run migration:run`
- Seeds: `npm run seed:run:relational` / `npm run seed:run:document`

---

## 11. TypeScript Configuration

```jsonc
{
  "compilerOptions": {
    "module": "commonjs",
    "target": "ES2021",
    "emitDecoratorMetadata": true,
    "experimentalDecorators": true,
    "strictNullChecks": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "outDir": "./dist",
    "baseUrl": "./"
  }
}
```

---

## 12. Testing

- **Unit tests**: Jest 30, `ts-jest`, `*.spec.ts` files co-located with source
- **E2E tests**: `test/` directory, `jest-e2e.json` config, uses `supertest`
- Test directories: `test/admin/`, `test/attendance/`, `test/exams/`, `test/fees/`, `test/students/`, `test/user/`, `test/utils/`
- Docker test environments available (`docker-compose.relational.test.yaml`, etc.)
- Run: `npm test`, `npm run test:e2e`, `npm run test:cov`

---

## 13. Code Generation

The project uses **Hygen** templates for scaffolding:

```bash
npm run generate:resource:relational    # New relational resource
npm run generate:resource:document      # New document resource
npm run generate:resource:all-db        # Both DB types
npm run add:property:to-relational      # Add property to existing resource
npm run seed:create:relational          # New seed file
```

---

## 14. Key Dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| `@nestjs/core` | 11.1.6 | Framework |
| `@nestjs/typeorm` | 11.0.0 | TypeORM integration |
| `typeorm` | 0.3.27 | ORM (PostgreSQL) |
| `@nestjs/mongoose` | 11.0.3 | Mongoose integration |
| `@nestjs/jwt` | 11.0.1 | JWT token handling |
| `@nestjs/passport` | 11.0.5 | Auth strategies |
| `@nestjs/swagger` | 11.2.0 | API documentation |
| `class-validator` | 0.14.2 | DTO validation |
| `class-transformer` | 0.5.1 | Serialization |
| `nestjs-i18n` | 10.5.1 | Internationalization |
| `@aws-sdk/client-s3` | 3.864.0 | S3 file storage |
| `bcryptjs` | 3.0.2 | Password hashing |
| `handlebars` | 4.7.8 | Email templates |
| `nodemailer` | 7.0.7 | Email sending |

---

## 15. Conventions Checklist (for new features)

When adding a new LMS feature:

- [ ] **Domain class** extends `LmsBaseDomain` — pure POJO, no ORM decorators
- [ ] **Create DTO** extends `TenantAwareBaseDto` — includes `tenantId` + optional `branchId`
- [ ] **Update DTO** uses `PartialType(CreateDto)` (from `@nestjs/swagger`)
- [ ] **Entity** extends `TenantAwareEntityHelper` — has `@Entity()`, `@PrimaryGeneratedColumn()`, timestamps
- [ ] **Mapper** has static `toDomain()` and `toPersistence()` methods
- [ ] **Abstract repository** defined as an abstract class (port)
- [ ] **Concrete repository** injects `TenantContextService`, applies `getTenantFilter()` to all queries
- [ ] **Persistence module** binds abstract → concrete via `{ provide: Abstract, useClass: Concrete }`
- [ ] **Service** injects abstract repository, throws `NotFoundException` when entity not found
- [ ] **Controller** uses `@ApiBearerAuth()`, `@UseGuards(AuthGuard('jwt'), RolesGuard)`, `@Roles(…)`, explicit `@HttpCode`
- [ ] **Route** follows pattern: `lms/<feature-plural>`, version `'1'`
- [ ] Swagger decorators on every endpoint (`@ApiTags`, `@ApiCreatedResponse`, `@ApiOkResponse`, `@ApiParam`)
- [ ] Module registered in `LmsModule` imports/exports arrays
- [ ] Soft delete via `softDelete()` in repository, `@DeleteDateColumn()` in entity
- [ ] Unit test file `*.spec.ts` co-located with service

---

## 16. File & Folder Naming

- **Files**: `kebab-case` (e.g., `grade-class.entity.ts`, `tenant-aware-base.dto.ts`)
- **Classes**: `PascalCase` (e.g., `GradeClassEntity`, `TenantAwareBaseDto`)
- **Suffixes**: `.controller.ts`, `.service.ts`, `.module.ts`, `.entity.ts`, `.repository.ts`, `.mapper.ts`, `.domain.ts` (domain has no suffix — just the name), `.dto.ts`, `.enum.ts`, `.guard.ts`, `.interceptor.ts`, `.strategy.ts`, `.spec.ts`
- **Domain files** are named after the domain class without suffix (e.g., `department.ts` not `department.domain.ts`)
- **DTOs** prefixed with action: `create-*.dto.ts`, `update-*.dto.ts`

---

## 17. Environment & Config

- `.env` file at project root (see `env-example-relational` / `env-example-document`)
- Config loaded via `@nestjs/config` with typed config functions per module
- All config is globally available via `ConfigService<AllConfigType>`
- i18n translations in `src/i18n/`, resolved via custom header (default `x-custom-lang`)

---

## 18. API Versioning & Documentation

- **URI versioning**: all routes under `/v1/…`
- **Swagger UI**: available at `/docs`
- **Scalar API Reference**: available at `/reference`
- Global Swagger parameters: `X-Tenant-ID`, `X-Branch-ID`, language header
