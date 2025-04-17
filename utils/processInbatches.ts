
export const processInBatches = async <T,X>(arr: T[], batchSize: number, callback: (arr:T[]) => Promise<X[]>): Promise<X[]> => {
  let currentIndex = 0;
  let rows: T[] = []
  const result: X[] = []
  if(arr.length === 0){
    return result
  }
  do {
    const from = (currentIndex++)*batchSize;
    const to = from + batchSize;
    rows = arr.slice(from,to)
    const res = await callback(rows)
    result.push(...res)
  } while(rows.length >= batchSize)
  return result;
}