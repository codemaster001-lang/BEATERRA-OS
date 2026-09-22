export type Pagination = { page: number; limit: number; offset: number };
export const toPagination = (page = 1, limit = 20): Pagination => ({ page, limit, offset: (page - 1) * limit });
