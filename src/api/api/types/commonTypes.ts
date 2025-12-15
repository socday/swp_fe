// Common/shared contracts

export interface ApiMessageResponse {
  message: string;
  [key: string]: unknown;
}

export interface PagedResult<T> {
  items: T[];
  totalRecords: number;
  pageIndex: number;
  pageSize: number;
}
