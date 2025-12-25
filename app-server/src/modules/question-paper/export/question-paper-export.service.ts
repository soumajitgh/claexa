import { QuestionPaper } from '@entities';
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PosthogService } from '../../../libs/posthog/posthog.service';
import { ExportResult } from './interfaces/export-result.interface';
import { QuestionPaperExportStrategy } from './interfaces/question-paper-export-strategy.interface';

@Injectable()
export class QuestionPaperExportService {
  private readonly strategies = new Map<string, QuestionPaperExportStrategy>();

  constructor(
    private readonly posthog: PosthogService,
    @InjectRepository(QuestionPaper)
    private readonly questionPaperRepository: Repository<QuestionPaper>,
  ) {} // Strategies are injected via module providers and registered in the module

  registerStrategy(identifier: string, strategy: QuestionPaperExportStrategy) {
    this.strategies.set(identifier, strategy);
  }

  async export(id: string, format: string): Promise<ExportResult> {
    // Fetch the question paper entity with all necessary relations
    const questionPaper = await this.questionPaperRepository.findOne({
      where: { id },
      relations: [
        'owner',
        'questions',
        'questions.options',
        'questions.subQuestions',
        'questions.subQuestions.options',
        'questions.images',
        'questions.images.media',
      ],
      order: { questions: { index: 'ASC' } },
    });

    if (!questionPaper) {
      throw new NotFoundException(`Question paper with ID ${id} not found`);
    }

    const strategy = this.strategies.get(format);
    if (!strategy) {
      throw new Error('Unsupported export format');
    }
    const result = await strategy.export(questionPaper);

    // Capture export event; we don't have user here, so we use owner.email if available
    const email = (questionPaper as any)?.owner?.email as string | undefined;
    if (email) {
      await this.posthog.captureIdentifiedEvent(
        email,
        'question_paper_exported',
        {
          paper_id: questionPaper.id,
          format,
          result_size_bytes: (result as any)?.size ?? undefined,
        },
      );
    }

    return result;
  }
}
