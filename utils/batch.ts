export const batch = async <T, V>(items: V[], batchSize: number, callback: (items: V[]) => Promise<T[]>): Promise<T[]> => {
  const results: T[] = [];
  let offset = 0;
  while (offset < items.length) {
    const batch = await callback(items.slice(offset, offset + batchSize));
    results.push(...batch);
    offset += batchSize;
  }
  return results;
};
