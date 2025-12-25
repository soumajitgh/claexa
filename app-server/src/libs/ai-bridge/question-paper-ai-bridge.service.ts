import {
  Inject,
  Injectable,
  Logger,
  OnModuleInit,
  Optional,
} from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';
import { lastValueFrom } from 'rxjs';
import { retry, timeout } from 'rxjs/operators';
import {
  QuestionPaperGenerateRequest,
  QuestionPaperGenerateResponse,
  QuestionPaperService,
} from './grpc.types';

@Injectable()
export class QuestionPaperAiBridgeService implements OnModuleInit {
  private readonly logger = new Logger(QuestionPaperAiBridgeService.name);
  private grpcQuestionPaperService: QuestionPaperService | null = null;

  constructor(
    @Optional()
    @Inject('AI_GRPC_CLIENT')
    private readonly grpcClient?: ClientGrpc,
  ) {}

  onModuleInit() {
    try {
      if (this.grpcClient) {
        this.grpcQuestionPaperService =
          this.grpcClient.getService<QuestionPaperService>(
            'QuestionPaperService',
          );
        this.logger.log('gRPC QuestionPaperService client initialized');
      }
    } catch (err) {
      this.logger.warn(`Failed to initialize gRPC client: ${err?.message}`);
      this.grpcQuestionPaperService = null;
    }
  }

  /**
   * Generate a question paper using the AI service
   * @param request - The question paper generation request
   * @returns Promise<QuestionPaperGenerateResponse> - The generated question paper response
   */
  async generateQuestionPaper(
    request: QuestionPaperGenerateRequest,
  ): Promise<QuestionPaperGenerateResponse> {
    const startTime = Date.now();
    const requestId = `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    this.logger.log(`[${requestId}] Starting AI question paper generation`);

    if (!this.grpcQuestionPaperService) {
      throw new Error('gRPC client not initialized');
    }

    try {
      const grpcResp = await lastValueFrom(
        this.grpcQuestionPaperService
          .Generate(request)
          .pipe(timeout(300000), retry(3)),
      );

      const duration = Date.now() - startTime;
      this.logger.log(
        `[${requestId}] Question paper generated successfully via gRPC in ${duration}ms`,
      );

      return grpcResp as unknown as QuestionPaperGenerateResponse;
    } catch (error) {
      const duration = Date.now() - startTime;
      this.logger.error(
        `[${requestId}] Generation failed after ${duration}ms: ${error?.message}`,
      );
      throw new Error('AI gRPC request failed');
    }
  }
}
