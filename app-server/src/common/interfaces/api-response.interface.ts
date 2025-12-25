export interface Pagination {
  total: number;
  limit: number;
  offset: number;
  nextPage: number;
}

export interface MetaResponse {
  pagination?: Pagination;
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
  meta?: MetaResponse;
}
