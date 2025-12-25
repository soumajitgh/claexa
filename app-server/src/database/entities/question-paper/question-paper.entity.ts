import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from '../user/user.entity';
import { Question } from './question.entity';

@Entity()
export class QuestionPaper {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column()
  name: string;

  @Column({ nullable: true })
  description: string;

  @ManyToOne(() => User, (user) => user.questionPapers, { nullable: false })
  owner: User;

  @OneToMany(() => Question, (question) => question.questionPaper, {
    cascade: ['insert', 'update', 'remove'],
    nullable: false,
    orphanedRowAction: 'delete',
  })
  questions: Question[];
}
