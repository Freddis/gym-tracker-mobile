import {EntryType} from '../../../openapi-client';
import {EntryObjectMap} from '../../../types/IEntryService';

export type EntryObjectArrayMap = {
  [key in EntryType]: [string, EntryObjectMap[key]][]
}

