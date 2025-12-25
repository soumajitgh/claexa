import {
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Option } from './option.entity';
import { Question } from './question.entity';

@Entity()
export class SubQuestion {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  text: string;

  @Column()
  index: number;

  @Column()
  marks: number;

  @OneToMany(() => Option, (option) => option.subQuestion, {
    cascade: ['insert', 'update', 'remove'],
    nullable: true,
    orphanedRowAction: 'delete',
  })
  options: Option[];

  @ManyToOne(() => Question, (question) => question.subQuestions, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  parentQuestion: Question;
}
