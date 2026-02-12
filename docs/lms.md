# LMS Module

The Learning Management System (LMS) module provides a comprehensive school/institution management system built on top of the NestJS Boilerplate. It covers institution setup, student lifecycle, staff management, and financial accounting.

---

## Table of Contents <!-- omit in toc -->

- [Overview](#overview)
- [Module Structure](#module-structure)
- [Roles](#roles)
- [Institution Module](#institution-module)
- [Student Module](#student-module)
- [Staff Module](#staff-module)
- [Accounts Module](#accounts-module)
- [Enums Reference](#enums-reference)
- [Database Migration](#database-migration)

---

## Overview

The LMS is organized as four NestJS sub-modules aggregated by a single `LmsModule`:

```typescript
// src/lms/lms.module.ts
@Module({
  imports: [InstitutionModule, StudentModule, StaffModule, AccountsModule],
  exports: [InstitutionModule, StudentModule, StaffModule, AccountsModule],
})
export class LmsModule {}
```

`LmsModule` is registered in the root `AppModule`. All entities use TypeORM with PostgreSQL and follow the [Hexagonal Architecture](architecture.md) pattern.

## Module Structure

```
src/lms/
├── lms.module.ts
├── common/enums/          # Shared enum definitions
├── institution/           # Institution, academic years, terms, departments, etc.
├── student/               # Students, enrollment, attendance, fees, exams, etc.
├── staff/                 # Staff, attendance, leaves, timetable, salary, notices
└── accounts/              # Income and expense tracking
```

## Roles

The LMS extends the base role system with five additional roles:

| Role | ID | Description |
|------|----|-------------|
| `admin` | 1 | Full system access (boilerplate default) |
| `user` | 2 | Base authenticated user (boilerplate default) |
| `student` | 3 | Student portal access |
| `teacher` | 4 | Teacher — manages classes, exams, materials |
| `staff` | 5 | Non-teaching staff |
| `accountant` | 6 | Financial management |
| `parent` | 7 | Parent/guardian portal access |

Roles are defined in `src/roles/roles.enum.ts`.

---

## Institution Module

Manages the core organizational hierarchy.

### Entities

| Entity | Table | Description |
|--------|-------|-------------|
| `InstitutionEntity` | `institution` | School/college — root entity. Fields: name, code (unique), address, city, state, country, phone, email, website, logo, isActive. |
| `AcademicYearEntity` | `academic_year` | Yearly academic period. Fields: name (unique per institution), startDate, endDate, isCurrent. Belongs to `institution`. |
| `TermEntity` | `term` | Semester/quarter within an academic year. Fields: name, startDate, endDate, isCurrent. Belongs to `academic_year`. |
| `DepartmentEntity` | `department` | Academic department. Fields: name, code (unique per institution), headOfDepartment, description. Belongs to `institution`. |
| `GradeClassEntity` | `grade_class` | Grade/class level (e.g., Grade 1, Class 10). Fields: name, code (unique per institution), sortOrder, description. Belongs to `institution`, optional `department`. |
| `SectionEntity` | `section` | Division within a grade (e.g., Section A). Fields: name, code (unique per grade), capacity. Belongs to `grade_class`. |
| `SubjectEntity` | `subject` | Academic subject. Fields: name, code (unique per grade), creditHours, description. Belongs to `grade_class`, optional `department`. |

### Key Relationships

- Institution → Academic Years → Terms
- Institution → Departments
- Institution → Grade/Classes → Sections
- Institution → Grade/Classes → Subjects

---

## Student Module

Manages the complete student lifecycle — from admission enquiry through enrollment, attendance, fees, and exams.

### Entities

| Entity | Table | Description |
|--------|-------|-------------|
| `AdmissionEnquiryEntity` | `admission_enquiry` | Pre-admission enquiry. Fields: studentName, parentName, phone, email, previousSchool, source (enum), status (enum), notes, followUpDate, preferredGrade. Belongs to `institution`, optional `grade_class`. |
| `StudentEntity` | `student` | Enrolled student profile. Fields: rollNumber (unique), dateOfBirth, gender (enum), guardianName/Phone/Email/Relation, address, city, bloodGroup (enum), nationality, religion, admissionDate. Links to `user` (OneToOne) and `institution`. |
| `StudentDocumentEntity` | `student_document` | Uploaded document. Fields: documentType, isVerified, remarks. Links to `student` and optional `file`. |
| `StudentEnrollmentEntity` | `student_enrollment` | Enrollment in a section for an academic year. Fields: enrollmentDate, status (enum). Unique constraint on [student, section, academicYear]. |
| `StudentAttendanceEntity` | `student_attendance` | Daily attendance record. Fields: date, status (enum), remarks. Unique constraint on [student, section, date]. |
| `LeaveRequestEntity` | `leave_request` | Student leave application. Fields: fromDate, toDate, leaveType (enum), reason, status (enum), approvedBy, adminRemarks. |
| `FeeStructureEntity` | `fee_structure` | Fee definition template. Fields: name, amount, frequency (enum), description, isActive. Belongs to `institution`, `grade_class`, `academic_year`. |
| `FeeChallanEntity` | `fee_challan` | Fee invoice. Fields: challanNumber (unique), totalAmount, paidAmount, discount, dueDate, issueDate, status (enum), remarks. Links to `student` and `fee_structure`. |
| `FeePaymentEntity` | `fee_payment` | Payment transaction. Fields: receiptNumber (unique), amount, paymentDate, paymentMethod (enum), transactionRef, remarks. Links to `fee_challan`. |
| `ExamEntity` | `exam` | Examination. Fields: name, type (enum), startDate, endDate, description. Belongs to `term`. |
| `ExamSubjectEntity` | `exam_subject` | Subject within an exam. Fields: examDate, maxMarks, passingMarks. Links `exam` ↔ `subject`. |
| `ExamResultEntity` | `exam_result` | Individual result. Fields: marksObtained, grade, isAbsent, remarks. Unique constraint on [examSubject, student]. |
| `CourseMaterialEntity` | `course_material` | Study material. Fields: title, description, type (enum), externalUrl, isActive. Links to `subject` and optional `file`. |

### Key Relationships

- Student → Documents, Enrollments, Attendance, Leave Requests, Fee Challans, Exam Results
- Fee Structure → Fee Challans → Fee Payments
- Exam → Exam Subjects → Exam Results

---

## Staff Module

Manages teaching and non-teaching staff.

### Entities

| Entity | Table | Description |
|--------|-------|-------------|
| `StaffEntity` | `staff` | Staff profile. Fields: employeeId (unique), designation, qualification, specialization, experienceYears, joiningDate, basicSalary, employmentType (enum), emergencyContact, address. Links to `user` (OneToOne), `institution`, optional `department`. |
| `StaffAttendanceEntity` | `staff_attendance` | Daily attendance. Fields: date, checkIn, checkOut, status (enum), remarks. Unique on [staff, date]. |
| `StaffLeaveEntity` | `staff_leave` | Leave request. Fields: fromDate, toDate, leaveType (enum), reason, status (enum), approvedBy, adminRemarks. |
| `NoticeEntity` | `notice` | Announcements. Fields: title, content, targetAudience (enum), publishDate, expiryDate, isPinned, isActive. Belongs to `institution`, published by `user`. |
| `TimetableSlotEntity` | `timetable_slot` | Class schedule. Fields: dayOfWeek (enum), startTime, endTime, room. Links `section` ↔ `subject` ↔ `staff` (teacher), belongs to `academic_year`. |
| `SalarySlipEntity` | `salary_slip` | Monthly payroll. Fields: month, year, basicSalary, allowances, deductions, netSalary, paidOn, status (enum), remarks. Unique on [staff, month, year]. |

### Key Relationships

- Staff → Attendance, Leaves, Salary Slips
- Staff (teacher) → Timetable Slots
- Notice → Institution + Published By User

---

## Accounts Module

Tracks institutional income and expenses.

### Entities

| Entity | Table | Description |
|--------|-------|-------------|
| `IncomeEntity` | `income` | Income record. Fields: category, description, amount, date, referenceNumber, receivedFrom, remarks. Belongs to `institution`, optional link to `fee_payment`. |
| `ExpenseEntity` | `expense` | Expense record. Fields: category, description, amount, date, referenceNumber, paidTo, status (enum), remarks. Belongs to `institution`, optional link to `salary_slip`. |

### Key Relationships

- Fee Payment → Income (automatic revenue tracking)
- Salary Slip → Expense (automatic payroll expense tracking)

---

## Enums Reference

All enums are defined in `src/lms/common/enums/` and exported via the barrel `index.ts`.

| File | Enums |
|------|-------|
| `general.enum.ts` | `GenderEnum`, `BloodGroupEnum`, `DayOfWeekEnum`, `EnrollmentStatusEnum`, `EmploymentTypeEnum`, `TargetAudienceEnum`, `CourseMaterialTypeEnum`, `SalaryStatusEnum`, `ExpenseStatusEnum`, `EnquirySourceEnum` |
| `admission-status.enum.ts` | `AdmissionStatusEnum` |
| `attendance-status.enum.ts` | `AttendanceStatusEnum` |
| `leave-status.enum.ts` | `LeaveStatusEnum`, `LeaveTypeEnum` |
| `payment-status.enum.ts` | `PaymentStatusEnum`, `PaymentMethodEnum`, `FeeFrequencyEnum` |
| `exam.enum.ts` | `ExamTypeEnum` |

---

## Database Migration

The LMS schema is managed by migration `LmsSchema1770930398142` located at `src/database/migrations/`. It creates all 28 tables, indexes, and foreign key constraints.

To run or regenerate:

```bash
# Run existing migration
npm run migration:run

# Generate a new migration after entity changes
npm run migration:generate -- src/database/migrations/LmsSchemaUpdate
```

> **Note:** The LMS migration only creates LMS-specific tables. Base tables (user, role, status, file, session) are handled by the `CreateUser` migration.

---

Previous: [Translations](translations.md)

Next: [README](readme.md)
