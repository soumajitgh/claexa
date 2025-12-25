// ============================================================================
// Common API Types
// ============================================================================

/**
 * Common API response structure
 */
export interface ApiResponse<T> {
    success: boolean;
    data: T;
    meta?: ApiMetaResponse;
}

/**
 * API metadata for pagination
 */
export interface ApiMetaResponse {
    pagination: {
        offset: number;
        limit: number;
        total: number;
        nextPage?: number;
    };
}

/**
 * Standard error response
 */
export interface ApiError {
    message: string;
    status?: number;
    code?: string;
}

/**
 * Pagination parameters for requests
 */
export interface PaginationParams {
    pageParam?: number;
    limit?: number;
    offset?: number;
}

/**
 * Sorting parameters
 */
export interface SortingParams {
    sortBy?: string;
    sortDirection?: 'asc' | 'desc';
}

/**
 * Common query parameters
 */
export interface QueryParams extends PaginationParams, SortingParams {
    [key: string]: unknown;
}
