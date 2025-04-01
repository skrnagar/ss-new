
export interface PaginationParams {
  limit?: number;
  cursor?: string;
}

export function getPaginationQuery(params: PaginationParams) {
  const limit = params.limit || 10;
  const query = params.cursor 
    ? `created_at.lt.${params.cursor}`
    : undefined;
    
  return {
    limit,
    query,
    orderBy: 'created_at',
    ascending: false
  };
}
