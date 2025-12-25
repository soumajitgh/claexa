// src/libs/authz/ability.factory.ts
import {
  Ability,
  AbilityBuilder,
  AbilityClass,
  ExtractSubjectType,
} from '@casl/ability';
import { Media } from '@entities/media/media.entity';
import { QuestionPaper } from '@entities/question-paper/question-paper.entity';
import { User } from '@entities/user/user.entity';
import { Injectable } from '@nestjs/common';
import { Action } from './actions';
import { AppAbility, AppSubjects, subject } from './casl.types';

@Injectable()
export class AbilityFactory {
  createForUser(user: User): AppAbility {
    const { can, build } = new AbilityBuilder<AppAbility>(
      Ability as AbilityClass<AppAbility>,
    );

    can(Action.Create, 'Media');
    can(Action.Create, 'QuestionPaper');

    if (user?.id) {
      // QuestionPaper: owner-only access.
      can(Action.Read, 'QuestionPaper', { 'owner.id': user.id });
      can(Action.Update, 'QuestionPaper', { 'owner.id': user.id });
      can(Action.Delete, 'QuestionPaper', { 'owner.id': user.id });

      // Media: uploader-only access.
      can(Action.Read, 'Media', { 'uploadedBy.id': user.id });
      can(Action.Update, 'Media', { 'uploadedBy.id': user.id });
      can(Action.Delete, 'Media', { 'uploadedBy.id': user.id });
    }

    return build({
      detectSubjectType: (item) =>
        (item as any)?.__caslSubjectType__ ??
        (item.constructor as unknown as ExtractSubjectType<AppSubjects>),
    });
  }

  // Minimal subjects to avoid loading full relations.
  mediaSubject(input: { id: string; uploadedById?: string }) {
    return subject('Media', {
      id: input.id,
      uploadedBy: input.uploadedById ? { id: input.uploadedById } : undefined,
    } as Partial<Media>);
  }

  questionPaperSubject(input: { id: string; ownerId?: string }) {
    return subject('QuestionPaper', {
      id: input.id,
      owner: input.ownerId ? { id: input.ownerId } : undefined,
    } as Partial<QuestionPaper>);
  }
}
