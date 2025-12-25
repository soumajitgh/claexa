import { ChannelCredentials } from '@grpc/grpc-js';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { join } from 'path';
import { MediaModule } from '../../modules/media/media.module';
import { AiBridgeHealthService } from './ai-bridge-health.service';
import { QuestionPaperAiBridgeService } from './question-paper-ai-bridge.service';

@Module({
  imports: [
    ConfigModule,
    MediaModule,
    ClientsModule.registerAsync([
      {
        name: 'AI_GRPC_CLIENT',
        imports: [ConfigModule],
        inject: [ConfigService],
        useFactory: (configService: ConfigService) => {
          const url = configService.get<string>('AI_SERVICE_URL');
          const useTls = configService.get<boolean>('AI_SERVICE_TLS');
          const credentials = useTls
            ? ChannelCredentials.createSsl()
            : undefined;
          const protoPath = join(__dirname, 'proto', 'claexa_ai.proto');
          return {
            transport: Transport.GRPC,
            retryAttempts: 3,
            retryDelay: 1000,
            options: {
              url,
              package: 'claexa.ai',
              protoPath,
              credentials,
              loader: {
                keepCase: true,
                longs: String,
                enums: String,
                defaults: true,
                oneofs: true,
              },
            },
          };
        },
      },
    ]),
  ],
  providers: [QuestionPaperAiBridgeService, AiBridgeHealthService],
  exports: [QuestionPaperAiBridgeService, AiBridgeHealthService],
})
export class AiBridgeModule {}
