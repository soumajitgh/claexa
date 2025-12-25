import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Question } from './question.entity';
import { SubQuestion } from './sub-question.entity';

@Entity()
export class Option {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  text: string;

  @Column()
  index: number;

  @ManyToOne(() => Question, (question) => question.options, {
    nullable: true,
    onDelete: 'CASCADE',
  })
  question: Question;

  @ManyToOne(() => SubQuestion, (subQuestion) => subQuestion.options, {
    nullable: true,
    onDelete: 'CASCADE',
  })
  subQuestion: SubQuestion;
}
