import { QuestionPaper, User } from '@entities';
import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { QuestionPaperAiBridgeService } from '../../libs/ai-bridge';
import { FeatureKey } from '../../libs/usage/feature/interfaces/feature-strategy.interface';
import { UsageService } from '../../libs/usage/usage.service';
// Authorization is enforced at controller level
import { PosthogService } from '../../libs/posthog/posthog.service';
import { MediaService } from '../media/media.service';
import {
  CreatePaperDto,
  QuestionPaperCreateResponseDto,
} from './dto/create-paper.dto';
import {
  GenerateWithAiDto,
  GenerateWithAiResponseDto,
} from './dto/generate-with-ai.dto';
import { QuestionPaperResponseDto } from './dto/question-paper-response.dto';
import { QuestionPaperSummaryResponse } from './dto/question-paper-summary-response.dto';
import {
  QuestionPaperUpdateResponseDto,
  UpdatePaperDto,
} from './dto/update-paper.dto';
import { QuestionPaperMapper } from './mappers';
import { AiResponseMapper } from './mappers/ai-response.mapper';
import { GenerateWithAiMapper } from './mappers/generate-with-ai.mapper';
import { QuestionPaperUpdateRouterService } from './update/question-paper-update-router.service';

@Injectable()
export class QuestionPaperService {
  private readonly logger = new Logger(QuestionPaperService.name);
  constructor(
    @InjectRepository(QuestionPaper)
    private readonly questionPaperRepository: Repository<QuestionPaper>,
    private readonly updateRouterService: QuestionPaperUpdateRouterService,
    private readonly aiBridgeService: QuestionPaperAiBridgeService,
    private readonly generateWithAiMapper: GenerateWithAiMapper,
    private readonly aiResponseMapper: AiResponseMapper,
    private readonly mediaService: MediaService,
    private readonly posthog: PosthogService,
    private readonly usageService: UsageService,
  ) {}

  /**
   * Creates a new blank question paper
   */
  async createQuestionPaper(
    createDto: CreatePaperDto,
    owner: User, // User type from account module
  ): Promise<QuestionPaperCreateResponseDto> {
    // Check if user has sufficient credits before charging
    await this.usageService.validateSufficientCredits(
      owner,
      FeatureKey.GENERATE_QUESTION_PAPER,
    );

    const questionPaper = this.questionPaperRepository.create({
      name: createDto.name,
      description: createDto.description,
      owner: owner,
    });

    const savedPaper = await this.questionPaperRepository.save(questionPaper);

    // Record usage and charge credits
    await this.usageService.recordUsage(
      FeatureKey.GENERATE_QUESTION_PAPER,
      owner.id,
    );

    // Capture event
    await this.posthog.captureIdentifiedEvent(
      owner.email,
      'question_paper_created',
      {
        paper_id: savedPaper.id,
        name: createDto.name,
        totalQuestion: savedPaper.questions?.length || 0,
      },
    );

    return { id: savedPaper.id };
  }

  /**
   * Updates a question paper using the update router system
   */
  async updateQuestionPaper(
    id: string,
    user: User,
    updateDto: UpdatePaperDto,
  ): Promise<QuestionPaperUpdateResponseDto> {
    // Check if question paper exists
    const questionPaper = await this.questionPaperRepository.findOne({
      where: { id },
      relations: { owner: true },
    });

    if (!questionPaper) {
      throw new NotFoundException(`Question paper with ID ${id} not found`);
    }

    // Get commands from router
    const commands = this.updateRouterService.map({
      identifier: updateDto.identifier,
      data: updateDto.data,
      questionPaperId: id,
      userId: user.id,
    });

    // Validate and execute each command
    for (const command of commands) {
      const accessValidation = await command.verifyAccess();
      if (!accessValidation.isValid) {
        throw new Error(`Access denied: ${accessValidation.message}`);
      }

      const validation = command.validate();
      if (!validation.isValid) {
        throw new Error(`Validation failed: ${validation.errors.join(', ')}`);
      }
      await command.execute();
    }

    // Capture event
    await this.posthog.captureIdentifiedEvent(
      user.email,
      'question_paper_updated',
      {
        paper_id: id,
        command_count: commands.length,
        identifier: updateDto.identifier,
      },
    );
    return { message: 'Question paper updated successfully' };
  }

