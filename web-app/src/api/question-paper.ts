import { ENDPOINTS } from "./core/endpoints";
import { apiClient } from "./core/client";
import { ApiResponse } from "./core/types";

// ============================================================================
// Types - Enums
// ============================================================================

/**
 * Question types supported by the system
 */
export enum QuestionType {
    TEXT = 'TEXT',
    MCQ = 'MCQ',
    NUMERIC = 'NUMERIC',
    TRUE_FALSE = 'TRUE_FALSE',
    FILL_IN_THE_BLANK = 'FILL_IN_THE_BLANK'
}

/**
 * Course types for question paper generation
 */
export enum CourseType {
    SCHOOL = 'SCHOOL',
    BACHELORS = 'BACHELORS',
    MASTERS = 'MASTERS',
    PHD = 'PHD',
    // Adding support for direct class specification format
    SCHOOL_CLASS1 = 'School-class1',
    SCHOOL_CLASS2 = 'School-class2',
    SCHOOL_CLASS3 = 'School-class3',
    SCHOOL_CLASS4 = 'School-class4',
    SCHOOL_CLASS5 = 'School-class5',
    SCHOOL_CLASS6 = 'School-class6',
    SCHOOL_CLASS7 = 'School-class7',
    SCHOOL_CLASS8 = 'School-class8',
    SCHOOL_CLASS9 = 'School-class9',
    SCHOOL_CLASS10 = 'School-class10',
    SCHOOL_CLASS11 = 'School-class11',
    SCHOOL_CLASS12 = 'School-class12',
}

// ============================================================================
// Types - Questions
// ============================================================================

/**
 * Option for MCQ questions matching the new DTO structure
 */
export interface QuestionOptionResponseDto {
    id: string;
    text: string;
}

/**
 * Sub-question within a compound question matching the new DTO structure
 */
export interface SubQuestionResponseDto {
    id: string;
    text: string;
    marks: number;
    options: QuestionOptionResponseDto[];
}

/**
 * Complete question response matching the new DTO structure
 */
export interface QuestionResponseDto {
    id: string;
    text: string;
    marks: number;
    imageMediaIds: string[];
    options: QuestionOptionResponseDto[];
    subQuestions: SubQuestionResponseDto[];
}

// Legacy type aliases for backward compatibility (deprecated)
/** @deprecated Use QuestionOptionResponseDto instead */
export type OptionResponse = QuestionOptionResponseDto;
/** @deprecated Use SubQuestionResponseDto instead */
export type SubQuestionResponse = SubQuestionResponseDto;
/** @deprecated Use QuestionResponseDto instead */
export type QuestionResponse = QuestionResponseDto;

// ============================================================================
// Types - Paper
// ============================================================================

/**
 * Complete question paper response matching the new DTO structure
 */
export interface QuestionPaperResponse {
    id: string;
    name: string;
    description: string | null;
    questions: QuestionResponseDto[];
}

/**
 * Question paper list item (without full questions)
 */
export interface QuestionPaperListResponse {
    id: string;
    name: string;
    description: string | null;
    totalQuestions: number;
    createdAt?: string;
}

/**
 * Raw API response for question paper list
 */
export interface QuestionPaperListApiResponse {
    id: string;
    name: string;
    itemCount: number;
    createdAt?: string;
    updatedAt?: string; // backend currently returns updatedAt but not createdAt for list
}

// ============================================================================
// Types - Generation
// ============================================================================

/**
 * Create question paper request
 */
export interface CreateQuestionPaperDto {
    name: string;
    description?: string;
}

/**
 * Sub question schema item for AI generation
 */
export interface SubQuestionSchemaItemDto {
    type: string;
    count: number;
    marksEach: number;
    bloomLevel?: number;
}

/**
 * Question schema item for AI generation
 */
