import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { OrganizationInvite } from './organization-invite.entity';
import { UserOrganization } from './user-organization.entity';

@Entity()
export class Organization {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @OneToMany(
    () => UserOrganization,
    (userOrganization) => userOrganization.organization,
  )
  userOrganizations: UserOrganization[];

  @OneToMany(() => OrganizationInvite, (invite) => invite.organization)
  invites: OrganizationInvite[];
}
