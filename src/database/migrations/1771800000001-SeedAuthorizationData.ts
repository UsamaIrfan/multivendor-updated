import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Seeds the permission and role_permission tables with the complete
 * authorization matrix for the LMS system.
 *
 * Permissions follow dot-notation: <domain>.<resource>.<action>
 * Domains: academic, hr, finance, communication, system
 *
 * Role IDs (from RoleEnum):
 * 1=admin, 2=user, 3=student, 4=teacher, 5=staff, 6=accountant, 7=parent
 *
 * Scope levels: platform, tenant, branch, section, self, parent
 */
export class SeedAuthorizationData1771800000001 implements MigrationInterface {
  name = 'SeedAuthorizationData1771800000001';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // ──────────────────────────────────────────────────────────
    // 1. Insert all permissions
    // ──────────────────────────────────────────────────────────
    await queryRunner.query(`
      INSERT INTO permission (code, domain, description) VALUES
      -- ═══ ACADEMIC DOMAIN ═══
      ('academic.student.create', 'academic', 'Create student records'),
      ('academic.student.read', 'academic', 'View student records'),
      ('academic.student.update', 'academic', 'Update student records'),
      ('academic.student.delete', 'academic', 'Delete student records'),
      ('academic.student.import', 'academic', 'Bulk import students via CSV'),
      ('academic.student.export', 'academic', 'Export student data'),

      ('academic.enrollment.create', 'academic', 'Enroll students in sections'),
      ('academic.enrollment.read', 'academic', 'View enrollment records'),
      ('academic.enrollment.update', 'academic', 'Update enrollment status'),
      ('academic.enrollment.delete', 'academic', 'Remove enrollments'),

      ('academic.attendance.mark', 'academic', 'Mark student attendance'),
      ('academic.attendance.read', 'academic', 'View attendance records'),
      ('academic.attendance.report', 'academic', 'Generate attendance reports'),

      ('academic.exam.create', 'academic', 'Create exam schedules'),
      ('academic.exam.read', 'academic', 'View exam schedules'),
      ('academic.exam.update', 'academic', 'Update exam details'),
      ('academic.exam.delete', 'academic', 'Delete exams'),
      ('academic.exam.publish', 'academic', 'Publish exam results'),

      ('academic.marks.create', 'academic', 'Enter exam marks'),
      ('academic.marks.read', 'academic', 'View exam marks/results'),
      ('academic.marks.update', 'academic', 'Update exam marks'),
      ('academic.marks.bulk_import', 'academic', 'Bulk import marks'),

      ('academic.report_card.read', 'academic', 'View/download report cards'),
      ('academic.analytics.read', 'academic', 'View exam analytics'),

      ('academic.material.create', 'academic', 'Upload course materials'),
      ('academic.material.read', 'academic', 'View/download course materials'),
      ('academic.material.update', 'academic', 'Update course materials'),
      ('academic.material.delete', 'academic', 'Delete course materials'),

      ('academic.assignment.create', 'academic', 'Create assignments'),
      ('academic.assignment.read', 'academic', 'View assignments'),
      ('academic.assignment.update', 'academic', 'Update assignments'),
      ('academic.assignment.delete', 'academic', 'Delete assignments'),
      ('academic.assignment.submit', 'academic', 'Submit assignment work'),
      ('academic.submission.read', 'academic', 'View assignment submissions'),
      ('academic.submission.grade', 'academic', 'Grade assignment submissions'),

      ('academic.timetable.create', 'academic', 'Create timetable slots'),
      ('academic.timetable.read', 'academic', 'View timetable'),
      ('academic.timetable.update', 'academic', 'Update timetable'),
      ('academic.timetable.delete', 'academic', 'Delete timetable slots'),

      ('academic.institution.create', 'academic', 'Create institutions'),
      ('academic.institution.read', 'academic', 'View institutions'),
      ('academic.institution.update', 'academic', 'Update institutions'),
      ('academic.institution.delete', 'academic', 'Delete institutions'),

      ('academic.department.create', 'academic', 'Create departments'),
      ('academic.department.read', 'academic', 'View departments'),
      ('academic.department.update', 'academic', 'Update departments'),
      ('academic.department.delete', 'academic', 'Delete departments'),

      ('academic.grade_class.create', 'academic', 'Create grade/class'),
      ('academic.grade_class.read', 'academic', 'View grade/class'),
      ('academic.grade_class.update', 'academic', 'Update grade/class'),
      ('academic.grade_class.delete', 'academic', 'Delete grade/class'),

      ('academic.section.create', 'academic', 'Create sections'),
      ('academic.section.read', 'academic', 'View sections'),
      ('academic.section.update', 'academic', 'Update sections'),
      ('academic.section.delete', 'academic', 'Delete sections'),

      ('academic.subject.create', 'academic', 'Create subjects'),
      ('academic.subject.read', 'academic', 'View subjects'),
      ('academic.subject.update', 'academic', 'Update subjects'),
      ('academic.subject.delete', 'academic', 'Delete subjects'),

      ('academic.academic_year.create', 'academic', 'Create academic years'),
      ('academic.academic_year.read', 'academic', 'View academic years'),
      ('academic.academic_year.update', 'academic', 'Update academic years'),
      ('academic.academic_year.delete', 'academic', 'Delete academic years'),

      ('academic.academic_term.create', 'academic', 'Create academic terms'),
      ('academic.academic_term.read', 'academic', 'View academic terms'),
      ('academic.academic_term.update', 'academic', 'Update academic terms'),
      ('academic.academic_term.delete', 'academic', 'Delete academic terms'),

      ('academic.grading_scale.create', 'academic', 'Create grading scales'),
      ('academic.grading_scale.read', 'academic', 'View grading scales'),

      ('academic.registration.create', 'academic', 'Register new students'),
      ('academic.registration.read', 'academic', 'View registrations'),
      ('academic.registration.update', 'academic', 'Update registration info'),
      ('academic.registration.approve', 'academic', 'Approve/reject registrations'),

      ('academic.document.upload', 'academic', 'Upload student documents'),
      ('academic.document.read', 'academic', 'View student documents'),
      ('academic.document.delete', 'academic', 'Delete student documents'),

      ('academic.guardian.create', 'academic', 'Add guardians'),
      ('academic.guardian.read', 'academic', 'View guardians'),
      ('academic.guardian.update', 'academic', 'Update guardians'),
      ('academic.guardian.delete', 'academic', 'Delete guardians'),

      -- ═══ HR DOMAIN ═══
      ('hr.staff.create', 'hr', 'Create staff records'),
      ('hr.staff.read', 'hr', 'View staff records'),
      ('hr.staff.update', 'hr', 'Update staff records'),
      ('hr.staff.delete', 'hr', 'Delete staff records'),

      ('hr.branch_assignment.create', 'hr', 'Assign staff to branches'),
      ('hr.branch_assignment.read', 'hr', 'View branch assignments'),
      ('hr.branch_assignment.delete', 'hr', 'Remove branch assignments'),
      ('hr.branch_transfer.create', 'hr', 'Transfer staff between branches'),

      ('hr.attendance.check_in', 'hr', 'Check in staff attendance'),
      ('hr.attendance.check_out', 'hr', 'Check out staff attendance'),
      ('hr.attendance.read', 'hr', 'View staff attendance'),
      ('hr.attendance.report', 'hr', 'Generate staff attendance reports'),

      ('hr.leave.apply', 'hr', 'Apply for leave'),
      ('hr.leave.read', 'hr', 'View leave applications'),
      ('hr.leave.approve', 'hr', 'Approve leave requests'),
      ('hr.leave.reject', 'hr', 'Reject leave requests'),
      ('hr.leave.balance', 'hr', 'View leave balances'),

      ('hr.payroll.structure_create', 'hr', 'Create salary structures'),
      ('hr.payroll.structure_read', 'hr', 'View salary structures'),
      ('hr.payroll.structure_update', 'hr', 'Update salary structures'),
      ('hr.payroll.structure_delete', 'hr', 'Delete salary structures'),
      ('hr.payroll.process', 'hr', 'Process payroll'),
      ('hr.payroll.slip_read', 'hr', 'View payroll slips'),
      ('hr.payroll.slip_pdf', 'hr', 'Download payslip PDFs'),

      -- ═══ FINANCE DOMAIN ═══
      ('finance.fee_structure.create', 'finance', 'Create fee structures'),
      ('finance.fee_structure.read', 'finance', 'View fee structures'),
      ('finance.fee_structure.update', 'finance', 'Update fee structures'),

      ('finance.challan.generate', 'finance', 'Generate fee challans'),
      ('finance.challan.read', 'finance', 'View fee challans'),
      ('finance.challan.bulk_generate', 'finance', 'Bulk generate challans'),

      ('finance.payment.create', 'finance', 'Record fee payments'),
      ('finance.payment.verify', 'finance', 'Verify fee payments'),
      ('finance.payment.read', 'finance', 'View payment records'),

      ('finance.concession.create', 'finance', 'Apply fee concessions'),
      ('finance.concession.read', 'finance', 'View concessions'),
      ('finance.receipt.pdf', 'finance', 'Download payment receipts'),
      ('finance.reminder.send', 'finance', 'Send payment reminders'),

      ('finance.report.collection', 'finance', 'View collection reports'),
      ('finance.report.pending', 'finance', 'View pending fees reports'),
      ('finance.report.defaulters', 'finance', 'View defaulters list'),

      ('finance.income.create', 'finance', 'Record income entries'),
      ('finance.income.read', 'finance', 'View income records'),
      ('finance.income.update', 'finance', 'Update income records'),
      ('finance.income.delete', 'finance', 'Delete income records'),

      ('finance.expense.create', 'finance', 'Record expense entries'),
      ('finance.expense.read', 'finance', 'View expense records'),
      ('finance.expense.update', 'finance', 'Update expense records'),
      ('finance.expense.delete', 'finance', 'Delete expense records'),
      ('finance.expense.approve', 'finance', 'Approve expenses'),

      ('finance.dashboard.read', 'finance', 'View financial dashboard'),

      -- ═══ COMMUNICATION DOMAIN ═══
      ('communication.notice.create', 'communication', 'Create notices'),
      ('communication.notice.read', 'communication', 'View notices'),
      ('communication.notice.update', 'communication', 'Update notices'),
      ('communication.notice.delete', 'communication', 'Delete notices'),

      ('communication.invitation.create', 'communication', 'Send invitations'),
      ('communication.invitation.read', 'communication', 'View invitations'),

      -- ═══ SYSTEM DOMAIN ═══
      ('system.tenant.create', 'system', 'Create tenants'),
      ('system.tenant.read', 'system', 'View tenant details'),
      ('system.tenant.update', 'system', 'Update tenant settings'),

      ('system.branch.create', 'system', 'Create branches'),
      ('system.branch.read', 'system', 'View branches'),
      ('system.branch.update', 'system', 'Update branches'),
      ('system.branch.delete', 'system', 'Delete branches'),

      ('system.user.create', 'system', 'Create user accounts'),
      ('system.user.read', 'system', 'View user accounts'),
      ('system.user.update', 'system', 'Update user accounts'),
      ('system.user.delete', 'system', 'Delete user accounts'),

      ('system.role.read', 'system', 'View role-permission mappings'),
      ('system.role.manage', 'system', 'Manage role-permission mappings'),

      ('system.permission.read', 'system', 'View permission definitions'),
      ('system.permission.manage', 'system', 'Manage permission definitions'),

      ('system.user_override.read', 'system', 'View user permission overrides'),
      ('system.user_override.manage', 'system', 'Manage user permission overrides'),

      ('system.audit.read', 'system', 'View audit logs'),

      ('system.file.upload', 'system', 'Upload files'),
      ('system.file.read', 'system', 'View/download files'),

      -- ═══ PORTAL DOMAIN ═══
      ('portal.student_dashboard.read', 'portal', 'Access student dashboard'),
      ('portal.staff_dashboard.read', 'portal', 'Access staff dashboard'),
      ('portal.admin_dashboard.read', 'portal', 'Access admin dashboard'),
      ('portal.my_attendance.read', 'portal', 'View own attendance'),
      ('portal.my_fees.read', 'portal', 'View own fee challans'),
      ('portal.my_results.read', 'portal', 'View own exam results'),
      ('portal.my_timetable.read', 'portal', 'View own timetable'),
      ('portal.my_materials.read', 'portal', 'View own course materials'),
      ('portal.my_leaves.read', 'portal', 'View own leave status'),
      ('portal.my_payslips.read', 'portal', 'View own payslips'),
      ('portal.child_attendance.read', 'portal', 'View child attendance'),
      ('portal.child_fees.read', 'portal', 'View child fee challans'),
      ('portal.child_results.read', 'portal', 'View child exam results')
      ON CONFLICT (code) DO NOTHING;
    `);

