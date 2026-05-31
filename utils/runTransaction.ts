import {sql} from 'drizzle-orm';
import {AsyncDrizzleDb} from './drizzle';
// drizzle doesn't work properly with sqlite transactions:
// https://github.com/drizzle-team/drizzle-orm/issues/2275
// this transaction implementation reuses the same db instance for the entire transaction
// i think there will be bug, since as i use it right now, it requires a new connection, so it's one extra connection each transaction
// todo: come up with proper way to handle this. Ideally we want connection pool with ability to have parallel transactions
type TxContext = {
  depth: number;
  active: boolean;
};
const txContextMap = new WeakMap<AsyncDrizzleDb, TxContext>();
function getContext(db: AsyncDrizzleDb): TxContext {
  let ctx = txContextMap.get(db);
  if (!ctx) {
    ctx = {depth: 0, active: false};
    txContextMap.set(db, ctx);
  }
  return ctx;
}
export async function transactionAsync<T>(
  db: AsyncDrizzleDb,
  executor: (db: AsyncDrizzleDb) => Promise<T>
): Promise<T> {
  const ctx = getContext(db);
  const isRoot = ctx.depth === 0;

  ctx.depth++;

  try {
    if (isRoot) {
      ctx.active = true;
      db.run(sql`BEGIN`);
    }

    const result = await executor(db);

    ctx.depth--;

    if (isRoot) {
      db.run(sql`COMMIT`);
      ctx.active = false;
    }

    return result;
  } catch (error) {
    ctx.depth--;

    if (isRoot && ctx.active) {
      db.run(sql`ROLLBACK`);
      ctx.active = false;
    }

    throw error;
  }
}
