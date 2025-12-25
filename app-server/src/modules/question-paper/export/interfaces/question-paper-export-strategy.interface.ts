import { QuestionPaper } from '@entities';
import { ExportResult } from './export-result.interface';

export interface QuestionPaperExportStrategy {
  export(questionPaper: QuestionPaper): Promise<ExportResult>;
}
