import {
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { QuestionImage } from '../media/question-image.entity';
import { Option } from './option.entity';
import { QuestionPaper } from './question-paper.entity';
import { SubQuestion } from './sub-question.entity';

@Entity()
export class Question {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  text: string;

  @Column()
  index: number;

  @Column()
  marks: number;

  @OneToMany(() => Option, (option) => option.question, {
    cascade: true,
    nullable: true,
  })
  options: Option[];

  @OneToMany(() => SubQuestion, (subQuestion) => subQuestion.parentQuestion, {
    cascade: true,
    nullable: true,
  })
  subQuestions: SubQuestion[];

  @OneToMany(() => QuestionImage, (image) => image.question, {
    cascade: ['insert', 'update', 'remove'],
    nullable: true,
    orphanedRowAction: 'delete',
  })
  images: QuestionImage[];

  @ManyToOne(() => QuestionPaper, (paper) => paper.questions, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  questionPaper: QuestionPaper;
}
