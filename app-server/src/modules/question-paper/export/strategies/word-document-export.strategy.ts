import { QuestionPaper } from '@entities';
import { Injectable, Logger } from '@nestjs/common';
import { spawn } from 'child_process';
import { join } from 'path';
import { MediaService } from 'src/modules/media/media.service';
import {
  ExportResult,
  ExportResultType,
} from '../interfaces/export-result.interface';
import { QuestionPaperExportStrategy } from '../interfaces/question-paper-export-strategy.interface';

@Injectable()
export class WordDocumentExportStrategy implements QuestionPaperExportStrategy {
  private readonly logger = new Logger(WordDocumentExportStrategy.name);

  constructor(private readonly mediaService: MediaService) {}

  async export(questionPaper: QuestionPaper): Promise<ExportResult> {
    this.logger.log(
      `Generating DOCX export for question paper: ${questionPaper.name}`,
    );

    // Transform question paper to raw HTML
    const htmlContent = await this.convertToHtml(questionPaper);

    // Convert to DOCX using Pandoc with piped input/output
    const docxBuffer = await this.convertWithPandoc(htmlContent);

    this.logger.log('Successfully converted HTML to DOCX using Pandoc');

    const safeName = (questionPaper.name || 'question-paper')
      .replace(/\s+/g, '_')
      .replace(/[^a-zA-Z0-9_.-]/g, '');

    return {
      type: ExportResultType.FILE,
      file: docxBuffer,
      fileName: `${safeName}.docx`,
      mimeType:
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    };
  }

  private async convertWithPandoc(htmlContent: string): Promise<Buffer> {
    // Path to the Lua filter file
    const luaFilterPath = join(__dirname, '..', 'markdown-filter.lua');
    // Path to the custom reference document
    const referenceDocPath = join(__dirname, '..', 'custom-reference.docx');

    return new Promise((resolve, reject) => {
      const pandoc = spawn('pandoc', [
        '-f',
        'html+tex_math_dollars',
        '-t',
        'docx',
        '--highlight-style=tango',
        `--lua-filter=${luaFilterPath}`,
        `--reference-doc=${referenceDocPath}`,
      ]);

      const chunks: Buffer[] = [];
      const errorChunks: Buffer[] = [];

      pandoc.stdout.on('data', (chunk) => {
        chunks.push(chunk);
      });

      pandoc.stderr.on('data', (chunk) => {
        errorChunks.push(chunk);
      });

      pandoc.on('error', (error) => {
        reject(new Error(`Failed to spawn pandoc process: ${error.message}`));
      });

      pandoc.on('close', (code) => {
        if (code !== 0) {
          const errorMessage = Buffer.concat(errorChunks).toString('utf-8');
          reject(
            new Error(
              `Pandoc process exited with code ${code}: ${errorMessage}`,
            ),
          );
        } else {
          resolve(Buffer.concat(chunks));
        }
      });

      // Write HTML content to stdin
      pandoc.stdin.write(htmlContent);
      pandoc.stdin.end();
    });
  }

