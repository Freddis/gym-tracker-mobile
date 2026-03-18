import {schema} from '../../db/schema';

export type AppWeight = typeof schema.weight.$inferSelect