export interface QuestionSchemaItemDto {
    type: string;
    count: number;
    marksEach: number;
    difficulty: string;
    imageRequired: boolean;
    bloomLevel?: number;
    filteredTopics?: string[];
    subQuestions?: SubQuestionSchemaItemDto[];
}

/**
 * Generate with AI request payload
 */
export interface GenerateWithAiDto {
    course: string;
    audience: string;
    topics: string[];
    mediaIds?: string[];
    itemSchema: QuestionSchemaItemDto[];
}

/**
 * Generate with AI response
 */
export interface GenerateWithAiResponseDto {
    id: string;
}

/**
 * Legacy generate question paper payload
 */
export interface GenerateQuestionPaperPayloadDto {
    courseName: string;
    topics: string[];
    courseType: string;
    difficultyLevel: number;
    questionPreferences: Array<{
        questionType: string;
        count: number;
        marksEach: number;
    }>;
    mediaIds?: string[];
}

/**
 * Google Form export response
 */
export interface GoogleFormExportResponse {
    formId: string;
    formUrl: string;
    message?: string;
}

/**
 * Legacy interface for backward compatibility
 * @deprecated Use GenerateWithAiDto instead
 */
export type AIGenerationRequest = GenerateWithAiDto;

/**
 * Legacy interface for backward compatibility
 * @deprecated Use QuestionSchemaItemDto instead
 */
export type ItemSchemaItem = QuestionSchemaItemDto;

// ============================================================================
// Types - Commands
// ============================================================================

/**
 * Question paper update identifiers for command-based API
 */
export type QPUpdateIdentifier =
    | 'question-paper.meta'
    | 'question-paper.update'
    | 'question-paper.question.create'
    | 'question-paper.question.update'
    | 'question-paper.question.delete'
    | 'question-paper.option.create'
    | 'question-paper.option.update'
    | 'question-paper.option.delete'
    | 'question-paper.sub-question.create'
    | 'question-paper.sub-question.update'
    | 'question-paper.sub-question.delete'
    | 'question-paper.sub-question.option.create'
    | 'question-paper.sub-question.option.update'
    | 'question-paper.sub-question.option.delete';

/**
 * Command response
 */
export interface QPCommandResponse {
    message: string;
}

// ============================================================================
// Service
// ============================================================================

