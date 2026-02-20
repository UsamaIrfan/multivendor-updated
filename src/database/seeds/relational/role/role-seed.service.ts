import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RoleEntity } from '../../../../roles/infrastructure/persistence/relational/entities/role.entity';
import { RoleEnum } from '../../../../roles/roles.enum';

@Injectable()
export class RoleSeedService {
  constructor(
    @InjectRepository(RoleEntity)
    private repository: Repository<RoleEntity>,
  ) {}

  async run() {
    const roles: { id: RoleEnum; name: string }[] = [
      { id: RoleEnum.admin, name: 'Admin' },
      { id: RoleEnum.user, name: 'User' },
      { id: RoleEnum.student, name: 'Student' },
      { id: RoleEnum.teacher, name: 'Teacher' },
      { id: RoleEnum.staff, name: 'Staff' },
      { id: RoleEnum.accountant, name: 'Accountant' },
      { id: RoleEnum.parent, name: 'Parent' },
    ];

    for (const role of roles) {
      const count = await this.repository.count({
        where: { id: role.id },
      });

      if (!count) {
        await this.repository.save(
          this.repository.create({
            id: role.id,
            name: role.name,
          }),
        );
      }
    }
  }
}