  private async convertToHtml(questionPaper: QuestionPaper): Promise<string> {
    // Calculate total marks from questions
    const totalMarks = questionPaper.questions.reduce(
      (sum, q) => sum + (q.marks || 0),
      0,
    );

    // Calculate time: total_marks * 1.5 minutes
    const timeAllowed = Math.round(totalMarks * 1.5);

    const questionPaperName = this.escapeHtml(
      questionPaper.name || 'Question Paper',
    );

    // Build questions table rows
    let questionsHtml = '';
    for (let index = 0; index < questionPaper.questions.length; index++) {
      const question = questionPaper.questions[index];
      const questionText = this.escapeHtml(question.text || '');
      const marks = question.marks || 0;
      const slNo = index + 1;

      // Build the question content with images, options and subquestions
      let questionContent = `<div class="markdown">${questionText}</div>`;

      // Add question images if they exist
      if (question.images && question.images.length > 0) {
        questionContent += '<div class="question-images">';
        for (const questionImage of question.images) {
          if (questionImage.media && questionImage.media.id) {
            try {
              const imageUrl = await this.mediaService.getDownloadUrl(
                questionImage.media.id,
              );
              questionContent += `<img src="${imageUrl}" alt="Question image" class="question-image" />`;
            } catch (error) {
              this.logger.warn(
                `Failed to get download URL for media ${questionImage.media.id}: ${error.message}`,
              );
            }
          }
        }
        questionContent += '</div>';
      }

      // Add options if they exist
      if (question.options && question.options.length > 0) {
        questionContent += '<div class="options">';
        const sortedOptions = [...question.options].sort(
          (a, b) => a.index - b.index,
        );
        sortedOptions.forEach((option, optionIndex) => {
          const optionLabel = String.fromCharCode(97 + optionIndex); // a, b, c, d...
          const optionText = this.escapeHtml(option.text || '');
          questionContent += `<div class="option"><strong>${optionLabel})</strong> <div class="markdown">${optionText}</div></div>`;
        });
        questionContent += '</div>';
      }

      // Add subquestions if they exist
      if (question.subQuestions && question.subQuestions.length > 0) {
        questionContent += '<div class="subquestions">';
        const sortedSubQuestions = [...question.subQuestions].sort(
          (a, b) => a.index - b.index,
        );
        sortedSubQuestions.forEach((subQuestion, subIndex) => {
          const subQuestionText = this.escapeHtml(subQuestion.text || '');
          const subQuestionLabel = String.fromCharCode(97 + subIndex); // a, b, c, ...
          questionContent += `<div class="subquestion"><strong>${subQuestionLabel})</strong> <div class="markdown">${subQuestionText}</div>`;

          // Add options for subquestion if they exist
          if (subQuestion.options && subQuestion.options.length > 0) {
            questionContent += '<div class="options">';
            const sortedSubOptions = [...subQuestion.options].sort(
              (a, b) => a.index - b.index,
            );
            sortedSubOptions.forEach((option, optionIndex) => {
              const optionLabel = String.fromCharCode(97 + optionIndex); // a, b, c, d...
              const optionText = this.escapeHtml(option.text || '');
              questionContent += `<div class="option"><strong>${optionLabel})</strong> <div class="markdown">${optionText}</div></div>`;
            });
            questionContent += '</div>';
          }

          questionContent += '</div>';
        });
        questionContent += '</div>';
      }

      questionsHtml += `
      <tr>
        <td style="text-align: center;">${slNo}</td>
        <td style="text-align: left;">${questionContent}</td>
        <td style="text-align: center;">${marks}</td>
      </tr>`;
    }

    return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>${questionPaperName}</title>
  <style>
    table {
      border-collapse: collapse;
    }
    th {
      padding: 8px;
      text-align: center;
      vertical-align: middle;
    }
    td {
      padding: 8px;
    }
    .options {
      margin-left: 20px;
      margin-top: 8px;
    }
    .option {
      margin-bottom: 4px;
    }
    .subquestions {
      margin-left: 20px;
      margin-top: 8px;
    }
    .subquestion {
      margin-bottom: 8px;
    }
    .question-images {
      margin-top: 10px;
      margin-bottom: 10px;
    }
    .question-image {
      max-width: 100%;
      height: auto;
      display: block;
      margin: 5px 0;
    }
    .header-table {
      width: 100%;
      border: none;
      margin-bottom: 10px;
    }
    .header-table td {
      border: none;
      padding: 5px 0;
      font-weight: bold;
    }
    .left-aligned {
      text-align: left;
    }
    .right-aligned {
      text-align: right;
    }
    .separator {
      border-bottom: 2px solid black;
      margin-bottom: 15px;
    }
  </style>
</head>
<body>  
  <table class="header-table" style="width: 100%; border: none; border-collapse: collapse;">
    <tr>
      <td style="text-align: left; border: none;">
        <h6 style="margin: 0; display: inline;">Max. Marks: ${totalMarks}</h6>
      </td>
      <td style="text-align: right; border: none;">
        <h6 style="margin: 0; display: inline;" class="heading7">Time Allowed: ${timeAllowed} minutes</h6>
      </td>
    </tr>
  </table>
  <hr class="separator" />
  
  <table>
    <colgroup>
      <col style="width: 8%;">
      <col style="width: 84%;">
      <col style="width: 10%;">
    </colgroup>
    <thead>
      <tr>
        <th>Sl. No.</th>
        <th>Question</th>
        <th>Marks</th>
      </tr>
    </thead>
    <tbody>${questionsHtml}
    </tbody>
  </table>
</body>
</html>`;
  }

  private escapeHtml(text: string): string {
    const map: Record<string, string> = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;',
    };
    return text.replace(/[&<>"']/g, (m) => map[m]);
  }
}
