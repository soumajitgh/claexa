import { Option, Question, QuestionPaper, SubQuestion } from '@entities';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OptionCreateCommand } from './commands/option-create.command';
import { OptionDeleteCommand } from './commands/option-delete.command';
import { OptionUpdateCommand } from './commands/option-update.command';
import { QuestionCreateCommand } from './commands/question-create.command';
import { QuestionDeleteCommand } from './commands/question-delete.command';
import { QuestionPaperMetaCommand } from './commands/question-paper-meta-update.command';
import { QuestionPaperUpdateCommand } from './commands/question-paper-update.command';
import { QuestionUpdateCommand } from './commands/question-update.command';
import { SubQuestionCreateCommand } from './commands/sub-question-create.command';
import { SubQuestionDeleteCommand } from './commands/sub-question-delete.command';
import { SubQuestionOptionCreateCommand } from './commands/sub-question-option-create.command';
import { SubQuestionOptionDeleteCommand } from './commands/sub-question-option-delete.command';
import { SubQuestionOptionUpdateCommand } from './commands/sub-question-option-update.command';
import { SubQuestionUpdateCommand } from './commands/sub-question-update.command';
import { IQuestionPaperUpdateCommand } from './interfaces/question-paper-update-command.interface';
import { QuestionPaperUpdateIdentifierEnum } from './question-paper-update.dto';

@Injectable()
export class QuestionPaperUpdateRouterService {
  constructor(
    @InjectRepository(QuestionPaper)
    private readonly questionPaperRepository: Repository<QuestionPaper>,
    @InjectRepository(Question)
    private readonly questionRepository: Repository<Question>,
    @InjectRepository(Option)
    private readonly optionRepository: Repository<Option>,
    @InjectRepository(SubQuestion)
    private readonly subQuestionRepository: Repository<SubQuestion>,
  ) {}

  map({
    questionPaperId,
    userId,
    identifier,
    data,
  }: {
    questionPaperId: string;
    userId: string;
    identifier: QuestionPaperUpdateIdentifierEnum;
    data: object;
  }): IQuestionPaperUpdateCommand[] {
    const commands: IQuestionPaperUpdateCommand[] = [];
    const params = { questionPaperId, userId };
    const repositories = {
      questionPaperRepository: this.questionPaperRepository,
      questionRepository: this.questionRepository,
      optionRepository: this.optionRepository,
      subQuestionRepository: this.subQuestionRepository,
    };

    switch (identifier) {
      case QuestionPaperUpdateIdentifierEnum.QUESTION_PAPER_META:
        commands.push(
          new QuestionPaperMetaCommand(data, params, {
            questionPaperRepository: repositories.questionPaperRepository,
          }),
        );
        break;

      case QuestionPaperUpdateIdentifierEnum.QUESTION_PAPER_UPDATE:
        commands.push(
          new QuestionPaperUpdateCommand(data, params, {
            questionPaperRepository: repositories.questionPaperRepository,
          }),
        );
        break;

      // Question operations
      case QuestionPaperUpdateIdentifierEnum.QUESTION_CREATE:
        commands.push(
          new QuestionCreateCommand(data, params, {
            questionRepository: repositories.questionRepository,
            questionPaperRepository: repositories.questionPaperRepository,
          }),
        );
        break;

      case QuestionPaperUpdateIdentifierEnum.QUESTION_UPDATE:
        commands.push(
          new QuestionUpdateCommand(data, params, {
            questionRepository: repositories.questionRepository,
            questionPaperRepository: repositories.questionPaperRepository,
          }),
        );
        break;

      case QuestionPaperUpdateIdentifierEnum.QUESTION_DELETE:
        commands.push(
          new QuestionDeleteCommand(data, params, {
            questionRepository: repositories.questionRepository,
            questionPaperRepository: repositories.questionPaperRepository,
          }),
        );
        break;

      // Option operations
      case QuestionPaperUpdateIdentifierEnum.OPTION_CREATE:
        commands.push(
          new OptionCreateCommand(data, params, {
            optionRepository: repositories.optionRepository,
            questionRepository: repositories.questionRepository,
            questionPaperRepository: repositories.questionPaperRepository,
          }),
        );
        break;

      case QuestionPaperUpdateIdentifierEnum.OPTION_UPDATE:
        commands.push(
          new OptionUpdateCommand(data, params, {
            optionRepository: repositories.optionRepository,
            questionRepository: repositories.questionRepository,
            questionPaperRepository: repositories.questionPaperRepository,
          }),
        );
        break;

      case QuestionPaperUpdateIdentifierEnum.OPTION_DELETE:
        commands.push(
          new OptionDeleteCommand(data, params, {
            optionRepository: repositories.optionRepository,
            questionRepository: repositories.questionRepository,
            questionPaperRepository: repositories.questionPaperRepository,
          }),
        );
        break;

      // Sub-question operations
      case QuestionPaperUpdateIdentifierEnum.SUB_QUESTION_CREATE:
        commands.push(
          new SubQuestionCreateCommand(data, params, {
            subQuestionRepository: repositories.subQuestionRepository,
            questionRepository: repositories.questionRepository,
            questionPaperRepository: repositories.questionPaperRepository,
          }),
        );
        break;

      case QuestionPaperUpdateIdentifierEnum.SUB_QUESTION_UPDATE:
        commands.push(
          new SubQuestionUpdateCommand(data, params, {
            subQuestionRepository: repositories.subQuestionRepository,
            questionRepository: repositories.questionRepository,
            questionPaperRepository: repositories.questionPaperRepository,
          }),
        );
        break;

      case QuestionPaperUpdateIdentifierEnum.SUB_QUESTION_DELETE:
        commands.push(
          new SubQuestionDeleteCommand(data, params, {
            subQuestionRepository: repositories.subQuestionRepository,
            questionRepository: repositories.questionRepository,
            questionPaperRepository: repositories.questionPaperRepository,
          }),
        );
        break;

      // Sub-question option operations
      case QuestionPaperUpdateIdentifierEnum.SUB_QUESTION_OPTION_CREATE:
        commands.push(
          new SubQuestionOptionCreateCommand(data, params, {
            optionRepository: repositories.optionRepository,
            subQuestionRepository: repositories.subQuestionRepository,
            questionRepository: repositories.questionRepository,
            questionPaperRepository: repositories.questionPaperRepository,
          }),
        );
        break;

      case QuestionPaperUpdateIdentifierEnum.SUB_QUESTION_OPTION_UPDATE:
        commands.push(
          new SubQuestionOptionUpdateCommand(data, params, {
            optionRepository: repositories.optionRepository,
            subQuestionRepository: repositories.subQuestionRepository,
            questionRepository: repositories.questionRepository,
            questionPaperRepository: repositories.questionPaperRepository,
          }),
        );
        break;

      case QuestionPaperUpdateIdentifierEnum.SUB_QUESTION_OPTION_DELETE:
        commands.push(
          new SubQuestionOptionDeleteCommand(data, params, {
            optionRepository: repositories.optionRepository,
            subQuestionRepository: repositories.subQuestionRepository,
            questionRepository: repositories.questionRepository,
            questionPaperRepository: repositories.questionPaperRepository,
          }),
        );
        break;

      default:
        throw new Error(`Invalid identifier: ${identifier}`);
    }

    return commands;
  }
}
