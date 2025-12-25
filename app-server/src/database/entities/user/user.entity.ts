import { UserOrganization } from '@entities/organization/user-organization.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { QuestionPaper } from '../question-paper/question-paper.entity';
import { UserProfile } from './user-profile.entity';

@Entity()
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  firebaseUid: string;

  @Column({ unique: true })
  email: string;

  @Column({ type: 'int', default: 0 })
  credits: number;

  @Column({ type: 'timestamp', nullable: true })
  @CreateDateColumn()
  lastCreditsUpdated: Date;

  @OneToOne(() => UserProfile, (profile) => profile.user, {
    cascade: true,
    eager: true,
    nullable: false,
  })
  @JoinColumn()
  profile: UserProfile;

  @OneToOne(() => UserOrganization, { nullable: true, eager: true })
  @JoinColumn()
  activeUserOrganization: UserOrganization;

  @OneToMany(
    () => UserOrganization,
    (userOrganization) => userOrganization.user,
  )
  userOrganizations: UserOrganization[];

  @OneToMany(() => QuestionPaper, (questionPaper) => questionPaper.owner)
  questionPapers: QuestionPaper[];
}
