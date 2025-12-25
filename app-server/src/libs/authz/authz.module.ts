import { Global, Module } from '@nestjs/common';
import { AbilityFactory } from './ability.factory';
import { AuthzService } from './authz.service';

@Global()
@Module({
  providers: [AbilityFactory, AuthzService],
  exports: [AbilityFactory, AuthzService],
})
export class AuthzModule {}
