import type {Config} from 'drizzle-kit';
export default {
  schema: './db/schema/schema.ts',
  out: './db/migrations',
  dialect: 'sqlite',
  driver: 'expo', // <--- very important
} satisfies Config;
