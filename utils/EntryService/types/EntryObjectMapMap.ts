import {EntryType} from '../../../openapi-client';
import {EntryAppObjectMap} from '../../../types/IEntryService';

export type EntryObjectMapMap = {
  [key in Exclude<EntryType, EntryType.POST | EntryType.MEAL | EntryType.CALORIE_GOAL>]: Map<number, EntryAppObjectMap[key]>;
}
