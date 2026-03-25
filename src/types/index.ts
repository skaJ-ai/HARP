/**
 * Shared type definitions
 * 프로젝트 전역에서 사용하는 공통 타입
 */

/** API response wrapper */
interface ApiResponse<T> {
  data: T;
  message: string;
  status: number;
}

/** Pagination parameters */
interface PaginationParams {
  limit: number;
  page: number;
}

/** Paginated response */
interface PaginatedResponse<T> {
  items: T[];
  page: number;
  totalItems: number;
  totalPages: number;
}

export type { ApiResponse, PaginatedResponse, PaginationParams };
