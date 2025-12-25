import { QuestionPaper } from '@entities';
import { Injectable, Logger } from '@nestjs/common';
import { spawn } from 'child_process';
import { mkdtemp, unlink, writeFile } from 'fs/promises';
import { tmpdir } from 'os';
import { join } from 'path';
import { MediaService } from 'src/modules/media/media.service';
import {
  ExportResult,
  ExportResultType,
} from '../interfaces/export-result.interface';
import { QuestionPaperExportStrategy } from '../interfaces/question-paper-export-strategy.interface';
import markedUtil from '../marked-katex.util';

/**
 * PDF Export Strategy with HTML and Custom CSS
 *
 * This strategy exports question papers to PDF format using wkhtmltopdf directly.
 * Provides professional PDFs with custom CSS styling and KaTeX for math expressions.
 *
 * **Supported HTML:**
 * - All standard HTML5 elements
 * - Tables for question layout
 * - Custom CSS classes from question-paper.css
 *
 * **Supported LaTeX Math:**
 * - Inline Math: `$...$` or `\(...\)`
 * - Display Math: `$$...$$` or `\[...\]`
 * - Full LaTeX math commands via KaTeX
 *
 * **Examples:**
 * - HTML: "<strong>Find the derivative</strong> of the function"
 * - Inline Math: "Solve for $x$ in $x^2 + 5x + 6 = 0$"
 * - Display Math: "$$\\int_0^1 x^2 dx = \\frac{1}{3}$$"
 *
 * **Technical Details:**
 * - Engine: wkhtmltopdf (direct)
 * - Input: HTML with LaTeX math
 * - Output: High-quality PDF with custom CSS
 * - Page: A4 with 0.5-inch margins (via CSS)
 * - Math: KaTeX rendering
 * - CSS: Custom question-paper.css stylesheet
 *
 * **Benefits:**
 * - Direct HTML to PDF conversion
 * - Full control over layout with HTML/CSS
 * - Professional tabular question format
 * - KaTeX for fast and beautiful math rendering
 * - Consistent styling via external CSS
 */
@Injectable()
export class PdfExportStrategy implements QuestionPaperExportStrategy {
  private readonly logger = new Logger(PdfExportStrategy.name);
  private readonly cssPath = join(__dirname, '..', 'question-paper.css');

  constructor(private readonly mediaService: MediaService) {}

  async export(questionPaper: QuestionPaper): Promise<ExportResult> {
    this.logger.log(
      `Generating PDF export for question paper: ${questionPaper.name}`,
    );

    // Transform question paper to HTML format
    const htmlContent = await this.convertToHtml(questionPaper);

    // Read custom CSS file
    const cssContent = await this.readCssFile();

    // Convert to PDF using wkhtmltopdf directly
    const pdfBuffer = await this.convertWithWkhtmltopdf(
      htmlContent,
      cssContent,
    );

    this.logger.log('Successfully converted HTML to PDF using wkhtmltopdf');

    const safeName = (questionPaper.name || 'question-paper')
      .replace(/\s+/g, '_')
      .replace(/[^a-zA-Z0-9_.-]/g, '');

    return {
      type: ExportResultType.FILE,
      file: pdfBuffer,
      fileName: `${safeName}.pdf`,
      mimeType: 'application/pdf',
    };
  }

  private async readCssFile(): Promise<string> {
    try {
      const fs = await import('fs/promises');
      return await fs.readFile(this.cssPath, 'utf-8');
    } catch (error) {
      this.logger.error(`Failed to read CSS file: ${error.message}`);
      throw new Error(`Failed to load custom CSS: ${error.message}`);
    }
  }

