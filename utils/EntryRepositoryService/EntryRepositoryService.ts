
import {schema} from '../../db/schema';
import {EntryType, EntryVisibility} from '../../openapi-client';
import {BaseEntry} from '../../types/models/AppEntry';
import {DrizzleDb} from '../drizzle';
import {NumericEntryKeys} from '../EntryService/types/NumericEntryKeys';
import uuid from 'react-native-uuid';
import {EntryCreateParams} from './types/EntryCreateParams';
import {AuthUser} from '../../components/providers/AuthProvider/types/AuthUser';

export class EntryRepositoryService {
  async findOne(db: DrizzleDb, filter: {userId: number; before: Date; type: EntryType;}): Promise<BaseEntry| null> {
    const entry = await db.query.entries.findFirst({
      where: (t, op) => op.and(
        op.eq(t.userId, filter.userId),
        op.eq(t.type, filter.type),
        filter.before ? op.lt(t.time, filter.before) : undefined,
      ),
    });
    if (!entry) {
      return null;
    }
    const baseEntry: BaseEntry = {
      ...entry,
      image: null,
    };
    return baseEntry;
  }

  async create(
    db: DrizzleDb,
    user: AuthUser,
    type: EntryType,
    key: NumericEntryKeys,
    objectId: number,
    entry?: EntryCreateParams
  ): Promise<BaseEntry> {
    const value: typeof schema.entries.$inferInsert = {
      id: uuid.v4(),
      userId: user.id,
      type: type,
      time: entry?.time ?? new Date(),
      createdAt: new Date(),
      note: entry?.note,
      title: entry?.title,
      visibility: entry?.visibility ?? EntryVisibility.PUBLIC,
    };
    value[key] = objectId;

    const rows = await db.insert(schema.entries).values(value).returning();
    const insertedRow = rows[0];
    if (!insertedRow) {
      throw new Error('Failed to insert entry');
    }

    const baseEntry: BaseEntry = {
      ...insertedRow,
      image: null,
    };
    return baseEntry;
  }
}
