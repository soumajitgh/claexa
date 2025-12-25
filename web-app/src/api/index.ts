// Import services from combined module files
import { accountService } from "./account";
import { mediaService } from "./media";
import { organizationService } from "./organization";
import { questionPaperService } from "./question-paper";
import { datamuseService } from "./datamuse";
import { questionSolverService } from "./question-solver";

/**
 * Main API object containing all services
 */
export const api = {
  account: accountService,
  media: mediaService,
  organization: organizationService,
  questionPapers: questionPaperService,
  datamuse: datamuseService,
  questionSolver: questionSolverService,
};

/**
 * API type for TypeScript inference
 */
export type Api = typeof api;

// Re-export core utilities and types
export { apiClient } from "./core/client";
export { ENDPOINTS } from "./core/endpoints";
export type { ApiResponse, ApiError, QueryParams } from "./core/types";

// Re-export services from combined module files
export { accountService } from "./account";
export { mediaService } from "./media";
export { organizationService } from "./organization";
export { questionPaperService } from "./question-paper";
export { datamuseService } from "./datamuse";
export { questionSolverService } from "./question-solver";

// Re-export all types from combined module files
export * from "./account";
export * from "./media";
export * from "./organization";
export * from "./question-paper";
export * from "./datamuse";
export * from "./question-solver";
export * from "./auth";
export * from "./common";
