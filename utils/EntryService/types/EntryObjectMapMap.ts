import {EntryType} from '../../../openapi-client';
import {EntryAppObjectMap} from '../../../types/IEntryService';

export type EntryObjectMapMap = {
  [key in EntryType]: Map<number, EntryAppObjectMap[key]>;
}
