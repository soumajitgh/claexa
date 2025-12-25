import { Module } from '@nestjs/common';
import { AuthzModule } from 'src/libs/authz/authz.module';
import { PosthogModule } from 'src/libs/posthog/posthog.module';
import { AiBridgeModule } from '../../libs/ai-bridge/ai-bridge.module';
import { UsageModule } from '../../libs/usage/usage.module';
import { MediaModule } from '../media/media.module';
import { QuestionPaperExportService } from './export/question-paper-export.service';
import { PdfExportStrategy } from './export/strategies/pdf-export.strategy';
import { WordDocumentExportStrategy } from './export/strategies/word-document-export.strategy';
import { AiResponseMapper } from './mappers/ai-response.mapper';
import { GenerateWithAiMapper } from './mappers/generate-with-ai.mapper';
import { QuestionPaperController } from './question-paper.controller';
import { QuestionPaperService } from './question-paper.service';
import { QuestionPaperUpdateRouterService } from './update/question-paper-update-router.service';
import { Base64MediaConverter } from './utils/base64-media-converter';

@Module({
  imports: [
    AiBridgeModule,
    AuthzModule,
    MediaModule,
    UsageModule,
    PosthogModule,
  ],
  controllers: [QuestionPaperController],
  providers: [
    QuestionPaperService,
    QuestionPaperExportService,
    WordDocumentExportStrategy,
    PdfExportStrategy,
    QuestionPaperUpdateRouterService,
    GenerateWithAiMapper,
    AiResponseMapper,
    Base64MediaConverter,
    // Register strategies to ExportService
    {
      provide: 'EXPORT_STRATEGY_REGISTRATION',
      useFactory: (
        exportService: QuestionPaperExportService,
        docsStrategy: WordDocumentExportStrategy,
        pdfStrategy: PdfExportStrategy,
      ) => {
        exportService.registerStrategy('docx', docsStrategy);
        exportService.registerStrategy('pdf', pdfStrategy);
      },
      inject: [
        QuestionPaperExportService,
        WordDocumentExportStrategy,
        PdfExportStrategy,
      ],
    },
  ],
  exports: [QuestionPaperService],
})
export class QuestionPaperModule {}