export const questionPaperService = {
    /**
     * Get all question papers with pagination and sorting
     */
    async getAll({
        pageParam = 0,
        limit = 10,
        sortBy,
        sortDirection,
    }: {
        pageParam?: number;
        limit?: number;
        sortBy?: string;
        sortDirection?: string;
    } = {}): Promise<ApiResponse<QuestionPaperListResponse[]>> {
        const params: Record<string, unknown> = {
            offset: pageParam,
            limit,
        };
        if (sortBy) params.sortBy = sortBy;
        if (sortDirection) params.sortDirection = sortDirection;

        const queryParams = new URLSearchParams();
        Object.entries(params).forEach(([key, value]) => {
            if (value !== undefined && value !== null) {
                queryParams.append(key, String(value));
            }
        });
        const queryString = queryParams.toString();
        const url = `${ENDPOINTS.questionPapers.all}${queryString ? `?${queryString}` : ""}`;

        const response = (await apiClient.get<
            ApiResponse<QuestionPaperListApiResponse[]>
        >(url)) as unknown as ApiResponse<QuestionPaperListApiResponse[]>;

        // Transform the API response to match frontend expectations
        const transformedData: QuestionPaperListResponse[] = (
            response as ApiResponse<QuestionPaperListApiResponse[]>
        ).data.map((apiItem: QuestionPaperListApiResponse) => ({
            id: apiItem.id,
            name: apiItem.name,
            description: null,
            totalQuestions: apiItem.itemCount,
            // Backend list endpoint currently provides updatedAt but not createdAt.
            // Use createdAt if present; otherwise fall back to updatedAt so UI can show a date.
            createdAt: apiItem.createdAt ?? apiItem.updatedAt,
        }));

        return {
            ...(response as unknown as ApiResponse<QuestionPaperListApiResponse[]>),
            data: transformedData,
        };
    },

    /**
     * Get question paper by ID - now returns the new DTO structure directly
     */
    async getById(id: string): Promise<ApiResponse<QuestionPaperResponse>> {
        const response = await apiClient.get<ApiResponse<QuestionPaperResponse>>(
            ENDPOINTS.questionPapers.byId(id)
        );
        return response as unknown as ApiResponse<QuestionPaperResponse>;
    },

    /**
     * Create new question paper
     */
    async create(
        data: CreateQuestionPaperDto,
    ): Promise<ApiResponse<QuestionPaperResponse>> {
        const response = await apiClient.post<ApiResponse<QuestionPaperResponse>>(
            ENDPOINTS.questionPapers.create,
            data,
        );
        return response as unknown as ApiResponse<QuestionPaperResponse>;
    },

    /**
     * Delete question paper
     */
    async delete(id: string): Promise<ApiResponse<void>> {
        const response = await apiClient.delete<unknown>(
            ENDPOINTS.questionPapers.byId(id),
        );

        // Backend returns 204 No Content; axios interceptor gives '' or undefined
        if (
            (response as unknown) === "" ||
            (response as unknown) === undefined ||
            (response as unknown) === null
        ) {
            return { success: true, data: undefined } as ApiResponse<void>;
        }
        // If already in expected ApiResponse shape just return
        if (
            typeof response === "object" &&
            response !== null &&
            "success" in response
        ) {
            return response as unknown as ApiResponse<void>;
        }
        // Fallback: wrap into ApiResponse
        return { success: true, data: undefined } as ApiResponse<void>;
    },

    /**
     * Generate question paper
     */
    async generate(
        data: GenerateQuestionPaperPayloadDto,
    ): Promise<ApiResponse<QuestionPaperResponse>> {
        const response = await apiClient.post<ApiResponse<QuestionPaperResponse>>(
            ENDPOINTS.questionPapers.generate,
            data,
        );
        return response as unknown as ApiResponse<QuestionPaperResponse>;
    },

    /**
     * Generate question paper with AI
     */
    async generateWithAI(data: GenerateWithAiDto): Promise<ApiResponse<QuestionPaperResponse>> {
        const response = await apiClient.post<ApiResponse<QuestionPaperResponse>>(
            ENDPOINTS.questionPapers.generateWithAI,
            data,
        );
        return response as unknown as ApiResponse<QuestionPaperResponse>;
    },

    /**
     * Export question paper as DOCX
     */
    async exportQuestionPaperDocx(id: string): Promise<Blob> {
        const response = await apiClient.get<Blob>(
            ENDPOINTS.questionPapers.exportDocx(id),
            {
                headers: { Accept: "*/*" },
                responseType: "blob",
            },
        );
        return response as unknown as Blob;
    },

    /**
     * Export question paper as PDF
     */
    async exportQuestionPaperPdf(id: string): Promise<Blob> {
        const response = await apiClient.get<Blob>(
            ENDPOINTS.questionPapers.exportPdf(id),
            {
                headers: { Accept: "*/*" },
                responseType: "blob",
            },
        );
        return response as unknown as Blob;
    },

    /**
     * Generic command-based updater
     */
    async updateByIdentifier(
        questionPaperId: string,
        identifier: QPUpdateIdentifier,
        data: Record<string, unknown>,
    ): Promise<QPCommandResponse> {
        const response = await apiClient.patch<QPCommandResponse>(
            ENDPOINTS.questionPapers.byId(questionPaperId),
            {
                identifier,
                data,
            },
        );
        return response as unknown as QPCommandResponse;
    },

    /**
     * Update question paper meta (name/description)
     */
    async updateQuestionPaperMetadata(
        id: string,
        data: { name?: string; description?: string },
    ): Promise<QPCommandResponse> {
        // Backend uses `name` and `description` directly
        const payload: Record<string, string> = {};
        if (data.name !== undefined) payload.name = data.name;
        if (data.description !== undefined) payload.description = data.description;
        return this.updateByIdentifier(id, "question-paper.meta", payload);
    },

    // Question commands
    async createQuestionCmd(
        questionPaperId: string,
        payload: { text: string; index: number; marks: number },
    ): Promise<QPCommandResponse> {
        return this.updateByIdentifier(
            questionPaperId,
            "question-paper.question.create",
            payload,
        );
    },

    async updateQuestionCmd(
        questionPaperId: string,
        payload: {
            questionId: string;
            text?: string;
            index?: number;
            marks?: number;
        },
    ): Promise<QPCommandResponse> {
        return this.updateByIdentifier(
            questionPaperId,
            "question-paper.question.update",
            payload,
        );
    },

    async deleteQuestionCmd(
        questionPaperId: string,
        payload: { questionId: string },
    ): Promise<QPCommandResponse> {
        return this.updateByIdentifier(
            questionPaperId,
            "question-paper.question.delete",
            payload,
        );
    },

    // Option commands
    async createOptionCmd(
        questionPaperId: string,
        payload: { questionId: string; text: string; index: number },
    ): Promise<QPCommandResponse> {
        return this.updateByIdentifier(
            questionPaperId,
            "question-paper.option.create",
            payload,
        );
    },

    async updateOptionCmd(
        questionPaperId: string,
        payload: { optionId: string; text?: string; index?: number },
    ): Promise<QPCommandResponse> {
        return this.updateByIdentifier(
            questionPaperId,
            "question-paper.option.update",
            payload,
        );
    },

    async deleteOptionCmd(
        questionPaperId: string,
        payload: { optionId: string },
    ): Promise<QPCommandResponse> {
        return this.updateByIdentifier(
            questionPaperId,
            "question-paper.option.delete",
            payload,
        );
    },

    // Sub-question commands
    async createSubQuestionCmd(
        questionPaperId: string,
        payload: { questionId: string; text: string; index: number; marks: number },
    ): Promise<QPCommandResponse> {
        return this.updateByIdentifier(
            questionPaperId,
            "question-paper.sub-question.create",
            payload,
        );
    },

    async updateSubQuestionCmd(
        questionPaperId: string,
        payload: {
            subQuestionId: string;
            text?: string;
            index?: number;
            marks?: number;
        },
    ): Promise<QPCommandResponse> {
        return this.updateByIdentifier(
            questionPaperId,
            "question-paper.sub-question.update",
            payload,
        );
    },

    async deleteSubQuestionCmd(
        questionPaperId: string,
        payload: { subQuestionId: string },
    ): Promise<QPCommandResponse> {
        return this.updateByIdentifier(
            questionPaperId,
            "question-paper.sub-question.delete",
            payload,
        );
    },

    // Sub-question option commands
    async createSubQuestionOptionCmd(
        questionPaperId: string,
        payload: { subQuestionId: string; text: string; index: number },
    ): Promise<QPCommandResponse> {
        return this.updateByIdentifier(
            questionPaperId,
            "question-paper.sub-question.option.create",
            payload,
        );
    },

    async updateSubQuestionOptionCmd(
        questionPaperId: string,
        payload: { optionId: string; text?: string; index?: number },
    ): Promise<QPCommandResponse> {
        return this.updateByIdentifier(
            questionPaperId,
            "question-paper.sub-question.option.update",
            payload,
        );
    },

    async deleteSubQuestionOptionCmd(
        questionPaperId: string,
        payload: { optionId: string },
    ): Promise<QPCommandResponse> {
        return this.updateByIdentifier(
            questionPaperId,
            "question-paper.sub-question.option.delete",
            payload,
        );
    },
};
