import {
  Media,
  MediaOriginType,
  Option,
  Question,
  QuestionImage,
  QuestionPaper,
  SubQuestion,
  User,
} from '@entities';
import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { QuestionPaperGenerateResponse } from '../../../libs/ai-bridge';
import { MediaService } from '../../media/media.service';
import { Base64MediaConverter } from '../utils/base64-media-converter';

interface QuestionData {
  text: string;
  marks: number;
  index: number;
  options?: OptionData[];
  subQuestions?: SubQuestionData[];
}

interface OptionData {
  text: string;
  index: number;
}

interface SubQuestionData {
  text: string;
  marks: number;
  index: number;
  options?: OptionData[];
}

export interface MappedQuestionPaper {
  questionPaper: Partial<QuestionPaper>;
  questions: QuestionData[];
  media: Media[];
}

@Injectable()
export class AiResponseMapper {
  private readonly logger = new Logger(AiResponseMapper.name);

  constructor(
    @InjectRepository(QuestionPaper)
    private readonly questionPaperRepository: Repository<QuestionPaper>,
    @InjectRepository(Question)
    private readonly questionRepository: Repository<Question>,
    @InjectRepository(Option)
    private readonly optionRepository: Repository<Option>,
    @InjectRepository(SubQuestion)
    private readonly subQuestionRepository: Repository<SubQuestion>,
    @InjectRepository(QuestionImage)
    private readonly questionImageRepository: Repository<QuestionImage>,
    private readonly mediaService: MediaService,
    private readonly base64MediaConverter: Base64MediaConverter,
  ) {}

  /**
   * Debug method to test base64 parsing
   * @param base64String - The base64 string to test
   * @returns void
   */
  debugBase64Parsing(base64String: string): void {
    this.logger.debug('Testing base64 parsing...');
    this.logger.debug(`Input: ${base64String.substring(0, 50)}...`);

    const extractedData = this.extractBase64Data(base64String);
    if (extractedData) {
      this.logger.debug(`Mime type: ${extractedData.mimeType}`);
      this.logger.debug(`Buffer size: ${extractedData.buffer.length} bytes`);
    } else {
      this.logger.debug('Failed to extract base64 data');
    }
  }

  /**
   * Extracts and validates base64 image data
   * @param base64String - The base64 image string
   * @returns { mimeType: string; buffer: Buffer } | null - Parsed data or null if invalid
   */
  private extractBase64Data(
    base64String: string,
  ): { mimeType: string; buffer: Buffer } | null {
    try {
      const matches = base64String.match(/^data:([^;]+);base64,(.+)$/);
      if (!matches) {
        return null;
      }
      const [, mimeType, base64Data] = matches;

      // Validate mime type
      if (!mimeType.startsWith('image/')) {
        return null;
      }

      // Decode base64
      const buffer = Buffer.from(base64Data, 'base64');

      return { mimeType, buffer };
    } catch {
      return null;
    }
  }

  /**
   * Converts base64 image data to Media entities and uploads them to storage
   * @param base64Images - Array of base64 image data
   * @param user - The user who owns the media
   * @returns Promise<Media[]> - Array of uploaded media entities
   */
  async convertBase64ImagesToMedia(
    base64Images: { base64_image: string }[],
    user: User,
  ): Promise<Media[]> {
    if (!base64Images || base64Images.length === 0) {
      return [];
    }

    this.logger.debug(
      `Converting ${base64Images.length} base64 images to media`,
    );

    const mediaEntities: Media[] = [];

    for (const imageData of base64Images) {
      try {
        // Validate the base64 image
        if (!this.base64MediaConverter.validateBase64Image(imageData)) {
          this.logger.warn('Invalid base64 image data, skipping');
          continue;
        }

        // Convert base64 to Media entity
        const mediaEntity = this.base64MediaConverter.convertBase64ToMedia(
          imageData,
          user,
        );

        // Extract buffer from base64
        const extractedData = this.extractBase64Data(imageData.base64_image);
        if (!extractedData) {
          this.logger.warn('Invalid base64 format, skipping');
          continue;
        }

        const { mimeType, buffer } = extractedData;

        // Additional validation for buffer size
        if (buffer.length === 0) {
          this.logger.warn('Empty buffer from base64 data, skipping');
          continue;
        }

        // Upload the buffer using MediaService
        this.logger.debug(
          `Uploading file: ${mediaEntity.originalName}, size: ${buffer.length}, mime: ${mimeType}`,
        );

        const uploadedMedia = (await this.mediaService.uploadFile({
          buffer,
          originalName: mediaEntity.originalName,
          mimetype: mimeType,
          user,
          originType: MediaOriginType.GENERATED,
          options: { createRecord: true },
        })) as Media;

        mediaEntities.push(uploadedMedia);
        this.logger.debug(`Successfully uploaded media: ${uploadedMedia.id}`);
      } catch (error) {
        this.logger.error(
          `Failed to convert base64 image to media: ${error.message}`,
          error.stack,
        );
        // Continue with other images even if one fails
      }
    }

    this.logger.debug(
      `Successfully converted ${mediaEntities.length} images to media`,
    );
    return mediaEntities;
  }

  /**
   * Maps AI response to core question paper entities
   * @param aiResponse - The AI response DTO
   * @param user - The user who owns the question paper
   * @returns Promise<QuestionPaper> - The mapped entities
   */
  async mapAiResponseToUnsavedEntities(
    aiResponse: QuestionPaperGenerateResponse,
    user: User,
  ): Promise<QuestionPaper> {
    this.logger.debug('Starting to map AI response to entities');
    const { question_paper } = aiResponse;

    const mappedQuestions = await Promise.all(
      question_paper.questions.map(async (question, index) => {
        // Convert base64 images to Media entities
        const mediaEntities = await this.convertBase64ImagesToMedia(
          question.images || [],
          user,
        );

        return {
          text: question.text,
          marks: question.marks,
          index: index,
          options:
            question.options?.map((option, optionIndex) => ({
              text: option.text,
              index: optionIndex,
            })) || [],
          subQuestions:
            question.sub_questions?.map((subQuestion, subIndex) => {
              return {
                text: subQuestion.text,
                marks: subQuestion.marks,
                index: subIndex,
                options:
                  subQuestion.options?.map((option, optionIndex) => ({
                    text: option.text,
                    index: optionIndex,
                  })) || [],
              };
            }) || [],
          images: mediaEntities.map((media) => ({
            media: media,
          })),
        };
      }),
    );

    const questionPaper = this.questionPaperRepository.create({
      name: question_paper.name,
      owner: user,
      questions: mappedQuestions,
    });

    this.logger.debug(`Processing question paper: ${question_paper.name}`);
    this.logger.debug(`Found ${question_paper.questions.length} questions`);

    return questionPaper;
  }

  /**
   * Complete mapping and saving process
   * @param aiResponse - The AI response DTO
   * @param user - The user who owns the question paper
   * @returns Promise<QuestionPaper> - The saved question paper
   */
  async mapAndSave(
    aiResponse: QuestionPaperGenerateResponse,
    user: User,
  ): Promise<QuestionPaper> {
    const mappedEntities = await this.mapAiResponseToUnsavedEntities(
      aiResponse,
      user,
    );
    return await this.questionPaperRepository.save(mappedEntities);
  }
}
