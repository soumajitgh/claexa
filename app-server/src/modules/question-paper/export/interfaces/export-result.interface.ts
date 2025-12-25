export enum ExportResultType {
  FILE = 'FILE',
  URL = 'URL',
}

export interface ExportResult {
  type: ExportResultType;
  // URL-based result
  url?: string;
  // File-based result
  file?: Buffer;
  fileName?: string;
  mimeType?: string;
}
