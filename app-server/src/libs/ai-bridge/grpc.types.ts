import { Observable } from 'rxjs';

// Request messages
export interface SubQuestionSchemaItem {
  type: string;
  count: number;
  marks_each: number;
  bloom_level: number; // 0 when not provided
}

export interface QuestionSchemaItem {
  type: string;
  count: number;
  marks_each: number;
  image_required?: boolean;
  difficulty?: string; // very_easy|easy|medium|hard|very_hard
  bloom_level?: number; // 0 when not provided
  filtered_topics?: string[];
  sub_questions?: SubQuestionSchemaItem[];
}

export interface QuestionPaperGenerateRequest {
  course: string;
  audience: string;
  topics: string[];
  user_reference_media_urls?: string[];
  item_schema: QuestionSchemaItem[];
}

// Response messages
export interface QuestionOption {
  text: string;
}
export interface QuestionImage {
  base64_image: string;
}

export interface SubQuestion {
  text: string;
  marks: number;
  options?: QuestionOption[];
}

export interface Question {
  text: string;
  marks: number;
  bloom_level: number;
  options?: QuestionOption[];
  images?: QuestionImage[];
  sub_questions?: SubQuestion[];
}

export interface QuestionPaper {
  name: string;
  questions: Question[];
}

export interface QuestionPaperGenerateResponse {
  question_paper: QuestionPaper;
}

// gRPC service interfaces
export interface QuestionPaperService {
  Generate(
    data: QuestionPaperGenerateRequest,
  ): Observable<QuestionPaperGenerateResponse>;
}

export interface ImageService {
  Generate(data: {
    prompt: string;
    num_images: number;
    model: string;
  }): Observable<{ images: { image_bytes: Buffer; prompt: string }[] }>;
}

// Health check service (from proto HealthService)
export type ServingStatus =
  | 'UNKNOWN'
  | 'SERVING'
  | 'NOT_SERVING'
  | 'SERVICE_UNKNOWN';

export interface HealthCheckRequest {
  service?: string;
}

export interface HealthCheckResponse {
  status: ServingStatus;
}

export interface HealthService {
  Check(data: HealthCheckRequest): Observable<HealthCheckResponse>;
}