  /**
   * Retrieves all question papers for a user
   */
  async getAllQuestionPapers(
    user: User,
  ): Promise<QuestionPaperSummaryResponse[]> {
    const questionPapers = await this.questionPaperRepository.find({
      where: { owner: { id: user.id } },
      relations: ['questions'],
      order: { updatedAt: 'DESC' },
    });

    return questionPapers.map((paper) =>
      QuestionPaperMapper.toSummaryResponseDto(paper),
    );
  }

  /**
   * Retrieves a question paper by ID with all related data
   */
  async getQuestionPaper(id: string): Promise<QuestionPaperResponseDto> {
    const questionPaper = await this.questionPaperRepository.findOne({
      where: { id },
      relations: [
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

    return QuestionPaperMapper.toResponseDto(questionPaper);
  }

  /**
   * Deletes a question paper
   */
  async deleteQuestionPaper(id: string): Promise<void> {
    // Load paper with nested relations to access images and media
    const paper = await this.questionPaperRepository.findOne({
      where: { id },
      relations: [
        'questions',
        'questions.images',
        'questions.images.media',
        'questions.options',
        'questions.subQuestions',
        'questions.subQuestions.options',
      ],
    });

    if (!paper) {
      throw new NotFoundException(`Question paper with ID ${id} not found`);
    }

    // Hard delete all media for question images
    for (const question of paper.questions ?? []) {
      for (const image of question.images ?? []) {
        const media = image.media;
        if (media) {
          await this.mediaService.delete(media.id, { permanent: true });
        }
      }
    }

    // Finally delete the question paper
    await this.questionPaperRepository.remove(paper);
  }

  /**
   * Generate a question paper using AI
   */
  async generateWithAi(
    generateDto: GenerateWithAiDto,
    user: User,
  ): Promise<GenerateWithAiResponseDto> {
    try {
      // Check if user has sufficient credits before generating
      // Note: We validate without imageCount context here since we don't know it yet
      // This ensures user has base credits before proceeding
      await this.usageService.validateSufficientCredits(
        user,
        FeatureKey.GENERATE_QUESTION_PAPER_WITH_AI,
      );

      // Map the generate DTO to AI bridge request DTO
      const aiBridgeRequest =
        await this.generateWithAiMapper.toAiBridgeRequest(generateDto);

      // Call the AI service to generate the question paper
      const aiResponse =
        await this.aiBridgeService.generateQuestionPaper(aiBridgeRequest);

      // Map AI response to entities and save to database
      const savedQuestionPaper = await this.aiResponseMapper.mapAndSave(
        aiResponse,
        user,
      );

      // Calculate image count for usage tracking
      const imageCount = savedQuestionPaper.questions
        .map((question) => question.images?.length || 0)
        .reduce((a, b) => a + b, 0);

      // Validate again with actual imageCount context
      await this.usageService.validateSufficientCredits(
        user,
        FeatureKey.GENERATE_QUESTION_PAPER_WITH_AI,
        { imageCount },
      );

      // Record usage and charge credits
      await this.usageService.recordUsage(
        FeatureKey.GENERATE_QUESTION_PAPER_WITH_AI,
        user.id,
      );

      // Capture success event
      await this.posthog.captureIdentifiedEvent(
        user.email,
        'question_paper_generated_with_ai',
        {
          paper_id: savedQuestionPaper.id,
          image_count: imageCount,
          question_count: savedQuestionPaper.questions.length,
        },
      );
      return {
        id: savedQuestionPaper.id,
      };
    } catch (error) {
      this.logger.error(
        `Failed to generate question paper with AI: ${error.message}`,
        error.stack,
      );

      // Capture failure event
      await this.posthog.captureIdentifiedEvent(
        user.email,
        'question_paper_generate_with_ai_failed',
        {
          error_message: error.message,
        },
      );
      // Re-throw the error with additional context
      throw new Error(
        `Failed to generate question paper with AI: ${error.message}`,
      );
    }
  }

  /**
   * Record usage for image generation
   */
  async recordImageGenerationUsage(user: User): Promise<void> {
    // Check if user has sufficient credits before charging
    await this.usageService.validateSufficientCredits(
      user,
      FeatureKey.GENERATE_IMAGE,
    );

    // Record usage and charge credits
    await this.usageService.recordUsage(FeatureKey.GENERATE_IMAGE, user.id);
  }
}
