import {schema} from '@/db/schema';

export type ExerciseRow = typeof schema.exercises.$inferSelect
