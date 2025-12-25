import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Organization } from './organization.entity';
import { OrganizationRole } from './user-organization.entity';

export enum InviteStatus {
  PENDING = 'pending',
  ACCEPTED = 'accepted',
  REJECTED = 'rejected',
}

@Entity()
export class OrganizationInvite {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  email: string;

  @ManyToOne(() => Organization, (organization) => organization.invites)
  organization: Organization;

  @Column()
  role: OrganizationRole;

  @Column({
    type: 'enum',
    enum: InviteStatus,
    default: InviteStatus.PENDING,
  })
  status: InviteStatus;
}
