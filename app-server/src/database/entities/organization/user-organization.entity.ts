import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { User } from '../user/user.entity';
import { Organization } from './organization.entity';

export enum OrganizationRole {
  ADMIN = 'admin',
  MEMBER = 'member',
}

export enum OrganizationStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
}

@Entity()
export class UserOrganization {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, (user) => user.userOrganizations, {
    nullable: false,
  })
  user: User;

  @ManyToOne(
    () => Organization,
    (organization) => organization.userOrganizations,
    { nullable: false },
  )
  organization: Organization;

  @Column({
    type: 'enum',
    enum: OrganizationRole,
    default: OrganizationRole.MEMBER,
  })
  role: OrganizationRole;

  @Column({
    type: 'enum',
    enum: OrganizationStatus,
    default: OrganizationStatus.ACTIVE,
  })
  status: OrganizationStatus;
}
