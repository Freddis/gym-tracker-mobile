import {schema} from '../../../db/schema';

export type NumericEntryKeys = Exclude<{
  [K in keyof typeof schema.entries.$inferInsert]: Exclude<typeof schema.entries.$inferInsert[K], null | undefined> extends number ? K : never
}[keyof typeof schema.entries.$inferInsert], undefined>
