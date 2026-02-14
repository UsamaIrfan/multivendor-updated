import { AdmissionEnquiry } from '../../../../domain/admission-enquiry';
import { AdmissionEnquiryEntity } from '../entities/admission-enquiry.entity';

export class AdmissionEnquiryMapper {
  static toDomain(entity: AdmissionEnquiryEntity): AdmissionEnquiry {
    const domain = new AdmissionEnquiry();
    domain.id = entity.id;
    domain.institutionId = entity.institution?.id;
    domain.studentName = entity.studentName;
    domain.guardianName = entity.guardianName;
    domain.phone = entity.phone;
    domain.email = entity.email;
    domain.previousSchool = entity.previousSchool;
    domain.gradeApplyingFor = entity.gradeApplyingFor;
    domain.status = entity.status;
    domain.source = entity.source;
    domain.notes = entity.notes;
    domain.followUpDate = entity.followUpDate;
    domain.convertedStudentId = entity.convertedStudentId;
    domain.tenantId = entity.tenantId;
    domain.branchId = entity.branchId;
    domain.createdAt = entity.createdAt;
    domain.updatedAt = entity.updatedAt;
    domain.deletedAt = entity.deletedAt;
    return domain;
  }

  static toPersistence(domain: AdmissionEnquiry): AdmissionEnquiryEntity {
    const entity = new AdmissionEnquiryEntity();
    if (domain.id) entity.id = domain.id;
    entity.studentName = domain.studentName;
    entity.guardianName = domain.guardianName;
    entity.phone = domain.phone;
    entity.email = domain.email;
    entity.previousSchool = domain.previousSchool;
    entity.gradeApplyingFor = domain.gradeApplyingFor;
    entity.status = domain.status;
    entity.source = domain.source;
    entity.notes = domain.notes;
    entity.followUpDate = domain.followUpDate;
    entity.convertedStudentId = domain.convertedStudentId;
    entity.tenantId = domain.tenantId;
    entity.branchId = domain.branchId;
    entity.createdAt = domain.createdAt;
    entity.updatedAt = domain.updatedAt;
    entity.deletedAt = domain.deletedAt;
    return entity;
  }
}
