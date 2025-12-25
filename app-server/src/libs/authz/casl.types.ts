// src/libs/authz/casl.types.ts
import {
  Ability,
  InferSubjects,
  subject as defineSubject,
} from '@casl/ability';
import { Media } from '@entities/media/media.entity';
import { QuestionPaper } from '@entities/question-paper/question-paper.entity';
import { User } from '@entities/user/user.entity';
import { Action } from './actions';

// Allow both class-based and string-based subjects
export type AppSubjects =
  | InferSubjects<typeof User | typeof Media | typeof QuestionPaper>
  | 'User'
  | 'Media'
  | 'QuestionPaper'
  | 'all';

export type AppAbility = Ability<[Action, AppSubjects]>;

export const subject = defineSubject;
