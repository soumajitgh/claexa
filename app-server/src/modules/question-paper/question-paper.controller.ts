import { QuestionPaper, User } from '@entities';
import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  NotFoundException,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Res,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiBody,
  ApiCreatedResponse,
  ApiInternalServerErrorResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiProduces,
  ApiTags,
} from '@nestjs/swagger';
import { InjectRepository } from '@nestjs/typeorm';
import { Response } from 'express';
import { CurrentUser } from 'src/libs/auth/decorators/current-user.decorator';
import { FirebaseTokenGuard } from 'src/libs/auth/guards/firebase-token.guard';
import { Repository } from 'typeorm';
import { AbilityFactory } from '../../libs/authz/ability.factory';
import { Action } from '../../libs/authz/actions';
import { AuthzService } from '../../libs/authz/authz.service';
import { CreatePaperDto, QuestionPaperCreateResponseDto } from './dto';
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
import { ExportResultType } from './export/interfaces/export-result.interface';
import { QuestionPaperExportService } from './export/question-paper-export.service';
import { QuestionPaperService } from './question-paper.service';

@ApiTags('question-papers')
@ApiBearerAuth()
@UseGuards(FirebaseTokenGuard)
@Controller('question-papers')
export class QuestionPaperController {
  constructor(
    private readonly questionPaperService: QuestionPaperService,
    private readonly exportService: QuestionPaperExportService,
    private readonly authz: AuthzService,
    private readonly abilityFactory: AbilityFactory,
    @InjectRepository(QuestionPaper)
    private readonly qpRepo: Repository<QuestionPaper>,
  ) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get all question papers for the current user',
    description:
      'Retrieves a list of all question papers owned by the authenticated user',
  })
  @ApiOkResponse({
    description: 'Question papers retrieved successfully',
    type: [QuestionPaperSummaryResponse],
  })
  @ApiInternalServerErrorResponse({
    description: 'Internal server error',
  })
  findAll(
    @CurrentUser() currentUser: User,
  ): Promise<QuestionPaperSummaryResponse[]> {
    return this.questionPaperService.getAllQuestionPapers(currentUser);
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get a question paper by ID',
    description:
      'Retrieves a question paper with all its questions, options, and sub-questions',
  })
  @ApiParam({
    name: 'id',
    description: 'UUID of the question paper to retrieve',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiOkResponse({
    description: 'Question paper retrieved successfully',
    type: QuestionPaperResponseDto,
  })
  @ApiNotFoundResponse({
    description: 'Question paper not found',
  })
  @ApiInternalServerErrorResponse({
    description: 'Internal server error',
  })
  async findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() currentUser: User,
  ): Promise<QuestionPaperResponseDto> {
    const qp = await this.qpRepo.findOne({
      where: { id },
      relations: { owner: true },
      select: { id: true, owner: { id: true } } as any,
    });
    if (!qp) {
      throw new NotFoundException('Question paper not found');
    }
    const subj = this.abilityFactory.questionPaperSubject({
      id: qp.id,
      ownerId: qp.owner?.id,
    });

    this.authz.assert(currentUser, Action.Read, subj);
    return this.questionPaperService.getQuestionPaper(id);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Create a new blank question paper',
    description:
      'Creates a new blank question paper with only name and description',
  })
  @ApiCreatedResponse({
    description: 'Question paper created successfully',
    type: QuestionPaperCreateResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Invalid input data or validation errors',
  })
  @ApiInternalServerErrorResponse({
    description: 'Internal server error',
  })
  create(
    @Body() createPaperDto: CreatePaperDto,
    @CurrentUser() currentUser: User,
  ): Promise<QuestionPaperCreateResponseDto> {
    this.authz.assert(currentUser, Action.Create, 'QuestionPaper');
    return this.questionPaperService.createQuestionPaper(
      createPaperDto,
      currentUser,
    );
  }

  @Post('generate-with-ai')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Generate a question paper using AI',
    description:
      'Generates a complete question paper with questions, options, and sub-questions using AI based on the provided parameters',
  })
  @ApiBody({
    description: 'Parameters to generate the question paper with AI',
    type: GenerateWithAiDto,
    examples: {
      default: {
        summary: 'Typical request',
        value: {
          course: 'Advanced Mathematics - Calculus and Integration',
          audience: 'university',
          difficulty: 7,
          topics: ['Calculus', 'Integration', 'Differential Equations'],
          mediaIds: ['123e4567-e89b-12d3-a456-426614174000'],
          itemSchema: [
            {
              type: 'multiple_choice',
              count: 10,
              marksEach: 2,
              difficulty: 'medium',
              imageRequired: false,
              bloomLevel: 2,
              filteredTopics: ['Integration'],
              subQuestions: [
                {
                  type: 'short_answer',
                  count: 3,
                  marksEach: 5,
                  bloomLevel: 4,
                },
              ],
            },
          ],
        },
      },
    },
  })
  @ApiCreatedResponse({
    description: 'Question paper generated successfully with AI',
    type: GenerateWithAiResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Invalid input data or validation errors',
  })
  @ApiInternalServerErrorResponse({
    description: 'Internal server error or AI generation failed',
  })
  generateWithAi(
    @Body() generateWithAiDto: GenerateWithAiDto,
    @CurrentUser() currentUser: User,
  ): Promise<GenerateWithAiResponseDto> {
    this.authz.assert(currentUser, Action.Create, 'QuestionPaper');
    return this.questionPaperService.generateWithAi(
      generateWithAiDto,
      currentUser,
    );
  }

  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Update a question paper',
    description: 'Updates a question paper using the update router system',
  })
  @ApiParam({
    name: 'id',
    description: 'UUID of the question paper to update',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiOkResponse({
    description: 'Question paper updated successfully',
    type: QuestionPaperUpdateResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Invalid input data or validation errors',
  })
  @ApiNotFoundResponse({
    description: 'Question paper not found',
  })
  @ApiInternalServerErrorResponse({
    description: 'Internal server error',
  })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updatePaperDto: UpdatePaperDto,
    @CurrentUser() currentUser: User,
  ): Promise<QuestionPaperUpdateResponseDto> {
    const qp = await this.qpRepo.findOne({
      where: { id },
      relations: { owner: true },
      select: { id: true, owner: { id: true } } as any,
    });
    if (!qp) {
      throw new NotFoundException('Question paper not found');
    }
    const subj = this.abilityFactory.questionPaperSubject({
      id: qp.id,
      ownerId: qp.owner?.id,
    });
    this.authz.assert(currentUser, Action.Update, subj);
    return this.questionPaperService.updateQuestionPaper(
      id,
      currentUser,
      updatePaperDto,
    );
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Delete a question paper',
    description:
      'Permanently deletes a question paper and all its associated questions',
  })
  @ApiParam({
    name: 'id',
    description: 'UUID of the question paper to delete',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiOkResponse({
    description: 'Question paper deleted successfully',
  })
  @ApiNotFoundResponse({
    description: 'Question paper not found',
  })
  @ApiInternalServerErrorResponse({
    description: 'Internal server error',
  })
  async remove(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() currentUser: User,
  ): Promise<void> {
    const qp = await this.qpRepo.findOne({
      where: { id },
      relations: { owner: true },
      select: { id: true, owner: { id: true } } as any,
    });
    if (!qp) {
      throw new NotFoundException('Question paper not found');
    }
    const subj = this.abilityFactory.questionPaperSubject({
      id: qp.id,
      ownerId: qp.owner?.id,
    });
    this.authz.assert(currentUser, Action.Delete, subj);
    return this.questionPaperService.deleteQuestionPaper(id);
  }

  @Get(':id/export/:format')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Export a question paper',
    description: 'Exports a question paper to the specified format (docx, pdf)',
  })
  @ApiParam({
    name: 'id',
    description: 'UUID of the question paper to export',
  })
  @ApiParam({
    name: 'format',
    description: 'Export format (docx, pdf)',
    required: true,
    enum: ['docx', 'pdf'],
  })
  @ApiProduces(
    'application/json',
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  )
  @ApiOkResponse({
    description:
      'Returns a file stream (PDF or DOCX) or a JSON object with a signed URL',
    schema: {
      oneOf: [
        { type: 'string', format: 'binary' },
        {
          type: 'object',
          properties: {
            url: { type: 'string', format: 'uri' },
          },
          required: ['url'],
        },
      ],
    },
  })
  async export(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('format') format: string,
    @Res() res: Response,
    @CurrentUser() currentUser: User,
  ): Promise<void> {
    const qp = await this.qpRepo.findOne({
      where: { id },
      relations: { owner: true },
      select: { id: true, owner: { id: true } } as any,
    });
    if (!qp) {
      throw new NotFoundException('Question paper not found');
    }
    const subj = this.abilityFactory.questionPaperSubject({
      id: qp.id,
      ownerId: qp.owner?.id,
    });
    this.authz.assert(currentUser, Action.Read, subj);

    const result = await this.exportService.export(id, format);

    switch (result.type) {
      case ExportResultType.FILE:
        if (!result.file || !result.mimeType) {
          throw new Error('Invalid file export result');
        }
        res.setHeader('Content-Type', result.mimeType);
        res.setHeader('Content-Length', result.file.length.toString());
        if (result.fileName) {
          res.setHeader(
            'Content-Disposition',
            `attachment; filename="${result.fileName}"`,
          );
        }
        res.end(result.file);
        return;
      case ExportResultType.URL:
        res.status(200).json({ url: result.url });
        return;
      default:
        throw new Error('Unhandled export result type');
    }
  }
}
