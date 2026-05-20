export type LiveQueryQueryResult<T> = {
  data: T | undefined;
  error: Error | undefined;
  updatedAt: Date | undefined;
}
