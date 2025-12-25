import { z } from "zod";

const questionPatternSchema = z.object({
  id: z.string(),
  type: z.string().min(1, "Question type is required"),
  count: z.number().min(1, "Count must be at least 1"),
  marksEach: z.number().min(1, "Marks must be at least 1"),
  difficulty: z.enum(["very-easy", "easy", "medium", "hard", "very-hard"], {
    required_error: "Difficulty is required",
  }),
  imageRequired: z.boolean().default(false),
  bloomLevel: z.number().int().min(1).max(6).optional(),
  targetTopic: z.string().optional(),
  subQuestions: z
    .array(
      z.object({
        type: z.string().min(1, "Question type is required"),
        count: z.number().min(1, "Count must be at least 1"),
        marksEach: z.number().min(1, "Marks must be at least 1"),
        bloomLevel: z.number().int().min(1).max(6).optional(),
      }),
    )
    .optional(),
});

const baseFormSchema = z.object({
  // Basic details
  course: z.string().min(1, "Course name is required"),
  audience: z.string().min(1, "Institution type is required"),

  // School-specific fields
  board: z.string().optional(),
  classLevel: z.string().optional(),

  // Undergraduate/Postgraduate-specific fields
  degree: z.string().optional(),
  collegeName: z.string().optional(),

  // Topics
  topics: z.array(z.string()).min(1, "At least one topic is required"),

  // Question patterns
  questionPatterns: z
    .array(questionPatternSchema)
    .min(1, "At least one question pattern is required"),

  // File uploads
  uploadedFiles: z.array(z.any()).default([]),
  mediaIds: z.array(z.string()).default([]),
});

export const formDataSchema = baseFormSchema.superRefine((data, ctx) => {
  // School validation
  if (data.audience?.toLowerCase() === "school") {
    if (!data.board) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Board is required for school",
        path: ["board"],
      });
    }
    if (!data.classLevel) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Class is required for school",
        path: ["classLevel"],
      });
    }
  }

  // Undergraduate/Postgraduate validation
  const isUndergraduate = data.audience?.toLowerCase() === "undergraduate";
  const isPostgraduate = data.audience?.toLowerCase() === "postgraduate";
  
  if (isUndergraduate || isPostgraduate) {
    if (!data.degree || data.degree.trim() === "") {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Degree is required",
        path: ["degree"],
      });
    }
    // collegeName is optional - no validation needed
  }

  // File upload validation is now optional - empty arrays are allowed
});

// Step-specific schemas for validation
export const detailsStepSchema = baseFormSchema
  .pick({
    course: true,
    audience: true,
    board: true,
    classLevel: true,
    degree: true,
    collegeName: true,
    uploadedFiles: true,
    mediaIds: true,
  })
  .superRefine((data, ctx) => {
    // School validation
    if (data.audience?.toLowerCase() === "school") {
      if (!data.board) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Board is required for school",
          path: ["board"],
        });
      }
      if (!data.classLevel) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Class is required for school",
          path: ["classLevel"],
        });
      }
    }

    // Undergraduate/Postgraduate validation
    const isUndergraduate = data.audience?.toLowerCase() === "undergraduate";
    const isPostgraduate = data.audience?.toLowerCase() === "postgraduate";
    
    if (isUndergraduate || isPostgraduate) {
      if (!data.degree || data.degree.trim() === "") {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Degree is required",
          path: ["degree"],
        });
      }
      // collegeName is optional - no validation needed
    }

    // File upload validation is now optional - empty arrays are allowed
  });

export const topicsStepSchema = baseFormSchema.pick({
  topics: true,
});

export const questionsStepSchema = baseFormSchema.pick({
  questionPatterns: true,
});

export const filesStepSchema = baseFormSchema.pick({
  uploadedFiles: true,
  mediaIds: true,
});

export type FormData = z.infer<typeof formDataSchema>;
export type QuestionPattern = z.infer<typeof questionPatternSchema>;

// Legacy export for compatibility (can be removed later)
export const generateQuestionPaperSchema = formDataSchema;
export type GenerateQuestionPaperFormSchema = FormData;
