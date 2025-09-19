import {AsyncDrizzleDb, createDrizzle} from './drizzle';

let trxArr: AsyncDrizzleDb[] = [];
export async function transactionAsync<T>(
  db: AsyncDrizzleDb,
  transactionCallback: (tx: AsyncDrizzleDb) => Promise<T>
) {
  const wrappedTransactionCallback = async (tx: AsyncDrizzleDb) => {
    try {
      return await transactionCallback(tx);
    } catch (e: unknown) {
      console.log('Rolling back trx');
      throw e;
    }
  };
  let result: T;
  if (trxArr.find((x) => x === db)) {
    console.log('Reusing trx');
    const result = await wrappedTransactionCallback(db);
    console.log('Ended reused trx');
    return result;
  }
  console.log('Starting trx');

  await db.$client.withExclusiveTransactionAsync(async (tx) => {
    const tmpDrizzle = createDrizzle(tx);
    trxArr.push(tmpDrizzle);
    result = await wrappedTransactionCallback(tmpDrizzle);
    trxArr = trxArr.filter((x) => x !== db);
  });
  console.log('Ending trx');
  return result!;
}
