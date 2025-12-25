export interface QuestionPattern {
  id: string;
  type: string;
  count: number;
  marksEach: number;
  difficulty: "very-easy" | "easy" | "medium" | "hard" | "very-hard";
  imageRequired: boolean;
  bloomLevel?: number;
  targetTopic?: string;
  subQuestions?: Array<{
    type: string;
    count: number;
    marksEach: number;
    bloomLevel?: number;
  }>;
}

export interface FormData {
  // Basic details
  course: string;
  audience: string;

  // School-specific fields
  board?: string;
  classLevel?: string;

  // Undergraduate/Postgraduate-specific fields
  degree?: string;
  collegeName?: string;

  // Topics
  topics: string[];

  // Question patterns
  questionPatterns: QuestionPattern[];

  // File uploads
  uploadedFiles: File[];
  mediaIds: string[];
}

export type FormStep = "details" | "topics" | "questions";

export interface FormStepProps {
  data: Partial<FormData>;
  onUpdate: (updates: Partial<FormData>) => void;
  onNext?: () => void;
  onPrev?: () => void;
}
