import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PostHog } from 'posthog-node';

@Injectable()
export class PosthogService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PosthogService.name);
  private posthog: PostHog | null = null;

  constructor(private readonly configService: ConfigService) {}

  async onModuleInit() {
    const apiKey = this.configService.get<string>('POSTHOG_API_KEY');
    const host = this.configService.get<string>('POSTHOG_API_HOST');

    if (apiKey && host) {
      this.posthog = new PostHog(apiKey, {
        host,
      });
      this.logger.log('PostHog client initialized successfully');
    } else {
      this.logger.warn(
        'PostHog API key or host not configured. Event tracking will be disabled.',
      );
    }
  }

  /**
   * Captures an identified event in PostHog
   * @param email - The email of the user (used as distinct ID)
   * @param eventId - The event identifier (e.g., 'user_signed_up', 'question_paper_generated')
   * @param properties - Additional properties to attach to the event
   */
  async captureIdentifiedEvent(
    email: string,
    eventId: string,
    properties: Record<string, any> = {},
  ): Promise<void> {
    if (!this.posthog) {
      this.logger.debug('PostHog not configured, skipping event capture event');
      return;
    }

    try {
      this.posthog.capture({
        distinctId: email,
        event: eventId,
        properties,
      });

      this.logger.debug(`Event captured: ${eventId} for user: ${email}`);
    } catch (error) {
      this.logger.error(
        `Failed to capture event ${eventId} for user ${email}`,
        error,
      );
    }
  }

  /**
   * Flushes any pending events and gracefully shuts down the PostHog client
   */
  async onModuleDestroy() {
    if (this.posthog) {
      await this.posthog.shutdown();
      this.logger.log('PostHog client shutdown complete');
    }
  }
}
