import {
  Entity,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Question } from '../question-paper/question.entity';
import { Media } from './media.entity';

@Entity()
export class QuestionImage {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @OneToOne(() => Media, {
    cascade: ['insert', 'update'],
    eager: true,
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn()
  media: Media;

  @ManyToOne(() => Question, (question) => question.images, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  question: Question;
}