    // ──────────────────────────────────────────────────────────
    // 1b. Ensure all LMS roles exist (seeds may not have run)
    // ──────────────────────────────────────────────────────────
    await queryRunner.query(`
      INSERT INTO "role" (id, name) VALUES
        (1, 'Admin'),
        (2, 'User'),
        (3, 'Student'),
        (4, 'Teacher'),
        (5, 'Staff'),
        (6, 'Accountant'),
        (7, 'Parent')
      ON CONFLICT (id) DO NOTHING;
    `);

    // ──────────────────────────────────────────────────────────
    // 2. Build role_permission mappings
    //    Using sub-selects to reference permission IDs by code
    // ──────────────────────────────────────────────────────────

    // Helper: generates INSERT for a role + array of (code, scope)
    const rolePerms: Array<{
      roleId: number;
      mappings: Array<[string, string]>;
    }> = [
      // ─── ADMIN (role=1) — TENANT scope for everything ───
      {
        roleId: 1,
        mappings: [
          // Academic
          ['academic.student.create', 'tenant'],
          ['academic.student.read', 'tenant'],
          ['academic.student.update', 'tenant'],
          ['academic.student.delete', 'tenant'],
          ['academic.student.import', 'tenant'],
          ['academic.student.export', 'tenant'],
          ['academic.enrollment.create', 'tenant'],
          ['academic.enrollment.read', 'tenant'],
          ['academic.enrollment.update', 'tenant'],
          ['academic.enrollment.delete', 'tenant'],
          ['academic.attendance.mark', 'tenant'],
          ['academic.attendance.read', 'tenant'],
          ['academic.attendance.report', 'tenant'],
          ['academic.exam.create', 'tenant'],
          ['academic.exam.read', 'tenant'],
          ['academic.exam.update', 'tenant'],
          ['academic.exam.delete', 'tenant'],
          ['academic.exam.publish', 'tenant'],
          ['academic.marks.create', 'tenant'],
          ['academic.marks.read', 'tenant'],
          ['academic.marks.update', 'tenant'],
          ['academic.marks.bulk_import', 'tenant'],
          ['academic.report_card.read', 'tenant'],
          ['academic.analytics.read', 'tenant'],
          ['academic.material.create', 'tenant'],
          ['academic.material.read', 'tenant'],
          ['academic.material.update', 'tenant'],
          ['academic.material.delete', 'tenant'],
          ['academic.assignment.create', 'tenant'],
          ['academic.assignment.read', 'tenant'],
          ['academic.assignment.update', 'tenant'],
          ['academic.assignment.delete', 'tenant'],
          ['academic.submission.read', 'tenant'],
          ['academic.submission.grade', 'tenant'],
          ['academic.timetable.create', 'tenant'],
          ['academic.timetable.read', 'tenant'],
          ['academic.timetable.update', 'tenant'],
          ['academic.timetable.delete', 'tenant'],
          ['academic.institution.create', 'tenant'],
          ['academic.institution.read', 'tenant'],
          ['academic.institution.update', 'tenant'],
          ['academic.institution.delete', 'tenant'],
          ['academic.department.create', 'tenant'],
          ['academic.department.read', 'tenant'],
          ['academic.department.update', 'tenant'],
          ['academic.department.delete', 'tenant'],
          ['academic.grade_class.create', 'tenant'],
          ['academic.grade_class.read', 'tenant'],
          ['academic.grade_class.update', 'tenant'],
          ['academic.grade_class.delete', 'tenant'],
          ['academic.section.create', 'tenant'],
          ['academic.section.read', 'tenant'],
          ['academic.section.update', 'tenant'],
          ['academic.section.delete', 'tenant'],
          ['academic.subject.create', 'tenant'],
          ['academic.subject.read', 'tenant'],
          ['academic.subject.update', 'tenant'],
          ['academic.subject.delete', 'tenant'],
          ['academic.academic_year.create', 'tenant'],
          ['academic.academic_year.read', 'tenant'],
          ['academic.academic_year.update', 'tenant'],
          ['academic.academic_year.delete', 'tenant'],
          ['academic.academic_term.create', 'tenant'],
          ['academic.academic_term.read', 'tenant'],
          ['academic.academic_term.update', 'tenant'],
          ['academic.academic_term.delete', 'tenant'],
          ['academic.grading_scale.create', 'tenant'],
          ['academic.grading_scale.read', 'tenant'],
          ['academic.registration.create', 'tenant'],
          ['academic.registration.read', 'tenant'],
          ['academic.registration.update', 'tenant'],
          ['academic.registration.approve', 'tenant'],
          ['academic.document.upload', 'tenant'],
          ['academic.document.read', 'tenant'],
          ['academic.document.delete', 'tenant'],
          ['academic.guardian.create', 'tenant'],
          ['academic.guardian.read', 'tenant'],
          ['academic.guardian.update', 'tenant'],
          ['academic.guardian.delete', 'tenant'],
          // HR
          ['hr.staff.create', 'tenant'],
          ['hr.staff.read', 'tenant'],
          ['hr.staff.update', 'tenant'],
          ['hr.staff.delete', 'tenant'],
          ['hr.branch_assignment.create', 'tenant'],
          ['hr.branch_assignment.read', 'tenant'],
          ['hr.branch_assignment.delete', 'tenant'],
          ['hr.branch_transfer.create', 'tenant'],
          ['hr.attendance.check_in', 'tenant'],
          ['hr.attendance.check_out', 'tenant'],
          ['hr.attendance.read', 'tenant'],
          ['hr.attendance.report', 'tenant'],
          ['hr.leave.apply', 'tenant'],
          ['hr.leave.read', 'tenant'],
          ['hr.leave.approve', 'tenant'],
          ['hr.leave.reject', 'tenant'],
          ['hr.leave.balance', 'tenant'],
          ['hr.payroll.structure_create', 'tenant'],
          ['hr.payroll.structure_read', 'tenant'],
          ['hr.payroll.structure_update', 'tenant'],
          ['hr.payroll.structure_delete', 'tenant'],
          ['hr.payroll.process', 'tenant'],
          ['hr.payroll.slip_read', 'tenant'],
          ['hr.payroll.slip_pdf', 'tenant'],
          // Finance
          ['finance.fee_structure.create', 'tenant'],
          ['finance.fee_structure.read', 'tenant'],
          ['finance.fee_structure.update', 'tenant'],
          ['finance.challan.generate', 'tenant'],
          ['finance.challan.read', 'tenant'],
          ['finance.challan.bulk_generate', 'tenant'],
          ['finance.payment.create', 'tenant'],
          ['finance.payment.verify', 'tenant'],
          ['finance.payment.read', 'tenant'],
          ['finance.concession.create', 'tenant'],
          ['finance.concession.read', 'tenant'],
          ['finance.receipt.pdf', 'tenant'],
          ['finance.reminder.send', 'tenant'],
          ['finance.report.collection', 'tenant'],
          ['finance.report.pending', 'tenant'],
          ['finance.report.defaulters', 'tenant'],
          ['finance.income.create', 'tenant'],
          ['finance.income.read', 'tenant'],
          ['finance.income.update', 'tenant'],
          ['finance.income.delete', 'tenant'],
          ['finance.expense.create', 'tenant'],
          ['finance.expense.read', 'tenant'],
          ['finance.expense.update', 'tenant'],
          ['finance.expense.delete', 'tenant'],
          ['finance.expense.approve', 'tenant'],
          ['finance.dashboard.read', 'tenant'],
          // Communication
          ['communication.notice.create', 'tenant'],
          ['communication.notice.read', 'tenant'],
          ['communication.notice.update', 'tenant'],
          ['communication.notice.delete', 'tenant'],
          ['communication.invitation.create', 'tenant'],
          ['communication.invitation.read', 'tenant'],
          // System
          ['system.tenant.create', 'tenant'],
          ['system.tenant.read', 'tenant'],
          ['system.tenant.update', 'tenant'],
          ['system.branch.create', 'tenant'],
          ['system.branch.read', 'tenant'],
          ['system.branch.update', 'tenant'],
          ['system.branch.delete', 'tenant'],
          ['system.user.create', 'tenant'],
          ['system.user.read', 'tenant'],
          ['system.user.update', 'tenant'],
          ['system.user.delete', 'tenant'],
          ['system.role.read', 'tenant'],
          ['system.role.manage', 'tenant'],
          ['system.permission.read', 'tenant'],
          ['system.permission.manage', 'tenant'],
          ['system.user_override.read', 'tenant'],
          ['system.user_override.manage', 'tenant'],
          ['system.audit.read', 'tenant'],
          ['system.file.upload', 'tenant'],
          ['system.file.read', 'tenant'],
          // Portal
          ['portal.admin_dashboard.read', 'tenant'],
          ['portal.staff_dashboard.read', 'tenant'],
        ],
      },

      // ─── TEACHER (role=4) ───
      {
        roleId: 4,
        mappings: [
          // Academic — section-scoped
          ['academic.student.read', 'section'],
          ['academic.attendance.mark', 'section'],
          ['academic.attendance.read', 'section'],
          ['academic.attendance.report', 'section'],
          ['academic.exam.create', 'section'],
          ['academic.exam.read', 'section'],
          ['academic.exam.update', 'section'],
          ['academic.marks.create', 'section'],
          ['academic.marks.read', 'section'],
          ['academic.marks.update', 'section'],
          ['academic.marks.bulk_import', 'section'],
          ['academic.report_card.read', 'section'],
          ['academic.analytics.read', 'section'],
          ['academic.material.create', 'section'],
          ['academic.material.read', 'section'],
          ['academic.material.update', 'section'],
          ['academic.assignment.create', 'section'],
          ['academic.assignment.read', 'section'],
          ['academic.assignment.update', 'section'],
          ['academic.submission.read', 'section'],
          ['academic.submission.grade', 'section'],
          ['academic.timetable.read', 'self'],
          ['academic.enrollment.read', 'section'],
          ['academic.grading_scale.read', 'tenant'],
          ['academic.institution.read', 'tenant'],
          ['academic.department.read', 'tenant'],
          ['academic.grade_class.read', 'tenant'],
          ['academic.section.read', 'tenant'],
          ['academic.subject.read', 'tenant'],
          ['academic.academic_year.read', 'tenant'],
          ['academic.academic_term.read', 'tenant'],
          ['academic.guardian.read', 'section'],
          // HR — self-scoped
          ['hr.staff.read', 'self'],
          ['hr.attendance.check_in', 'self'],
          ['hr.attendance.check_out', 'self'],
          ['hr.attendance.read', 'self'],
          ['hr.leave.apply', 'self'],
          ['hr.leave.read', 'self'],
          ['hr.leave.balance', 'self'],
          ['hr.payroll.structure_read', 'self'],
          ['hr.payroll.slip_read', 'self'],
          ['hr.payroll.slip_pdf', 'self'],
          ['hr.branch_assignment.read', 'self'],
          // Communication
          ['communication.notice.read', 'tenant'],
          // System
          ['system.branch.read', 'tenant'],
          ['system.file.upload', 'tenant'],
          ['system.file.read', 'tenant'],
          // Portal
          ['portal.staff_dashboard.read', 'self'],
          ['portal.my_attendance.read', 'self'],
          ['portal.my_timetable.read', 'self'],
          ['portal.my_leaves.read', 'self'],
          ['portal.my_payslips.read', 'self'],
          ['portal.my_materials.read', 'self'],
        ],
      },

      // ─── STAFF (role=5) ───
      {
        roleId: 5,
        mappings: [
          // Academic — branch-scoped read
          ['academic.student.read', 'branch'],
          ['academic.enrollment.read', 'branch'],
          ['academic.attendance.read', 'branch'],
          ['academic.exam.read', 'branch'],
          ['academic.marks.read', 'branch'],
          ['academic.material.read', 'branch'],
          ['academic.assignment.read', 'branch'],
          ['academic.timetable.read', 'branch'],
          ['academic.institution.read', 'tenant'],
          ['academic.department.read', 'tenant'],
          ['academic.grade_class.read', 'tenant'],
          ['academic.section.read', 'tenant'],
          ['academic.subject.read', 'tenant'],
          ['academic.academic_year.read', 'tenant'],
          ['academic.academic_term.read', 'tenant'],
          ['academic.grading_scale.read', 'tenant'],
          ['academic.registration.read', 'branch'],
          ['academic.guardian.read', 'branch'],
          // HR — self-scoped
          ['hr.staff.read', 'self'],
          ['hr.attendance.check_in', 'self'],
          ['hr.attendance.check_out', 'self'],
          ['hr.attendance.read', 'self'],
          ['hr.leave.apply', 'self'],
          ['hr.leave.read', 'self'],
          ['hr.leave.balance', 'self'],
          ['hr.payroll.structure_read', 'self'],
          ['hr.payroll.slip_read', 'self'],
          ['hr.payroll.slip_pdf', 'self'],
          ['hr.branch_assignment.read', 'self'],
          // Finance — branch-scoped read
          ['finance.fee_structure.read', 'branch'],
          ['finance.challan.read', 'branch'],
          ['finance.payment.read', 'branch'],
          // Communication
          ['communication.notice.create', 'branch'],
          ['communication.notice.read', 'tenant'],
          ['communication.notice.update', 'branch'],
          // System
          ['system.branch.read', 'tenant'],
          ['system.file.upload', 'tenant'],
          ['system.file.read', 'tenant'],
          // Portal
          ['portal.staff_dashboard.read', 'self'],
          ['portal.my_attendance.read', 'self'],
          ['portal.my_timetable.read', 'self'],
          ['portal.my_leaves.read', 'self'],
          ['portal.my_payslips.read', 'self'],
        ],
      },

      // ─── ACCOUNTANT (role=6) ───
      {
        roleId: 6,
        mappings: [
          // Academic — read-only for fee context
          ['academic.student.read', 'branch'],
          ['academic.enrollment.read', 'branch'],
          ['academic.institution.read', 'tenant'],
          ['academic.department.read', 'tenant'],
          ['academic.grade_class.read', 'tenant'],
          ['academic.section.read', 'tenant'],
          ['academic.academic_year.read', 'tenant'],
          ['academic.academic_term.read', 'tenant'],
          // HR — limited
          ['hr.staff.read', 'self'],
          ['hr.attendance.check_in', 'self'],
          ['hr.attendance.check_out', 'self'],
          ['hr.attendance.read', 'self'],
          ['hr.leave.apply', 'self'],
          ['hr.leave.read', 'self'],
          ['hr.leave.balance', 'self'],
          ['hr.payroll.structure_create', 'tenant'],
          ['hr.payroll.structure_read', 'tenant'],
          ['hr.payroll.structure_update', 'tenant'],
          ['hr.payroll.process', 'tenant'],
          ['hr.payroll.slip_read', 'tenant'],
          ['hr.payroll.slip_pdf', 'tenant'],
          ['hr.branch_assignment.read', 'self'],
          // Finance — full access
          ['finance.fee_structure.create', 'tenant'],
          ['finance.fee_structure.read', 'tenant'],
          ['finance.fee_structure.update', 'tenant'],
          ['finance.challan.generate', 'tenant'],
          ['finance.challan.read', 'tenant'],
          ['finance.challan.bulk_generate', 'tenant'],
          ['finance.payment.create', 'tenant'],
          ['finance.payment.read', 'tenant'],
          ['finance.concession.create', 'tenant'],
          ['finance.concession.read', 'tenant'],
          ['finance.receipt.pdf', 'tenant'],
          ['finance.reminder.send', 'tenant'],
          ['finance.report.collection', 'tenant'],
          ['finance.report.pending', 'tenant'],
          ['finance.report.defaulters', 'tenant'],
          ['finance.income.create', 'tenant'],
          ['finance.income.read', 'tenant'],
          ['finance.income.update', 'tenant'],
          ['finance.income.delete', 'tenant'],
          ['finance.expense.create', 'tenant'],
          ['finance.expense.read', 'tenant'],
          ['finance.expense.update', 'tenant'],
          ['finance.expense.delete', 'tenant'],
          ['finance.dashboard.read', 'tenant'],
          // Communication
          ['communication.notice.read', 'tenant'],
          // System
          ['system.branch.read', 'tenant'],
          ['system.file.upload', 'tenant'],
          ['system.file.read', 'tenant'],
          // Portal
          ['portal.admin_dashboard.read', 'self'],
          ['portal.my_attendance.read', 'self'],
          ['portal.my_leaves.read', 'self'],
          ['portal.my_payslips.read', 'self'],
        ],
      },

      // ─── STUDENT (role=3) ───
      {
        roleId: 3,
        mappings: [
          // Academic — self-scoped
          ['academic.attendance.read', 'self'],
          ['academic.exam.read', 'self'],
          ['academic.marks.read', 'self'],
          ['academic.report_card.read', 'self'],
          ['academic.material.read', 'self'],
          ['academic.assignment.read', 'self'],
          ['academic.assignment.submit', 'self'],
          ['academic.timetable.read', 'self'],
          ['academic.enrollment.read', 'self'],
          ['academic.institution.read', 'tenant'],
          ['academic.academic_year.read', 'tenant'],
          ['academic.academic_term.read', 'tenant'],
          // Finance — self-scoped
          ['finance.challan.read', 'self'],
          ['finance.payment.read', 'self'],
          ['finance.concession.read', 'self'],
          ['finance.receipt.pdf', 'self'],
          // Communication
          ['communication.notice.read', 'tenant'],
          // System
          ['system.file.read', 'self'],
          // Portal
          ['portal.student_dashboard.read', 'self'],
          ['portal.my_attendance.read', 'self'],
          ['portal.my_fees.read', 'self'],
          ['portal.my_results.read', 'self'],
          ['portal.my_timetable.read', 'self'],
          ['portal.my_materials.read', 'self'],
        ],
      },

      // ─── PARENT (role=7) ───
      {
        roleId: 7,
        mappings: [
          // Academic — parent-scoped (linked children only)
          ['academic.student.read', 'parent'],
          ['academic.attendance.read', 'parent'],
          ['academic.exam.read', 'parent'],
          ['academic.marks.read', 'parent'],
          ['academic.report_card.read', 'parent'],
          ['academic.material.read', 'parent'],
          ['academic.assignment.read', 'parent'],
          ['academic.timetable.read', 'parent'],
          ['academic.enrollment.read', 'parent'],
          ['academic.institution.read', 'tenant'],
          ['academic.academic_year.read', 'tenant'],
          ['academic.academic_term.read', 'tenant'],
          ['academic.guardian.read', 'self'],
          // Finance — parent-scoped
          ['finance.challan.read', 'parent'],
          ['finance.payment.read', 'parent'],
          ['finance.concession.read', 'parent'],
          ['finance.receipt.pdf', 'parent'],
          // Communication
          ['communication.notice.read', 'tenant'],
          // System
          ['system.file.read', 'self'],
          // Portal
          ['portal.student_dashboard.read', 'parent'],
          ['portal.child_attendance.read', 'parent'],
          ['portal.child_fees.read', 'parent'],
          ['portal.child_results.read', 'parent'],
        ],
      },

      // ─── USER (role=2) — minimal ───
      {
        roleId: 2,
        mappings: [
          ['academic.institution.read', 'tenant'],
          ['communication.notice.read', 'tenant'],
          ['system.branch.read', 'tenant'],
          ['system.file.read', 'self'],
        ],
      },
    ];

    // Insert role_permission rows using sub-selects
    for (const { roleId, mappings } of rolePerms) {
      if (mappings.length === 0) continue;

      const values = mappings
        .map(
          ([code, scope]) =>
            `(${roleId}, (SELECT id FROM permission WHERE code = '${code}'), '${scope}'::permission_scope_enum)`,
        )
        .join(',\n        ');

      await queryRunner.query(`
        INSERT INTO role_permission ("roleId", "permissionId", scope)
        VALUES
        ${values}
        ON CONFLICT DO NOTHING;
      `);
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Remove all seeded role_permission rows
    await queryRunner.query(`DELETE FROM role_permission`);
    // Remove all seeded permissions
    await queryRunner.query(`DELETE FROM permission`);
  }
}
