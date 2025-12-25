import {
  Inject,
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
  Optional,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ClientGrpc } from '@nestjs/microservices';
import { lastValueFrom } from 'rxjs';
import { map, retry, timeout } from 'rxjs/operators';
import { HealthService } from './grpc.types';

@Injectable()
export class AiBridgeHealthService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(AiBridgeHealthService.name);
  private grpcHealthService: HealthService | null = null;
  private lastKnownAvailable = false;

  constructor(
    private readonly configService: ConfigService,
    @Optional()
    @Inject('AI_GRPC_CLIENT')
    private readonly grpcClient?: ClientGrpc,
  ) {}

  onModuleInit() {
    try {
      if (this.grpcClient) {
        this.grpcHealthService =
          this.grpcClient.getService<HealthService>('HealthService');
        this.logger.log('gRPC HealthService client initialized');
      }
    } catch (err) {
      this.logger.warn(
        `Failed to initialize HealthService client: ${err?.message}`,
      );
      this.grpcHealthService = null;
    }
  }

  onModuleDestroy() {
    this.grpcHealthService = null;
  }

  async isAvailable(timeoutMs: number = 1000): Promise<boolean> {
    if (!this.grpcHealthService) {
      return false;
    }

    try {
      const isServing = await lastValueFrom(
        this.grpcHealthService.Check({}).pipe(
          timeout(timeoutMs),
          retry(2),
          map((resp) => resp.status === 'SERVING'),
        ),
      );
      this.lastKnownAvailable = isServing;
      return isServing;
    } catch (err) {
      this.logger.debug(`gRPC health check failed: ${err?.message}`);
      return false;
    }
  }
}