  private async convertWithWkhtmltopdf(
    htmlContent: string,
    cssContent: string,
  ): Promise<Buffer> {
    // Create temporary directory for files
    const tempDir = await mkdtemp(join(tmpdir(), 'pdf-export-'));
    const tempHtmlPath = join(tempDir, 'question-paper.html');
    const tempPdfPath = join(tempDir, 'question-paper.pdf');

    try {
      // Build complete HTML document with CSS
      const fullHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
${cssContent}
  </style>
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.css">
</head>
<body>
${htmlContent}
  
</body>
</html>
`;

      // Write HTML to temporary file
      await writeFile(tempHtmlPath, fullHtml, 'utf-8');
      this.logger.debug(`Created temporary HTML file: ${tempHtmlPath}`);

      // Convert HTML to PDF using wkhtmltopdf with file paths
      const pdfBuffer = await this.runWkhtmltopdf(tempHtmlPath, tempPdfPath);

      this.logger.debug(`Successfully created PDF: ${tempPdfPath}`);
      return pdfBuffer;
    } finally {
      // Clean up temporary files
      try {
        await unlink(tempHtmlPath);
        await unlink(tempPdfPath);
        this.logger.debug(`Cleaned up temporary files in: ${tempDir}`);
      } catch (cleanupError) {
        this.logger.warn(
          `Failed to clean up temporary files: ${cleanupError.message}`,
        );
      }
    }
  }

  private async runWkhtmltopdf(
    htmlPath: string,
    pdfPath: string,
  ): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      const wkhtmltopdf = spawn('wkhtmltopdf', [
        '--enable-local-file-access',
        '--enable-javascript',
        '--javascript-delay',
        '2000',
        '--no-stop-slow-scripts',
        '--page-size',
        'A4',
        '--encoding',
        'UTF-8',
        '--margin-top',
        '0.5in',
        '--margin-bottom',
        '0.5in',
        '--margin-left',
        '0.5in',
        '--margin-right',
        '0.5in',
        htmlPath,
        pdfPath,
      ]);

      const errorChunks: Buffer[] = [];

      wkhtmltopdf.stderr.on('data', (chunk) => {
        errorChunks.push(chunk);
      });

      wkhtmltopdf.on('error', (error) => {
        reject(
          new Error(`Failed to spawn wkhtmltopdf process: ${error.message}`),
        );
      });

      wkhtmltopdf.on('close', async (code) => {
        if (code !== 0) {
          const errorMessage = Buffer.concat(errorChunks).toString('utf-8');
          this.logger.error(`wkhtmltopdf error: ${errorMessage}`);
          reject(
            new Error(
              `wkhtmltopdf process exited with code ${code}: ${errorMessage}`,
            ),
          );
        } else {
          try {
            // Read the generated PDF file
            const fs = await import('fs/promises');
            const pdfBuffer = await fs.readFile(pdfPath);
            resolve(pdfBuffer);
          } catch (readError) {
            reject(
              new Error(`Failed to read generated PDF: ${readError.message}`),
            );
          }
        }
      });
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

    const questionPaperName = questionPaper.name || 'Question Paper';

    // Start building HTML content
    let html = `
<!-- Header Section -->
<h1>${this.escapeHtml(questionPaperName)}</h1>

<div class="header-info">
  <div class="header-info-row">
    <div class="header-info-left">
      <h6>Max. Marks: ${totalMarks}</h6>
    </div>
    <div class="header-info-right">
      <h6>Time Allowed: ${timeAllowed} minutes</h6>
    </div>
  </div>
</div>

<hr class="separator" />

<!-- Questions Table -->
<table>
  <thead>
    <tr>
      <th class="col-slno">Sl. No.</th>
      <th class="col-question">Question</th>
      <th class="col-marks">Marks</th>
    </tr>
  </thead>
  <tbody>
`;

    // Build questions in table format
    for (let index = 0; index < questionPaper.questions.length; index++) {
      const question = questionPaper.questions[index];
      const questionText = markedUtil(question.text || '');
      const marks = question.marks || 0;
      const slNo = index + 1;

      html += `
    <tr>
      <td class="col-slno">${slNo}</td>
      <td class="col-question">
        <div class="question-content">
          <div class="question-text">${questionText}</div>
`;

      // Add question images if they exist
      if (question.images && question.images.length > 0) {
        html += `\n          <div class="question-images">`;
        for (const questionImage of question.images) {
          if (questionImage.media && questionImage.media.id) {
            try {
              const imageUrl = await this.mediaService.getDownloadUrl(
                questionImage.media.id,
              );
              html += `\n            <img src="${imageUrl}" alt="Question Image" class="question-image" />`;
            } catch (error) {
              this.logger.warn(
                `Failed to get download URL for media ${questionImage.media.id}: ${error.message}`,
              );
            }
          }
        }
        html += `\n          </div>`;
      }

      // Add options if they exist
      if (question.options && question.options.length > 0) {
          html += `\n          <div class="options">`;
          const sortedOptions = [...question.options].sort(
            (a, b) => a.index - b.index,
          );
          sortedOptions.forEach((option, optionIndex) => {
            const optionLabel = String.fromCharCode(97 + optionIndex); // a, b, c, d...
            const optionText = markedUtil(option.text || '');
            html += `<div class="option"><span class="option-label">${optionLabel})</span> <span class="option-text">${optionText}</span></div>`;
          });
          html += `\n          </div>`;
      }

      // Add subquestions if they exist
      if (question.subQuestions && question.subQuestions.length > 0) {
        html += `\n          <div class="subquestions">`;
        const sortedSubQuestions = [...question.subQuestions].sort(
          (a, b) => a.index - b.index,
        );
        sortedSubQuestions.forEach((subQuestion, subIndex) => {
          const subQuestionText = markedUtil(subQuestion.text || '');
          const subQuestionLabel = String.fromCharCode(97 + subIndex); // a, b, c, ...
          html += `
            <div class="subquestion">
              <span class="subquestion-label">${subQuestionLabel})</span>
              <span class="subquestion-text">${subQuestionText}</span>`;

          // Add options for subquestion if they exist
          if (subQuestion.options && subQuestion.options.length > 0) {
              html += `\n              <div class="options">`;
              const sortedSubOptions = [...subQuestion.options].sort(
                (a, b) => a.index - b.index,
              );
              sortedSubOptions.forEach((option, optionIndex) => {
                const optionLabel = String.fromCharCode(97 + optionIndex);
                const optionText = markedUtil(option.text || '');
                html += `<div class="option"><span class="option-label">${optionLabel})</span> <span class="option-text">${optionText}</span></div>`;
              });
              html += `\n              </div>`;
          }

          html += `\n            </div>`;
        });
        html += `\n          </div>`;
      }

      html += `
        </div>
      </td>
      <td class="col-marks">${marks}</td>
    </tr>`;
    }

    // Close table
    html += `
  </tbody>
</table>
`;

    return html;
  }

  private escapeHtml(text: string): string {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }
}
