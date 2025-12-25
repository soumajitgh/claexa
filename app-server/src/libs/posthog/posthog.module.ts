import { Global, Module } from '@nestjs/common';
import { PosthogService } from './posthog.service';
import { ConfigModule } from '@nestjs/config';

@Global()
@Module({
  imports: [ConfigModule],
  providers: [PosthogService],
  exports: [PosthogService],
})
export class PosthogModule {}
