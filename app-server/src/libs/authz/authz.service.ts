// src/libs/authz/authz.service.ts
import { User } from '@entities/user/user.entity';
import { ForbiddenException, Injectable } from '@nestjs/common';
import { AbilityFactory } from './ability.factory';
import { Action } from './actions';
import { AppAbility } from './casl.types';

@Injectable()
export class AuthzService {
  constructor(private readonly abilityFactory: AbilityFactory) {}

  buildAbilityFor(user: User): AppAbility {
    return this.abilityFactory.createForUser(user);
  }

  can(user: User, action: Action, subject: any): boolean {
    const ability = this.buildAbilityFor(user);
    return ability.can(action, subject);
  }

  assert(user: User, action: Action, subject: any, msg?: string): void {
    const ability = this.buildAbilityFor(user);

    if (!ability.can(action, subject)) {
      throw new ForbiddenException(
        msg ??
          `You are not allowed to ${action} ${
            (subject as any)?.constructor?.name ?? 'resource'
          }`,
      );
    }
  }
}
