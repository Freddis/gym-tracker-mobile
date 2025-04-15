
export const processInBatches = async <T>(arr: T[], batchSize: number, callback: (arr:T[]) => Promise<boolean>): Promise<boolean> => {
  let currentIndex = 0;
  let rows: T[] = []
  do {
    const from = (currentIndex++)*batchSize;
    const to = from + batchSize;
    rows = arr.slice(from,to)
    const result = await callback(rows)
    if(!result){
      return false;
    }
  } while(rows.length >= batchSize)
  return true;
}