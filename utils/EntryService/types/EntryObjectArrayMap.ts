import {EntryType} from '../../../openapi-client';
import {EntryObjectMap} from '../../../types/IEntryService';

export type EntryObjectArrayMap = {
  [key in Exclude<EntryType, EntryType.POST | EntryType.MEAL | EntryType.CALORIE_GOAL>]: [string, EntryObjectMap[key]][]
}

